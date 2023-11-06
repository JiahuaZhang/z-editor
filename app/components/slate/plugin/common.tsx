import { Editor, Node, Range, Transforms } from 'slate';
import { CodeBlockType, CodeLineType, insertBreak as insertCodeBreak } from './code';
import { EMBED_TYPES } from './embed';
import { ImageType } from './image';

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
  const { insertBreak, insertData, insertSoftBreak, isVoid } = editor;

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

  editor.insertData = (data) => {
    const { files } = data;

    if (!files || files.length === 0) return insertData(data);

    for (const file of files) {
      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = () => {
          const data = reader.result as string;

          Transforms.insertNodes(
            editor, {
              type: ImageType,
              url: data,
              children: [{ text: '' }],
            } as Node
          );
        };
        reader.readAsDataURL(file);
      }
    }
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
    return [ImageType, ...EMBED_TYPES].includes((node as any).type) || isVoid(node);
  };

  return editor;
};