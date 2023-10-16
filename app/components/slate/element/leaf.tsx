import { RenderLeafProps } from 'slate-react';
import { CodeLeaf, CodeLineType } from '../plugin/code';

export const renderLeaf = (props: RenderLeafProps) => {
  switch (props.children.props.parent.type) {
    case CodeLineType:
      return <CodeLeaf {...props} />;
    default:
      return <span {...props.attributes} >{props.children}</span>;
  }
};
