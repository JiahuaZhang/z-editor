import { useSetAtom } from 'jotai';
import { Fragment } from 'react';
import { defaultDisplayerMap } from './displayer';
import { initContent } from './processor';
import { contentAtom } from './state';
import { Content, SimpleRichContentLabel } from './type';
import { useAtom } from 'jotai/react';

const ContentProcessor = (props: Content) => {
  if (props.label in defaultDisplayerMap) {
    return defaultDisplayerMap[props.label as SimpleRichContentLabel](props as any);
  }

  console.warn('unknown label ', props.label);
  return <></>;
};

export const RichTextEditor = ({ initData, ...rest }: { initData: Content[]; }) => {
  console.log('Render RichTextEditor');

  const data = initContent(initData);
  const setContent = useSetAtom(contentAtom);
  setContent(data);
  return <InternalEditor data={data}  {...rest} />;
};

const InternalEditor = ({ data, ...rest }: { data: Content[]; }) => {
  console.log('Render InternalEditor');

  return <>
    <EditorState />
    <EditorData data={data} {...rest} />
  </>;
};

const EditorState = () => {
  const [content] = useAtom(contentAtom);
  console.log('rendering EditorState');

  // console.log('content', content);

  return <></>;
};

const EditorData = ({ data, ...rest }: { data: Content[]; }) => {
  console.log('Render EditorData');


  return <div un-border='~ 2 blue-4 rounded'
    un-p='2'
    tabIndex={0}
    contentEditable
    suppressContentEditableWarning
    onKeyDown={event => {
      console.log('event', event);
      console.log(event.key);

      const selection = window.getSelection();
      console.log('selection', selection);

      if (!selection) return;

      // selection.

    }}
    {...rest} >
    {data.map(item => <Fragment key={item.state?.id}>
      <ContentProcessor  {...item} />
    </Fragment>)}
  </div>;
};