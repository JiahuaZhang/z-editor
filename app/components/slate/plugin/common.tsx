import { Editor, Node, Range, Transforms } from 'slate';
import { CodeBlockType, CodeLineType, insertBreak as insertCodeBreak } from './code';
import { EMBED_TYPES } from './embed';
import { ImageType, fileToImageNode } from './image';
import { HASH_TAG_TYPE, insertHashTagText } from './inline/hash-tag';
import { LINK_TYPE } from './inline/link';
import { CHECK_LIST_ITEM_TYPE, normalizeListNode } from './list/list';
import { InlinePanelType, insertPanelText } from './panel/inline-panel';

const AUTO_ESCAPE_TYPE = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];

export const isMarkActive = (editor: Editor, format: 'bold' | 'italic' | 'underline') => {
  const marks = Editor.marks(editor);
  return marks ? (marks as any)[format] === true : false;
};

export const toggleMark = (editor: Editor, format: 'bold' | 'italic' | 'underline') => {
  const { selection } = editor;
  if (!selection || Range.isCollapsed(selection)) return false;

  const [block] = Editor.above(editor, { match: n => Editor.isBlock(editor, n as any), }) || [];

  if (!block || !('type' in block) || [CodeBlockType, CodeLineType].includes(block.type)) {
    return false;
  }

  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const onDOMBeforeInput = (editor: Editor, event: InputEvent) => {
  switch (event.inputType) {
    case 'formatBold':
      toggleMark(editor, 'bold');
      return true;
    case 'formatItalic':
      toggleMark(editor, 'italic');
      return true;
    case 'formatUnderline':
      toggleMark(editor, 'underline');
      return true;
    default:
      return false;
  }
};

export const withCommon = (editor: Editor) => {
  const { insertBreak, insertData, insertText, insertSoftBreak, isVoid, isInline, normalizeNode } = editor;

  editor.insertBreak = () => {
    const ancestor = editor.above();
    if (!ancestor) {
      return insertBreak();
    }

    const [block] = ancestor;
    if (!('type' in block)) return insertBreak();

    if (insertCodeBreak(editor)) return;

    if (AUTO_ESCAPE_TYPE.includes(block.type)) {
      return Transforms.insertNodes(editor, { type: 'p', children: [{ text: '' }] } as Node);
    }

    return insertBreak();
  };

  editor.insertData = async (data) => {
    const { files } = data;

    if (!files || files.length === 0) return insertData(data);

    for (const file of files) {
      if (file.type.includes('image')) {
        Transforms.insertNodes(editor, await fileToImageNode(file));
      }
    }
  };

  editor.insertText = (text) => {
    if (insertPanelText(editor, text)) return;

    if (insertHashTagText(editor, text)) return;

    insertText(text);
  };

  editor.insertSoftBreak = () => {
    const ancestor = editor.above();
    if (!ancestor) {
      return insertSoftBreak();
    }

    const [block] = ancestor;
    if (!('type' in block)) return insertSoftBreak();

    if (block.type === CHECK_LIST_ITEM_TYPE) {
      return Transforms.insertNodes(editor, { type: 'p', children: [{ text: '' }] } as Node);
    } else if (block.type === 'li') {
      return Editor.insertText(editor, '\n');
    }
    return insertSoftBreak();
  };

  editor.isVoid = (node) => {
    return [InlinePanelType, ImageType, ...EMBED_TYPES].includes(node.type) || isVoid(node);
  };

  editor.isInline = node => {
    return [LINK_TYPE, HASH_TAG_TYPE, InlinePanelType].includes(node.type) || isInline(node);
  };

  (editor as any).enableNormalizeNode = true;
  editor.normalizeNode = entry => {
    if ((editor as any).enableNormalizeNode) {
      if (normalizeListNode(entry, editor)) return;
    }

    normalizeNode(entry);
  };

  return editor;
};