import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { LinkedList } from './managed-content';
import { Render } from './render';
import { linkedListAtom } from './state';
import { Content } from './type';

export const RichTextEditor = ({ initData, ...rest }: { initData: Content[]; }) => {
  const linkedList = new LinkedList(initData);
  const setLinkedList = useSetAtom(linkedListAtom);
  useEffect(() => {
    setLinkedList(linkedList);
  }, []);

  return <ClientOnly>
    {() => <InternalEditor {...rest} />}
  </ClientOnly>;
};

const InternalEditor = (props: any) => {
  const linkedList = useAtomValue(linkedListAtom);

  return <div
    un-border='rounded'
    un-p='2'
    un-outline='2 solid gray-4 focus-visible:blue-4'
    contentEditable
    suppressContentEditableWarning
    {...props}
    onKeyDown={event => {
      if (event.key.includes('Arrow')) {
        return;
      }
      const selection = window.getSelection();
      if (!selection) return;

      const { anchorNode, anchorOffset } = selection;

      if (anchorNode?.parentElement?.id) {
        linkedList.insertLetter(anchorNode.parentElement.id, event.key, anchorOffset);
      }
    }}
  >
    {linkedList.children().map((node) => <Render key={node.content?.id} node={node} />)}
  </div>;
};