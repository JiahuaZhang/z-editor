import { expect, test } from 'vitest';
import { initContent } from './processor';
import { Content } from './type';

const initDate = [
  {
    label: 'p',
    children: [
      { label: 'span', data: { value: 'c', color: 'red' } },
      { label: 'span', data: { value: 'a', bold: true, italic: true, underline: true } },
      { label: 'span', data: { value: 'F', background: '#ddd' } },
      { label: 'span', data: { text: 'P content' } }
    ]
  },
  {
    label: 'h1',
    children: [
      { label: 'span', data: { text: 'h1 content' } },
      { label: 'span', data: { value: 'why', color: 'green' } },
      { label: 'span', data: { value: 'a', bold: true, italic: true } },
      { label: 'span', data: { value: 'okay? ', background: '#ccc' } },
    ]
  },
  {
    label: 'ul',
    children: [
      {
        label: 'li',
        children: [{ label: 'span', data: { text: 'li content' } }]
      },
    ]
  }
] as Content[];

const expectedContent = [
  {
    label: 'p',
    children: [
      { label: 'span', data: { value: 'c', color: 'red' }, state: { id: '', key: '[0].children[0]' } },
      { label: 'span', data: { value: 'a', bold: true, italic: true, underline: true }, state: { id: '', key: '[0].children[1]' } },
      { label: 'span', data: { value: 'F', background: '#ddd' }, state: { id: '', key: '[0].children[2]' } },
      { label: 'span', data: { text: 'P content' }, state: { id: '', key: '[0].children[3]' } }
    ],
    state: { id: '', key: '[0]' }
  },
  {
    label: 'h1',
    children: [
      { label: 'span', data: { text: 'h1 content' }, state: { id: '', key: '[1].children[0]' } },
      { label: 'span', data: { value: 'why', color: 'green' }, state: { id: '', key: '[1].children[1]' } },
      { label: 'span', data: { value: 'a', bold: true, italic: true }, state: { id: '', key: '[1].children[2]' } },
      { label: 'span', data: { value: 'okay? ', background: '#ccc' }, state: { id: '', key: '[1].children[3]' } },
    ],
    state: { id: '', key: '[1]' }
  },
  {
    label: 'ul',
    children: [
      {
        label: 'li',
        children: [
          {
            label: 'span',
            state: { text: 'li content', key: '[2].children[0].children[0]' }
          }
        ],
        state: { id: '', key: '[2].children[0]' }
      },
    ],
    state: { id: '', key: '[2]' }
  }
] as Content[];

type StateOnly = {
  state?: {
    key: string;
  };
  children?: StateOnly[];
};

const extractKey = (content: Content[]): StateOnly[] =>
  content.map(c => ({
    state: { key: c.state?.key ?? '' },
    children: extractKey(c.children || [])
  }));

test('generate correct keys', () => {
  const result = initContent(initDate);
  const check = extractKey(result);
  const expected = extractKey(expectedContent);
  expect(check).toEqual(expected);
});