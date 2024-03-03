import { Editor, Transforms, createEditor } from 'slate';
import { withReact } from 'slate-react';
import { describe, expect, test } from 'vitest';

const convertHeading = (editor: Editor, fromType: string, toType: string) => {
  Transforms.setNodes(
    editor,
    { type: toType },
    { match: n => (n as any).type === fromType, at: [] }
  );
};

describe('convert heading', () => {
  test('converts h1 to h2', () => {
    const editor = withReact(createEditor());

    const initialState = [
      {
        type: 'h1',
        children: [{ text: 'content' }],
      },
    ];

    editor.children = initialState;

    convertHeading(editor, 'h1', 'h2');

    const expectedState = [
      {
        type: 'h2',
        children: [{ text: 'content' }],
      },
    ];

    expect(editor.children).toEqual(expectedState);
  });
});
