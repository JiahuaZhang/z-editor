import { HASH_TAG_TYPE } from './hash-tag';
import { LINK_TYPE } from './link';

// export const HashTag = ({ children, attributes }: RenderElementProps) => {
//   return <Tag
//     {...attributes}>{children}</Tag>;
// };

// todo:? hash-tag like #id element?
// e.g., ${id, 0} <-> [meta - id], they all refers to the same id, and could have various text
// type Identity = {
//   id: number; // auto generated, but unique
//   text: string[];
//   description?: string;
//   decoration?: { [key: string]: string; };
// };

export const dummyData = [
  {
    type: 'paragraph',
    children: [
      {
        type: HASH_TAG_TYPE,
        color: '#13c2c2',
        children: [{ text: 'openAI' }],
      },
      { text: ' ' },
      {
        type: LINK_TYPE,
        url: 'https://github.com',
        children: [{ text: 'github' }],
      },
      { text: ' ' },
      {
        type: HASH_TAG_TYPE,
        color: 'volcano',
        children: [{ text: 'react' }],
      },
      { text: ' ' },
      {
        type: LINK_TYPE,
        url: 'https://apple.com',
        children: [{ text: 'apple' }],
      },
      { text: ' ' },
      {
        type: HASH_TAG_TYPE,
        color: 'blue-inverse',
        children: [{ text: 'javascript' }],
      },
    ]
  }
];