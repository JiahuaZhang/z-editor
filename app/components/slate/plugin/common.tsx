import { Editor, Node, Transforms } from 'slate';
import { EMBED_TYPES } from './embed';

const AUTO_ESCAPE_TYPE = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code'];

export const withCommon = (editor: Editor) => {
  const { insertBreak, isVoid } = editor;

  editor.insertBreak = () => {
    const ancestor = editor.above();
    if (!ancestor) {
      return insertBreak();
    }

    const [block] = ancestor;
    if (!('type' in block)) return insertBreak();

    if (!AUTO_ESCAPE_TYPE.includes((block as any).type)) {
      return insertBreak();
    }

    Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as Node);
  };

  editor.isVoid = (node) => {
    return EMBED_TYPES.includes((node as any).type) || isVoid(node);
  };

  return editor;
};