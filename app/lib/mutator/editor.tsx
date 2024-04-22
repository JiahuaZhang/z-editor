import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { Displayer } from './displayer';
import { prepare } from './processor';
import { richDataAtom } from './state';
import { RichData } from './type';
import { DataManager } from './manager';
import { ClientOnly } from 'remix-utils/client-only';

export const RichTextEditor = ({ initData, ...rest }: { initData: RichData[]; }) => {
  const dataManager = new DataManager(initData);
  // const setRichData = useSetAtom(richDataAtom);
  // useEffect(() => setRichData(initData.map(prepare)), []);

  return <ClientOnly>{() =>
    <InternalEditor dataManager={dataManager}  {...rest} />}
  </ClientOnly>;
};

const InternalEditor = ({ dataManager, ...rest }: { dataManager: DataManager; }) => {
  // const richData = useAtomValue(richDataAtom);
  const ref = useRef<HTMLDivElement>(null);
  console.log(dataManager.toData());

  useEffect(() => {
    if (!ref.current) return;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          console.log(mutation.target);
          console.log(mutation.oldValue, mutation.target.textContent);
          console.log(mutation.target.parentElement?.id, mutation.target.parentElement?.nodeName);

          dataManager.updateSpanText(mutation.target.parentElement?.id!, mutation.target.textContent!);
          console.log(dataManager.toString());
        }
      }
      // console.log(mutations);

      // setRichData(mutations.map(prepare));
    });
    observer.observe(ref.current, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });

    return () => { observer.disconnect(); };
  }, [ref]);

  return <div
    un-border='rounded'
    un-p='2'
    un-outline='2 solid gray-4 focus-visible:blue-4'
    ref={ref}
    contentEditable
    suppressContentEditableWarning
    {...rest}
  >
    {dataManager.toData().map((data) => <Displayer richData={data} key={data.id} />)}
    {/* {richData.map((data) => <Displayer richData={data} key={data.id} />)} */}
  </div>;
};