import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ClientOnly } from "remix-utils/client-only";
import { Editor, Range } from 'slate';
import { useFocused, useSlate } from 'slate-react';
import { isMarkActive, toggleMark } from './common';

export const FloatingToolbar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  const isFocus = useFocused();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const { selection } = editor;
    if (
      !selection ||
      !isFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      element.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection()!;
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    if (rect.top < window.innerHeight / 2) {
      element.style.top = `${rect.top + window.scrollY + rect.height + 4}px`;
    } else {
      element.style.top = `${rect.top + window.scrollY - element.offsetHeight - 4}px`;
    }

    const left = rect.left + window.scrollX - element.offsetWidth / 2 + rect.width / 2;
    if (left + element.offsetWidth > window.innerWidth) {
      element.style.right = '1em';
    } else {
      element.style.left = `${left}px`;
    }
    element.style.opacity = '1';
  });

  const Toolbar = () => <div
    ref={ref}
    un-position='absolute'
    un-border='rounded 1 black'
    un-text='2xl'
    un-flex='~'
    un-p='x-2 y-1'
    un-opacity='0'
    un-transition='opacity 750'
    un-bg='white'
    onMouseDown={e => e.preventDefault()}
  >
    <FormatButton format='bold' />
    <FormatButton format='italic' />
    <FormatButton format='underline' />
  </div>;

  return <ClientOnly>
    {() => createPortal(<Toolbar />, document.body)}
  </ClientOnly>;
};

const icons = {
  bold: 'i-radix-icons:font-bold',
  italic: 'i-radix-icons:font-italic',
  underline: 'i-tabler:underline',
};
const FormatButton = ({ format }: { format: 'bold' | 'italic' | 'underline'; }) => {
  const editor = useSlate();
  return <div className={icons[format]}
    un-color={`${isMarkActive(editor, format) ? 'blue' : ''}`}
    onClick={() => toggleMark(editor, format)}
    un-cursor='pointer'
  />;
};