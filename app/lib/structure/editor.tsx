import { useSetAtom } from 'jotai';
import { useAtom, useAtomValue } from 'jotai/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { defaultDisplayerMap } from './displayer';
import { initContent } from './processor';
import { contentAtom, updateSpanAtom, updateTextAtom } from './state';
import { Content, SimpleRichContentLabel } from './type';

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

  console.log(JSON.stringify(content, null, 2));

  return <></>;
};

const EditorData = ({ data, ...rest }: { data: Content[]; }) => {
  const [key, setKey] = useState(0);
  const content = useAtomValue(contentAtom);
  const updateSpan = useSetAtom(updateSpanAtom);
  const updateText = useSetAtom(updateTextAtom);
  const [state, setState] = useState(data);
  const editorRef = useRef<HTMLDivElement>(null);
  console.log('Render EditorData');

  useEffect(() => {
    setState(content);
    editorRef.current?.focus();
  }, [key]);

  return <div un-border='~ 2 blue-4 rounded'
    un-p='2'
    key={key}
    tabIndex={0}
    ref={editorRef}
    contentEditable
    suppressContentEditableWarning
    onKeyDown={event => {
      if (event.key.includes('Arrow')) {
        return;
      }

      const selection = window.getSelection();

      if (!selection) return;

      if (selection.isCollapsed) {
        const { anchorNode, anchorOffset } = selection;
        const oldValue = anchorNode!.nodeValue!;
        const value = `${oldValue.slice(0, anchorOffset)}${event.key}${oldValue.slice(anchorOffset)}`;

        if ((anchorNode as any).id) {
          updateText((anchorNode as any).id, value);
        } else if (anchorNode?.parentElement?.id) {
          updateSpan(anchorNode?.parentElement?.id, value);
        }
      }
    }}
    {...rest} >
    {state.map(item => <Fragment key={item.state?.id}>
      <ContentProcessor  {...item} />
    </Fragment>)}
  </div>;
};