import { expect, test } from 'vitest';
import { prepare } from './processor';
import { RichData } from './type';

const initData = [
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
] as RichData[];

const expected = [
  {
    "label": "p",
    "children": [
      {
        "label": "span",
        "data": {
          "value": "c",
          "color": "red"
        },
        "id": "2",
        "children": []
      },
      {
        "label": "span",
        "data": {
          "value": "a",
          "bold": true,
          "italic": true,
          "underline": true
        },
        "id": "3",
        "children": []
      },
      {
        "label": "span",
        "data": {
          "value": "F",
          "background": "#ddd"
        },
        "id": "4",
        "children": []
      },
      {
        "label": "span",
        "data": {
          "text": "P content"
        },
        "id": "5",
        "children": []
      }
    ],
    "id": "1"
  },
  {
    "label": "h1",
    "children": [
      {
        "label": "span",
        "data": {
          "text": "h1 content"
        },
        "id": "7",
        "children": []
      },
      {
        "label": "span",
        "data": {
          "value": "why",
          "color": "green"
        },
        "id": "8",
        "children": []
      },
      {
        "label": "span",
        "data": {
          "value": "a",
          "bold": true,
          "italic": true
        },
        "id": "9",
        "children": []
      },
      {
        "label": "span",
        "data": {
          "value": "okay? ",
          "background": "#ccc"
        },
        "id": "10",
        "children": []
      }
    ],
    "id": "6"
  },
  {
    "label": "ul",
    "children": [
      {
        "label": "li",
        "children": [
          {
            "label": "span",
            "data": {
              "text": "li content"
            },
            "id": "13",
            "children": []
          }
        ],
        "id": "12"
      }
    ],
    "id": "11"
  }
] as RichData[];

test('simple test', () => {
  const result = initData.map(prepare);
  // console.log(JSON.stringify(result, null, 2));
  expect(result).toEqual(expected);
});
