import { v4 } from 'uuid';
import { Content } from './type';

type Props = {
  content: Content;
  key: string;
};

export const prepareContent = ({ content, key }: Props): Content => ({
  ...content,
  state: {
    id: v4(),
    key
  },
  children: content.children?.map((child, childIndex) => prepareContent({ content: child, key: `${key}.children[${childIndex}]` }))
});

export const initContent = (contents: Content[]) => contents.map((content, index) => prepareContent({ content, key: `[${index}]` }));