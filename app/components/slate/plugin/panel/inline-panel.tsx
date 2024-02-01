import { Popover } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlateStatic } from 'slate-react';

const UnoStaticTrick = () => <div un-shadow='[0_0_0_3px_#b4d5ff]' ></div>;

export const InlinePanelType = 'inline-panel';

export const insertPanelText = (editor: Editor, text: string) => {
  if (text === '/') {
    Transforms.insertNodes(
      editor,
      {
        type: InlinePanelType,
        meta: { active: true },
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

  useEffect(() => ref.current?.focus(), []);

  useEffect(() => {
    if (mirrorRef.current && ref.current) {
      const mirrorWidth = mirrorRef.current.offsetWidth;
      ref.current.style.width = `${mirrorWidth + 20}px`;
    }
  }, [inputValue]);

  const content = <div>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
  </div>;

  return <Popover content={content} arrow={false} open placement='bottomLeft' >
    <div un-position='relative' >
      <span un-position='absolute'
        un-left='6px'
        un-top='1.5px'
      >
        /
      </span>
      <input ref={ref}
        un-outline='none'
        un-border='2px solid focus:blue-5 rounded'
        un-shadow='focus:[0_0_5px_#007bff]'
        un-pl='10px'
        onClick={event => event.stopPropagation()}
        value={inputValue}
        onChange={evengt => setInputValue(evengt.target.value)}
      />
      <span ref={mirrorRef}
        un-position='absolute'
        un-invisible='~'
        un-whitespace='pre'
      >{inputValue}</span>
    </div>
  </Popover>;
};

type InlinePanelMeta = {
  active: boolean;
};

export const InlinePanel = ({ children, attributes, element }: RenderElementProps) => {
  const editor = useSlateStatic();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const meta: InlinePanelMeta = (element as any).meta;
  console.log(meta);

  return <span {...attributes} >
    {children}
    <span un-shadow={`${isSelected && isFocused && '[0_0_0_3px_#b4d5ff]'}`}
      un-cursor='pointer'
      contentEditable={false}
      onClick={() => {
        console.log('toggle active for inline-panel');

        const path = ReactEditor.findPath(editor, element);
        Transforms.setNodes(editor, { meta: { active: !meta.active } } as Partial<Node>, { at: path });
      }}
    >
      {meta.active && <ActivePanel />}
      {!meta.active && '/'}
      {/* <Popover content={<PanelContent />} open={meta.active} arrow={false} >
        <input />
      </Popover> */}
    </span>
  </span>;
};

export const inlinePanelDummyData = [{
  type: 'p',
  children: [
    {
      type: InlinePanelType,
      meta: { active: false } as InlinePanelMeta,
      children: [{ text: '' }],
    }
  ]
}];