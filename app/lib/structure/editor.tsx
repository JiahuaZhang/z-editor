import { defaultDisplayerMap } from './displayer';
import { initContent } from './processor';
import { Content, SimpleRichContentLabel } from './type';

type RichTextEditorProps = {
  initDate: Content[];
};

const RichContentProcessor = (props: Content) => {
  if (props.label in defaultDisplayerMap) {
    return defaultDisplayerMap[props.label as SimpleRichContentLabel](props as any);
  }

  return <div>Not implemented</div>;
};

// jotai state?
export const RichTextEditor = ({ initDate, ...rest }: RichTextEditorProps) => {
  const processedProps = initContent(initDate);

  return <div un-border='~ 2 blue-4 rounded'
    un-p='2'
    tabIndex={0}
    contentEditable
    suppressContentEditableWarning
    onKeyDown={event => {
      console.log('event', event);

      const selection = window.getSelection();
      console.log('selection', selection);

      if (!selection) return;

    }}
    {...rest} >
    {processedProps.map
      (item => <RichContentProcessor {...item} key={item.state.id} />)}
  </div>;
};