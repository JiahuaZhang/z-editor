import { Editor, Transforms, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { describe, test } from 'vitest';
import { withCommon } from '../common';
import { withMarkdownShortcuts } from '../markdown';

const init = (state: any) => {
  const editor = withMarkdownShortcuts(withCommon(withHistory(withReact(createEditor()))));
  editor.children = state;
  return editor;
};

const logJson = (editor: Editor) => {
  console.log('Editor state:');
  console.log(JSON.stringify(editor.children, null, 2));
};

const fn = (editor: Editor) => {
  console.log('start: ');
  logJson(editor);

  const [match] = Editor.nodes(editor, {
    match: n => (n as any).type === 'li',
    at: []
  });

  if (!match) {
    return;
  }

  (editor as any).enableNormalizeNode = false;

  const [node, path] = match;
  console.log('match ', node, path);

  Transforms.splitNodes(editor, { at: path });
  console.log('splitting:');
  logJson(editor);

  (editor as any).enableNormalizeNode = false;
};

const listData = [
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [{ text: 'line 1' }],
      },
      {
        type: 'li',
        children: [{ text: 'line 2' }],
      },
    ]
  }
];

const listDataEmpty = [
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [{ text: ' ' }],
      },
      {
        type: 'li',
        children: [{ text: '' }],
      },
    ]
  }
];

describe('split', () => {
  test('split', () => {
    const editor = init(listData);
    fn(editor);
  });

  // test('split empty', () => {
  //   const editor = init(listDataEmpty);
  //   fn(editor);
  // });
});