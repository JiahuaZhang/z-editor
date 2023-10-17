import { RenderLeafProps } from 'slate-react';
import { CodeLeaf, CodeLineType } from '../plugin/code';

type LeafProps = RenderLeafProps & {
  leaf: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
};

export const renderLeaf = (props: LeafProps) => {
  if (props.children.props.parent.type === CodeLineType) {
    return <CodeLeaf {...props} />;
  }

  let { children } = props;
  if (props.leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (props.leaf.italic) {
    children = <em>{children}</em>;
  }

  if (props.leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...props.attributes} >{children}</span>;
};

export const dummyData = [{
  type: 'paragraph',
  children: [
    {
      text:
        'This example shows how you can make a hovering menu appear above your content, which you can use to make text ',
    },
    { text: 'bold', bold: true },
    { text: ', ' },
    { text: 'italic', italic: true },
    { text: ', ' },
    { text: 'underline', underline: true },
    { text: ', or ' },
    { text: 'anything', bold: true, italic: true, underline: true },
    { text: ', else you might want to do!' },
  ],
}];