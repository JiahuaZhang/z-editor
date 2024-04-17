import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Displayer } from './displayer';
import { prepare } from './processor';
import { richDataAtom } from './state';
import { RichData } from './type';

export const RichTextEditor = ({ initData, ...rest }: { initData: RichData[]; }) => {
  const setRichData = useSetAtom(richDataAtom);
  useEffect(() => setRichData(initData.map(prepare)), []);

  return <InternalEditor {...rest} />;
};

const InternalEditor = (props: any) => {
  const richData = useAtomValue(richDataAtom);

  return <div
    un-border='rounded'
    un-p='2'
    un-outline='2 solid gray-4 focus-visible:blue-4'
    contentEditable
    suppressContentEditableWarning
    {...props}
    onKeyDown={event => {
      if (event.key === 'Enter') {
        console.log(event.shiftKey);
        // todo: if it's already selected mutliple text content?
      }
      console.log(event.key);

      // todo, delete case, backspace case
      // ctrl, alt, arrow etc
      if (event.key.includes('Arrow')) {
        return;
      }
      const selection = window.getSelection();
      if (!selection) return;

      const { anchorNode, anchorOffset } = selection;

      if (anchorNode?.parentElement?.id) {
        // linkedList.insertLetter(anchorNode.parentElement.id, event.key, anchorOffset);
      }
    }}
  >
    {richData.map((data) => <Displayer richData={data} key={data.id} />)}
  </div>;
};