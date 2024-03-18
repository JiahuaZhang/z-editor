import { v4 } from 'uuid';
import { Content } from './type';

type Props = {
  content: Content;
  path: string;
};

export const prepareContent = ({ content, path }: Props): Content => ({
  ...content,
  state: {
    id: v4(),
    path
  },
  content: content.content?.map((c, index) => prepareContent({ content: c, path: `${path}.content[${index}]` }))
});

export const initContent = (contents: Content[]) => contents.map((content, index) => prepareContent({ content, path: `[${index}]` }));