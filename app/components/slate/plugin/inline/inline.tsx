import { Editor, Transforms } from 'slate';
import { HASH_TAG_TYPE } from './hash-tag';
import { LINK_TYPE } from './link';

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
export const InlineChromiumBugfix = () => <span contentEditable={false} un-text='0'>{' '}</span>;

export const onKeyDownForInline = (event: React.KeyboardEvent, editor: Editor) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    Transforms.move(editor, { unit: 'offset', reverse: true });
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    Transforms.move(editor, { unit: 'offset' });
  }

};

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
    type: 'p',
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