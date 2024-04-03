import { expect, test } from 'vitest';
import { LinkedList } from './managed-content';
import { Content } from './type';

test('data', () => {
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
  ] as Content[];

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
          "id": "content-1",
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
          "id": "content-2",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "value": "F",
            "background": "#ddd"
          },
          "id": "content-3",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "text": "P content"
          },
          "id": "content-4",
          "children": []
        }
      ],
      "id": "content-5"
    },
    {
      "label": "h1",
      "children": [
        {
          "label": "span",
          "data": {
            "text": "h1 content"
          },
          "id": "content-6",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "value": "why",
            "color": "green"
          },
          "id": "content-7",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "value": "a",
            "bold": true,
            "italic": true
          },
          "id": "content-8",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "value": "okay? ",
            "background": "#ccc"
          },
          "id": "content-9",
          "children": []
        }
      ],
      "id": "content-10"
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
              "id": "content-11",
              "children": []
            }
          ],
          "id": "content-12"
        }
      ],
      "id": "content-13"
    }
  ];

  const linkedList = new LinkedList(initData);
  expect(linkedList.list()).toEqual(expected);
});

test('nested data', () => {
  const initData = [
    {
      label: 'ul',
      children: [
        {
          label: 'li',
          children: [{ label: 'span', data: { text: 'li content' } }]
        },
        {
          label: 'li',
          children: [
            {
              label: 'ul', children: [
                { label: 'li', children: [{ label: 'span', data: { text: 'nested item' } }] },
                {
                  label: 'li', children: [
                    { label: 'ul', children: [{ label: 'li', children: [{ label: 'span', data: { text: 'nested nested item' } }] }] }
                  ]
                },
              ]
            }
          ]
        }
      ]
    }
  ] as Content[];

  const expected = [
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
              "id": "content-1",
              "children": []
            }
          ],
          "id": "content-2"
        },
        {
          "label": "li",
          "children": [
            {
              "label": "ul",
              "children": [
                {
                  "label": "li",
                  "children": [
                    {
                      "label": "span",
                      "data": {
                        "text": "nested item"
                      },
                      "id": "content-3",
                      "children": []
                    }
                  ],
                  "id": "content-4"
                },
                {
                  "label": "li",
                  "children": [
                    {
                      "label": "ul",
                      "children": [
                        {
                          "label": "li",
                          "children": [
                            {
                              "label": "span",
                              "data": {
                                "text": "nested nested item"
                              },
                              "id": "content-5",
                              "children": []
                            }
                          ],
                          "id": "content-6"
                        }
                      ],
                      "id": "content-7"
                    }
                  ],
                  "id": "content-8"
                }
              ],
              "id": "content-9"
            }
          ],
          "id": "content-10"
        }
      ],
      "id": "content-11"
    }
  ];

  const linkedList = new LinkedList(initData);
  expect(linkedList.list()).toEqual(expected);
});