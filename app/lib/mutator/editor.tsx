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
          return;
        }
      } else if (mutations.length === 2) {
        // special case of insert character
        // after insert a break, then typing a character, would trigger adding #text
        if (mutations[0].type === 'childList' && mutations[1].type === 'characterData') {
          dataManager.updateSpanText(mutations[1].target.parentElement?.id!, mutations[1].target.textContent!);
          return;
        }

        // need to handle another insert enter case
        // when current selection is empy <span></span>, would trigger this case with only 2 mutations
        if (mutations[0].type === 'childList'
          && mutations[1].type === 'childList'
          && mutations[1].addedNodes[0].nodeName === 'BR'
          && mutations[0].addedNodes[0] === mutations[1].target) {
          const element = mutations[0].addedNodes[0] as HTMLElement;
          const dataNode = dataManager.insertEnterAtEnd(element.id!);
          setFocusId(dataNode.child?.node?.id!);
          setKey(prev => prev + 1);
          return;
        }
      } else if (mutations.length === 3
        && !mutations.some(m => m.type !== 'childList')
        && mutations[0].addedNodes[0] === mutations[1].target
        && mutations[1].addedNodes[0] === mutations[2].target) {
        // insert break at the start of block
        if ((mutations[0].addedNodes[0] as HTMLElement).id === (mutations[0].nextSibling as HTMLElement).id) {
          const element = mutations[0].addedNodes[0] as HTMLElement;
          const dataNode = dataManager.insertEnterAtStart(element.id!);
          setFocusId(dataNode.child?.node?.id!);
          setKey(prev => prev + 1);
          return;
        }

        // insert break at the end of block
        if ((mutations[0].addedNodes[0] as HTMLElement).id === (mutations[0].previousSibling as HTMLElement).id) {
          const element = mutations[0].addedNodes[0] as HTMLElement;
          const dataNode = dataManager.insertEnterAtEnd(element.id!);
          setFocusId(dataNode.child?.node?.id!);
          setKey(prev => prev + 1);
          return;
        }
      }

      // todo: need to check insert enter at the end
      // case of having text, then insert, insert to check
      console.log('unhandled mutations', mutations);
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