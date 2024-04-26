import { useEffect, useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Displayer } from './displayer';
import { DataManager } from './manager';
import { RichData } from './type';

export const RichTextEditor = ({ initData, ...rest }: { initData: RichData[]; }) => {
  const dataManager = new DataManager(initData);

  return <ClientOnly>{() =>
    <InternalEditor dataManager={dataManager}  {...rest} />}
  </ClientOnly>;
};

const InternalEditor = ({ dataManager, ...rest }: { dataManager: DataManager; }) => {
  const [key, setKey] = useState(0);
  const [focusId, setFocusId] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusId) return;

    const element = document.getElementById(focusId)!;
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
    element.focus();

    setFocusId('');
  }, [key]);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new MutationObserver((mutations) => {
      if (mutations.length === 1) {
        const mutation = mutations[0];
        if (mutation.type === 'characterData') {
          dataManager.updateSpanText(mutation.target.parentElement?.id!, mutation.target.textContent!);
          console.log(dataManager.toString());
        }
      } else if (mutations.length === 3
        && !mutations.some(m => m.type !== 'childList')
        && mutations[0].addedNodes[0] === mutations[1].target
        && mutations[1].addedNodes[0] === mutations[2].target) {
        // insert break at the end / start of block
        console.log(mutations);
        if ((mutations[0].addedNodes[0] as HTMLElement).id === (mutations[0].nextSibling as HTMLElement).id) {
          const element = mutations[0].addedNodes[0] as HTMLElement;
          const dataNode = dataManager.insertEnterAtStart(element.id!);
          console.log(dataManager.toString());
          setFocusId(dataNode.child?.node?.id!);
          setKey(prev => prev + 1);
        }
      }
    });
    observer.observe(ref.current, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });

    return () => { observer.disconnect(); console.log('disconnect'); };
  }, [ref.current]);

  return <div
    un-border='rounded'
    un-p='2'
    un-outline='2 solid gray-4 focus-visible:blue-4'
    ref={ref}
    key={key}
    contentEditable
    suppressContentEditableWarning
    {...rest}
  >
    {dataManager.toData().map((data) => <Displayer richData={data} key={data.id} />)}
    {/* {richData.map((data) => <Displayer richData={data} key={data.id} />)} */}
  </div>;
};