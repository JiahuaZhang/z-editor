import { Popover } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';

const Bar = () => {
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
    <div>5</div>
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

const Foo = () => <ClientOnly>{
  () => <div un-m='2' un-border='~ solid purple-200'>
    <Bar />
  </div>
}</ClientOnly>;

export default Foo;