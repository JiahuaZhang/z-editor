import { Popover } from 'antd';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlateStatic } from 'slate-react';
import { DefaultDropDown } from '../drop-down/default-drop-down';
import { dropDownMessageAtom, dropDownNavigationEffect } from '../drop-down/drop-down';

const UnoStaticTrick = () => <div un-shadow='[0_0_0_3px_#b4d5ff]' ></div>;

export const InlinePanelType = 'inline-panel';

const keyActionMap = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'enter',
  ' ': 'space-trigger',
} as const;

export const insertPanelText = (editor: Editor, text: string) => {
  if (text === '/') {
    Transforms.insertNodes(
      editor,
      {
        type: InlinePanelType,
        state: { active: true },
        children: [{ text: '' }],
      } as any
    );
    return true;
  }
  return false;
};

const PanelContent = () => {
  // const ref = useRef<HTMLInputElement>(null);

  // useEffect(() => ref.current?.focus(), []);

  return <div>
    {/* <input ref={ref}
      type="text"
      placeholder="search"
      un-outline='none'
      un-border='2px solid focus:blue-5 rounded'
      un-shadow='focus:[0_0_5px_#007bff]'
      un-px='2'
      un-py='1' /> */}
    internal panel
  </div>;
};

const ActivePanel = () => {
  const [inputValue, setInputValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  useAtom(dropDownNavigationEffect);
  const [dropdownMessage, setDropDownMessage] = useAtom(dropDownMessageAtom);

  useEffect(() => ref.current?.focus(), []);

  useEffect(() => {
    if (mirrorRef.current && ref.current) {
      const mirrorWidth = mirrorRef.current.offsetWidth;
      ref.current.style.width = `${mirrorWidth + 20}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (dropdownMessage === 'space') {
      setInputValue(prev => `${prev} `);
      setDropDownMessage('');
    }
  }, [dropdownMessage]);

  return <Popover content={<DefaultDropDown />} arrow={false} open placement='bottomLeft' >
    <span un-position='relative' >
      <span un-position='absolute'
        un-left='6px'
        un-top='-2px'
      >
        /
      </span>
      <input ref={ref}
        un-outline='none'
        un-border='2px solid focus:blue-5 rounded'
        un-shadow='focus:[0_0_5px_#007bff]'
        un-pl='11px'
        onClick={event => event.stopPropagation()}
        value={inputValue}
        onChange={evengt => setInputValue(evengt.target.value)}
        onKeyDown={event => {
          const { key, target } = event;
          const { selectionStart, value } = target as HTMLInputElement;
          if (key === ' ') {
            if (selectionStart === value.length) {
              event.preventDefault();
            } else {
              return;
            }
          }
          Object.keys(keyActionMap).includes(event.key) && setDropDownMessage(keyActionMap[event.key as keyof typeof keyActionMap]);
        }}
      />
      <span ref={mirrorRef}
        un-position='absolute'
        un-invisible='~'
        un-whitespace='pre'
      >{inputValue}</span>
    </span>
  </Popover>;
};

type InlinePanelState = {
  active: boolean;
};

type InlinePanelData = {};

export const InlinePanel = ({ children, attributes, element }: RenderElementProps) => {
  const editor = useSlateStatic();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const inlinePanelState: InlinePanelState = (element as any).state;

  return <span {...attributes} >
    {children}
    <span un-shadow={`${isSelected && isFocused && '[0_0_0_3px_#b4d5ff]'}`}
      un-cursor='pointer'
      contentEditable={false}
      onClick={() => {
        const path = ReactEditor.findPath(editor, element);
        Transforms.setNodes(editor, { state: { active: !inlinePanelState.active } } as Partial<Node>, { at: path });
      }}
    >
      {inlinePanelState.active && <ActivePanel />}
      {!inlinePanelState.active && '/'}
    </span>
  </span>;
};

export const inlinePanelDummyData = [{
  type: 'p',
  children: [
    { text: ' ' },
    {
      type: InlinePanelType,
      state: { active: false } as InlinePanelState,
      children: [{ text: '' }],
    },
    { text: ' ' },
  ]
}];