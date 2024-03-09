// todo:
// data => render html

import { RichTextEditor } from '~/lib/structure/editor';
import { PContent, RichContent } from '~/lib/structure/structure';

const initDate = [
  {
    label: 'p',
    data: {
      children: [
        { text: 'c', attribute: { color: 'red' } },
        { text: 'a', attribute: { bold: true, italic: true, underline: true } },
        { text: 'F', attribute: { background: '#ddd' } },
        {
          text: 'P content'
        }
      ]
    }
  },
  {
    label: 'h1',
    data: {
      children: [
        {
          text: 'H1 content'
        },
        { text: 'why', attribute: { color: 'green' } },
        { text: 'a', attribute: { bold: true, italic: true } },
        { text: 'okay? ', attribute: { background: '#ccc' } },
      ]
    }
  }
] as RichContent[];

const Foo = () => {
  return <RichTextEditor un-m='4' initDate={initDate} />;
};

export default Foo;