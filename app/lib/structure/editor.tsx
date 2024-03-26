import { useSetAtom } from 'jotai';
import { useAtom, useAtomValue } from 'jotai/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { defaultDisplayerMap } from './displayer';
import { initContent } from './processor';
import { contentAtom, updateSpanAtom } from './state';
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

  console.log('content', content);

  return <></>;
};

const EditorData = ({ data, ...rest }: { data: Content[]; }) => {
  const [key, setKey] = useState(0);
  const content = useAtomValue(contentAtom);
  const updateSpan = useSetAtom(updateSpanAtom);
  const [state, setState] = useState(data);
  const editorRef = useRef<HTMLDivElement>(null);
  const [cursor, setCurosr] = useState<{ anchorNode: Node | null, anchorOffset: number; }>({
    anchorNode: null,
    anchorOffset: 0
  });
  console.log('Render EditorData');

  useEffect(() => {
    setState(content);

    const { anchorNode, anchorOffset } = cursor;
    console.log('cursor', cursor);
    console.log(content);


    if (anchorNode) {
      const selection = document.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const range = new Range();
        range.setStart(anchorNode, anchorOffset);
        selection.addRange(range);
      }
    }

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
      console.log('event', event);
      console.log(event.key);
      if (event.key.includes('Arrow')) {
        return;
      }

      const selection = window.getSelection();
      console.log('selection', selection);

      if (!selection) return;

      if (selection.isCollapsed) {
        const { anchorNode, anchorOffset } = selection;
        setCurosr({ anchorNode, anchorOffset });

        let container = content.find(c => c.state?.element?.contains(anchorNode));
        while (true) {
          const currentContainer = container?.content?.find(c => c.state?.element?.contains(anchorNode));
          if (!currentContainer) {
            if (container?.state?.element === anchorNode?.parentElement) {
              if (container?.label === 'span') {
                const { value } = container.data!;
                const newValue = `${value!.slice(0, anchorOffset)}${event.key}${value!.slice(anchorOffset)}`;
                updateSpan(container.state?.path!, newValue);
                setKey(prev => prev + 1);
                // issue, after resync data, the cursor is moved to the beginning of the editor
              } else if (container?.content?.length === anchorNode?.parentElement.childNodes.length) {
                console.log('full length match case');
              }
            }

            break;
          }
          container = currentContainer;
        }
      }
    }}
    {...rest} >
    {state.map(item => <Fragment key={item.state?.id}>
      <ContentProcessor  {...item} />
    </Fragment>)}
  </div>;
};