import { Popover } from 'antd';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { DefaultDropDown } from '~/components/slate/plugin/drop-down/default-drop-down';
import { dropDownActionAtom, dropDownNavigationEffect } from '~/components/slate/plugin/drop-down/drop-down';

const keyActionMap = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'enter',
  ' ': 'space',
} as const;

const Bar = () => {
  const [inputValue, setInputValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const setDropDownAction = useSetAtom(dropDownActionAtom);
  useAtom(dropDownNavigationEffect);

  useEffect(() => ref.current?.focus(), []);

  useEffect(() => {
    if (mirrorRef.current && ref.current) {
      const mirrorWidth = mirrorRef.current.offsetWidth;
      ref.current.style.width = `${mirrorWidth + 20}px`;
    }
  }, [inputValue]);

  return <Popover content={<DefaultDropDown />} arrow={false} open placement='bottomLeft' >
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
        value={inputValue}
        onChange={evengt => setInputValue(evengt.target.value)}
        onKeyDown={event => {
          Object.keys(keyActionMap).includes(event.key) && setDropDownAction(keyActionMap[event.key as keyof typeof keyActionMap]);
        }}
      />
      <span ref={mirrorRef}
        un-position='absolute'
        un-invisible='~'
        un-whitespace='pre'
      >{inputValue}</span>
    </div>
  </Popover>;
};

const Foo = () => {
  const [editor] = useState(() => (withReact(createEditor())));

  return <ClientOnly>{
    () => <div un-m='2' un-border='~ solid purple-200'>
      <Slate editor={editor} initialValue={[]} >
        <Bar />
      </Slate>
    </div>
  }</ClientOnly>;
};

export default Foo;