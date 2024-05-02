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
          dataManager.prettyPrint();
          return;
        } else if (mutation.type === 'childList'
          && mutation.addedNodes.length === 0
          && mutation.nextSibling === null
          && mutation.previousSibling === null
          && mutation.oldValue === null
        ) {
          // special case of empty <span>, then pressing delete would delete the existing element
          // we need to always syncu up with data, a minimal of 1 element is required, so rollback
          setFocusId((mutation.removedNodes[0] as HTMLElement).id!);
          setKey(prev => prev + 1);
          dataManager.prettyPrint();
          return;
        }
      } else if (mutations.length === 2) {
        // special case of insert character
        // after insert a break, then typing a character, would trigger adding #text
        if (mutations[0].type === 'childList' && mutations[1].type === 'characterData') {
          dataManager.updateSpanText(mutations[1].target.parentElement?.id!, mutations[1].target.textContent!);
          dataManager.prettyPrint();
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
          dataManager.prettyPrint();
          return;
        }

        if (mutations[0].type === 'characterData'
          && mutations[1].type === 'characterData'
          && mutations[0].target.textContent === mutations[1].target.textContent) {
          // sometime this happen, a span with customized style might be having intermediate state (might be space added, causing 2 mutations record)
          dataManager.updateSpanText(mutations[0].target.parentElement?.id!, mutations[0].target.textContent!);
          dataManager.prettyPrint();
          return;
        }
      } else if (mutations.length === 3
        && !mutations.some(m => m.type !== 'childList')
        && mutations[0].addedNodes[0] === mutations[1].target
        && mutations[1].addedNodes[0] === mutations[2].target
        && mutations[2].addedNodes[0].nodeName === 'BR') {
        //no id ? previous element is no <p>
        if (!(mutations[0].addedNodes[0] as HTMLElement).id) {
          const dataNode = dataManager.insertEnterAtEnd((mutations[0].previousSibling as HTMLElement).id!);
          setFocusId(dataNode.child?.node?.id!);
          setKey(prev => prev + 1);
          dataManager.prettyPrint();
          return;
        }

        // insert break at the start of block
        if ((mutations[0].addedNodes[0] as HTMLElement).id === (mutations[0].nextSibling as HTMLElement)?.id) {
          const element = mutations[0].addedNodes[0] as HTMLElement;
          dataManager.insertEnterAtStart(element.id!);
          setFocusId(element.id!);
          setKey(prev => prev + 1);
          dataManager.prettyPrint();
          return;
        }

        // insert break at the end of block
        if ((mutations[0].addedNodes[0] as HTMLElement).id === (mutations[0].previousSibling as HTMLElement).id) {
          const element = mutations[0].addedNodes[0] as HTMLElement;
          const dataNode = dataManager.insertEnterAtEnd(element.id!);
          setFocusId(dataNode.child?.node?.id!);
          setKey(prev => prev + 1);
          dataManager.prettyPrint();
          return;
        }
      }

      // todo, check backspace, if this would delete the span, need to sync it.
      // test case, p > span > 'text', slowly delete character one by one, on last delete, need handle this.
      console.log('unhandled mutations', mutations);
    });
    observer.observe(ref.current, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });

    return () => observer.disconnect();
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