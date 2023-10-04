import { Editor, Range, Element, Transforms, Node, BaseElement } from 'slate';

const SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'blockquote',
  '#': 'h1',
  '##': 'h2',
  '###': 'h3',
  '####': 'h4',
  '#####': 'h5',
  '######': 'h6',
};

export const withMarkdownShortcuts = (editor: Editor) => {
  const { insertText, deleteBackward } = editor;

  editor.insertText = (text: string) => {
    if (text !== ' ') {
      return insertText(text);
    }

    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection)) {
      return insertText(text);
    }

    const { anchor } = selection;
    const block = Editor.above(editor, { match: n => Element.isElement(n) && Editor.isBlock(editor, n) });
    const path = block ? block[1] : [];
    const start = Editor.start(editor, path);
    const range = { anchor, focus: start };
    const beforeText = Editor.string(editor, range);

    if (!(beforeText in SHORTCUTS)) {
      return insertText(text);
    }

    Transforms.select(editor, range);
    if (!Range.isCollapsed(range)) {
      Transforms.delete(editor);
    }

    const type = SHORTCUTS[beforeText as keyof typeof SHORTCUTS];
    Transforms.setNodes(
      editor,
      { type } as Partial<Node>,
      { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
    );

    if (type === 'list-item') {
      Transforms.wrapNodes(editor,
        { type: 'bullet-list', children: [] } as BaseElement,
        { match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as any).type === 'list-item' });
    }

  };

  return editor;
};