import { RenderLeafProps } from 'slate-react';
import { CodeLeaf } from '../plugin/code';

export const renderLeaf = (props: RenderLeafProps) => {
  return <CodeLeaf {...props} />;
};