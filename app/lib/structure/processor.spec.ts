import { expect, test } from 'vitest';
import { initContent } from './processor';
import { Content } from './type';

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
  {
    label: 'ul',
    content: [
      {
        label: 'li',
        content: [{ label: 'span', data: { text: 'li content' } }]
      },
    ]
  }
] as Content[];

const expectedContent = [
  {
    label: 'p',
    content: [
      { label: 'span', data: { value: 'c', color: 'red' }, state: { id: '', path: '[0].content[0]' } },
      { label: 'span', data: { value: 'a', bold: true, italic: true, underline: true }, state: { id: '', path: '[0].content[1]' } },
      { label: 'span', data: { value: 'F', background: '#ddd' }, state: { id: '', path: '[0].content[2]' } },
      { label: 'span', data: { text: 'P content' }, state: { id: '', path: '[0].content[3]' } }
    ],
    state: { id: '', path: '[0]' }
  },
  {
    label: 'h1',
    content: [
      { label: 'span', data: { text: 'h1 content' }, state: { id: '', path: '[1].content[0]' } },
      { label: 'span', data: { value: 'why', color: 'green' }, state: { id: '', path: '[1].content[1]' } },
      { label: 'span', data: { value: 'a', bold: true, italic: true }, state: { id: '', path: '[1].content[2]' } },
      { label: 'span', data: { value: 'okay? ', background: '#ccc' }, state: { id: '', path: '[1].content[3]' } },
    ],
    state: { id: '', path: '[1]' }
  },
  {
    label: 'ul',
    content: [
      {
        label: 'li',
        content: [
          {
            label: 'span',
            state: { text: 'li content', path: '[2].content[0].content[0]' }
          }
        ],
        state: { id: '', path: '[2].content[0]' }
      },
    ],
    state: { id: '', path: '[2]' }
  }
] as Content[];

type StateOnly = {
  state?: {
    path: string;
  };
  content?: StateOnly[];
};

const extractPath = (content: Content[]): StateOnly[] =>
  content.map(c => ({
    state: { path: c.state?.path ?? '' },
    content: extractPath(c.content || [])
  }));

test('generate correct keys', () => {
  const result = initContent(initDate);
  const check = extractPath(result);
  const expected = extractPath(expectedContent);
  expect(check).toEqual(expected);
});