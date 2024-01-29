import { Editor, Element, Node, Range, Transforms } from 'slate';
import { CodeLineType, insertText as insertCodeText } from './code';
import { CHECK_LIST_ITEM_TYPE } from './list/list';

const SHORTCUTS = {
  '*': 'li',
  '-': 'li',
  '+': 'li',
  '1.': 'li',
  '>': 'blockquote',
  '#': 'h1',
  '##': 'h2',
  '###': 'h3',
  '####': 'h4',
  '#####': 'h5',
  '######': 'h6',
  '[]': CHECK_LIST_ITEM_TYPE,
  '[x]': CHECK_LIST_ITEM_TYPE,
};

export const withMarkdownShortcuts = (editor: Editor) => {
  const { insertText, deleteBackward } = editor;

  editor.insertText = (text: string) => {
    if (text !== ' ') {
      return insertText(text);
    }

    const { selection } = editor;
    if (!selection || Range.isExpanded(selection)) {
      return insertText(text);
    }

    const { anchor } = selection;
    const block = Editor.above(editor, { match: n => Element.isElement(n) && Editor.isBlock(editor, n) });
    const path = block ? block[1] : [];
    const start = Editor.start(editor, path);
    const range = { anchor, focus: start };
    const beforeText = Editor.string(editor, range);

    const codeNode = insertCodeText(beforeText);
    if (codeNode) {
      Transforms.select(editor, range);
      if (Range.isExpanded(range)) {
        Transforms.delete(editor);
      }
      Transforms.setNodes(editor, { type: CodeLineType, });
      return Transforms.wrapNodes(editor, codeNode);
    }

    if (!(beforeText in SHORTCUTS)) {
      return insertText(text);
    }

    Transforms.select(editor, range);
    if (Range.isExpanded(range)) {
      Transforms.delete(editor);
    }

    const type = SHORTCUTS[beforeText as keyof typeof SHORTCUTS];
    Transforms.setNodes(
      editor,
      { type } as Partial<Node>,
      { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
    if (beforeText === '[x]') {
      Transforms.setNodes(
        editor,
        { type, checked: true } as Partial<Node>,
      );
    } else if (type === 'li') {
      const parentType = beforeText === '1.' ? 'ol' : 'ul';
      Transforms.wrapNodes(editor,
        { type: parentType, children: [] } as Element,
        { match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as any).type === 'li' });
    }

  };

  return editor;
};