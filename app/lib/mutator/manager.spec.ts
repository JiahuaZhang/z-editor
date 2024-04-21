import { expect, test } from 'vitest';
import { DataManager } from './manager';
import { RichData } from './type';

test('simple data', () => {
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
          "id": "data-1",
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
          "id": "data-2",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "value": "F",
            "background": "#ddd"
          },
          "id": "data-3",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "text": "P content"
          },
          "id": "data-4",
          "children": []
        }
      ],
      "id": "data-5"
    },
    {
      "label": "h1",
      "children": [
        {
          "label": "span",
          "data": {
            "text": "h1 content"
          },
          "id": "data-6",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "value": "why",
            "color": "green"
          },
          "id": "data-7",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "value": "a",
            "bold": true,
            "italic": true
          },
          "id": "data-8",
          "children": []
        },
        {
          "label": "span",
          "data": {
            "value": "okay? ",
            "background": "#ccc"
          },
          "id": "data-9",
          "children": []
        }
      ],
      "id": "data-10"
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
              "id": "data-11",
              "children": []
            }
          ],
          "id": "data-12"
        }
      ],
      "id": "data-13"
    }
  ];

  const manager = new DataManager(initData);
  expect(manager.list()).toEqual(expected);
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
  ] as RichData[];

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
              "id": "data-1",
              "children": []
            }
          ],
          "id": "data-2"
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
                      "id": "data-3",
                      "children": []
                    }
                  ],
                  "id": "data-4"
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
                              "id": "data-5",
                              "children": []
                            }
                          ],
                          "id": "data-6"
                        }
                      ],
                      "id": "data-7"
                    }
                  ],
                  "id": "data-8"
                }
              ],
              "id": "data-9"
            }
          ],
          "id": "data-10"
        }
      ],
      "id": "data-11"
    }
  ];

  const manager = new DataManager(initData);
  expect(manager.list()).toEqual(expected);
});