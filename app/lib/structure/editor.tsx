import { useAtomValue, useSetAtom } from 'jotai';
import { LinkedList } from './managed-content';
import { Content } from './type';
import { linkedListAtom } from './state';
import { Render } from './render';

export const RichTextEditor = ({ initData, ...rest }: { initData: Content[]; }) => {
  console.log('Render RichTextEditor');
  const linkedList = new LinkedList(initData);
  const setLinkedList = useSetAtom(linkedListAtom);
  setLinkedList(linkedList);

  // return <div>Rich text editor here</div>;
  return <InternalEditor {...rest} />;
};

const InternalEditor = (props: any) => {
  const linkedList = useAtomValue(linkedListAtom);
  // console.log('internal editor');
  // console.log('linkedList', linkedList);
  console.log(linkedList.children());

  return <div
    un-border='rounded'
    un-p='2'
    un-outline='2 solid gray-4 focus-visible:blue-4'
    contentEditable
    suppressContentEditableWarning
    {...props} >
    {linkedList.children().map((node) => <Render key={node.content?.id} node={node} />)}
  </div>;
};