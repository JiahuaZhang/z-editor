// todo:
// data => render html

import { RichTextEditor } from '~/lib/structure/editor';
import { Content } from '~/lib/structure/type';

const initDate = [
  {
    label: 'p',
    content: [
      { label: 'span', data: { value: 'c', color: 'red' } },
      { label: 'span', data: { value: 'a', bold: true, italic: true, underline: true } },
      { label: 'span', data: { value: 'F', background: '#ddd' } },
      { label: 'span', data: { text: 'P content' } }
    ]
  },
  {
    label: 'h1',
    content: [
      { label: 'span', data: { text: 'h1 content' } },
      { label: 'span', data: { value: 'why', color: 'green' } },
      { label: 'span', data: { value: 'a', bold: true, italic: true } },
      { label: 'span', data: { value: 'okay? ', background: '#ccc' } },
    ]
  },
] as Content[];

const Foo = () => {
  // return <RichTextEditor un-m='4' initDate={initDate} />;
  return null;
};

export default Foo;