import { Editor, Path, Transforms, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { describe, expect, test } from 'vitest';
import { withCommon } from '../common';
import { CHECK_LIST_ITEM_TYPE } from '../list/list';
import { withMarkdownShortcuts } from '../markdown';
import { InlinePanelType } from '../panel/inline-panel';

const simpleType = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', CHECK_LIST_ITEM_TYPE];
const listType = ['ul', 'ol'];

const dropDownState = () => ({
  type: InlinePanelType,
  state: { active: true },
  children: [{ text: "" }]
});

const generateSimpleState = (type: string, hasDropDown?: boolean) => [
  {
    type,
    children: [hasDropDown ? dropDownState() : { text: "" }],
  }
];

const generateListState = (type: string, hasDropDown?: boolean) => [
  {
    type,
    children: [
      {
        type: 'li',
        children: [hasDropDown ? dropDownState() : { text: "" }],
      }
    ]
  }
];

const init = (state: any) => {
  const editor = withMarkdownShortcuts(withCommon(withHistory(withReact(createEditor()))));
  editor.children = state;
  return editor;
};

const logJson = (editor: Editor) => {
  console.log('Editor state:');
  console.log(JSON.stringify(editor.children, null, 2));
};

const dropDownConvert = (editor: Editor, type: string) => {
  logJson(editor);

  const [match] = Editor.nodes(editor, {
    match: n => (n as any).type === InlinePanelType,
    at: []
  });

  console.log('match inline panel:', match);

  if (!match) return;

  const [node, inlinePanelPath] = match;
  Transforms.removeNodes(editor, { at: inlinePanelPath });

  logJson(editor);

  const parentPath = Path.parent(inlinePanelPath);
  const [parentNode] = Editor.node(editor, parentPath);

  if (simpleType.includes((parentNode as any).type) && simpleType.includes(type)) {
    Transforms.setNodes(editor, { type }, { at: parentPath });
    logJson(editor);
  } else if ((parentNode as any).type === 'li') {
    const listPath = Path.parent(parentPath);
    const [listNode] = Editor.node(editor, listPath);
    if ((listNode as any).children.length === 1) {
      Transforms.unwrapNodes(editor, { at: listPath });
      logJson(editor);

      if (listType.includes(type)) {
        Transforms.setNodes(editor, { type: 'li' }, { at: listPath });
        logJson(editor);

        Transforms.wrapNodes(editor, { type, children: [] }, { at: listPath });
        logJson(editor);
      } else {
        Transforms.setNodes(editor, { type }, { at: listPath });
        logJson(editor);
      }
    } else {
      console.log('multiple length list node', parentPath, listPath);
      (editor as any).enableNormalizeNode = false;

      Transforms.splitNodes(editor, { at: parentPath, always: true });
      logJson(editor);

      console.log('split again');
      Transforms.splitNodes(editor, { at: [1, 0] });

      (editor as any).enableNormalizeNode = true;
      logJson(editor);
    }

  } else if (listType.includes(type)) {
    Transforms.setNodes(editor, { type: 'li' }, { at: parentPath });
    Transforms.wrapNodes(editor, { type, children: [] }, { at: parentPath });
    logJson(editor);
  }

};

describe('simple converting', () => {
  test('simple case + list case', () => {
    const types = simpleType.concat(listType);
    for (const from of types) {
      for (const to of types) {
        const initState = listType.includes(from) ? generateListState(from, true) : generateSimpleState(from, true);
        const expectedState = listType.includes(to) ? generateListState(to) : generateSimpleState(to);

        const editor = init(initState);
        dropDownConvert(editor, to);

        expect(editor.children).toEqual(expectedState);
      }
    }
  });

  test('complicated list case', () => {
    const initState = [
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [{ text: 'line 1' }],
          },
          {
            type: "li",
            children: [dropDownState(),]
          },
          {
            type: 'li',
            children: [{ text: 'line 3' }],
          }
        ]
      }
    ];

    const expectedState = [
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [{ text: 'line 1' }],
          }
        ]
      },
      {
        type: 'h1',
        children: [{ text: '' }],
      },
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [{ text: 'line 3' }],
          }
        ]
      }
    ];

    const editor = init(initState);
    dropDownConvert(editor, 'h1');

  });
});