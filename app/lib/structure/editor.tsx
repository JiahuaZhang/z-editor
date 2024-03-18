import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { Fragment } from 'react';
import { defaultDisplayerMap } from './displayer';
import { initContent } from './processor';
import { contentAtom } from './state';
import { Content, SimpleRichContentLabel } from './type';

type RichTextEditorProps = {
  initDate: Content[];
};

const ContentProcessor = (props: Content) => {
  if (props.label in defaultDisplayerMap) {
    return defaultDisplayerMap[props.label as SimpleRichContentLabel](props as any);
  }

  console.warn('unknown label ', props.label);
  return <></>;
};

export const RichTextEditor = ({ initDate, ...rest }: RichTextEditorProps) => {
  const setContent = useSetAtom(contentAtom);
  setContent(initContent(initDate));
  return <InternalEditor {...rest} />;
};

const InternalEditor = (props: any) => {
  const content = useAtomValue(contentAtom);

  console.log('content', content);

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
    {...props} >
    {content.map(item => <Fragment key={item.state?.id}>
      <ContentProcessor  {...item} />
    </Fragment>)}
  </div>;
};