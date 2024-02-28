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

  const [node, path] = match;
  Transforms.removeNodes(editor, { at: path });

  logJson(editor);

  const parentPath = Path.parent(path);
  const [parentNode] = Editor.node(editor, parentPath);

  if (simpleType.includes((parentNode as any).type) && simpleType.includes(type)) {
    Transforms.setNodes(editor, { type }, { at: parentPath });
    logJson(editor);
  } else if ((parentNode as any).type === 'li') {
    const listPath = Path.parent(parentPath);
    // Transforms.splitNodes(editor, { at: listPath, always: true });
    Transforms.unwrapNodes(editor, { at: listPath });
    logJson(editor);

    if (listType.includes(type)) {
      Transforms.setNodes(editor, { type: 'li' }, { at: parentPath });
      logJson(editor);

      Transforms.wrapNodes(editor, { type, children: [] }, { at: parentPath });
      logJson(editor);
    } else {
      Transforms.setNodes(editor, { type }, { at: listPath });
      logJson(editor);
    }
  } else if (listType.includes(type)) {
    Transforms.setNodes(editor, { type: 'li' }, { at: parentPath });
    Transforms.wrapNodes(editor, { type, children: [] }, { at: parentPath });
    logJson(editor);
  }

};

describe('simple converting', () => {
  test('all simple cases', () => {
    for (const from of simpleType) {
      for (const to of simpleType) {
        const initState = generateSimpleState(from, true);
        const expectedState = generateSimpleState(to);

        const editor = init(initState);
        dropDownConvert(editor, to);
        expect(editor.children).toEqual(expectedState);
      }
    }
  });

  test('simple case to list case', () => {
    for (const from of simpleType) {
      for (const to of listType) {
        const initState = generateSimpleState(from, true);
        const expectedState = generateListState(to);

        const editor = init(initState);
        dropDownConvert(editor, to);
        expect(editor.children).toEqual(expectedState);
      }
    }
  });

  test('list case to simple case', () => {
    for (const from of listType) {
      for (const to of simpleType) {
        const initState = generateListState(from, true);
        const expectedState = generateSimpleState(to);

        const editor = init(initState);
        dropDownConvert(editor, to);
        expect(editor.children).toEqual(expectedState);
      }
    }
  });


  // todo, split list in fact, not replacing.
});