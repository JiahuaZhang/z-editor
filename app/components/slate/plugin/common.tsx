import { Editor, Node, Transforms } from 'slate';
import { insertBreak as insertCodeBreak } from './code';
import { EMBED_TYPES } from './embed';

const AUTO_ESCAPE_TYPE = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];

export const withCommon = (editor: Editor) => {
  const { insertBreak, insertSoftBreak, isVoid } = editor;

  editor.insertBreak = () => {
    const ancestor = editor.above();
    if (!ancestor) {
      return insertBreak();
    }

    const [block] = ancestor;
    if (!('type' in block)) return insertBreak();

    if (insertCodeBreak(editor)) return;

    if (AUTO_ESCAPE_TYPE.includes(block.type)) {
      return Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as Node);
    }

    return insertBreak();
  };

  editor.insertSoftBreak = () => {
    const ancestor = editor.above();
    if (!ancestor) {
      return insertSoftBreak();
    }

    const [block] = ancestor;
    if (!('type' in block)) return insertSoftBreak();


    if (block.type === 'check-list-item') {
      return Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as Node);
    }
    return insertSoftBreak();
  };

  editor.isVoid = (node) => {
    return EMBED_TYPES.includes((node as any).type) || isVoid(node);
  };

  return editor;
};