import { Editor, NodeEntry, Path, Transforms } from 'slate';

export const normalizeListNode = (entry: NodeEntry, editor: Editor) => {
  const [node, path] = entry;
  const { type } = node as any;
  if (['ul', 'ol'].includes(type)) {
    const nextPath = Path.next(path);
    try {
      const [nextNode] = Editor.node(editor, nextPath);
      if ((nextNode as any)?.type === type) {
        Transforms.mergeNodes(editor, { at: nextPath });
        return true;
      }
    } catch (error) {}
  }

  return false;
};

const insertNewParagraph = (event: React.KeyboardEvent, editor: Editor) => {
  if (!event.ctrlKey || event.key !== 'Enter') return false;

  const { selection } = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, { match: n => (n as any).type === 'li', });
  if (!match) return false;

  const topLevelList = Path.ancestors(match[1])[1];
  Transforms.insertNodes(
    editor,
    { type: 'p', children: [{ text: '' }], },
    { at: Path.next(topLevelList), select: true }
  );

  return true;
};

const listIndentation = (event: React.KeyboardEvent, editor: Editor) => {
  if (event.key !== 'Tab') return false;

  const { selection } = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, { match: n => (n as any).type === 'li', });
  if (!match) return false;

  event.preventDefault();
  const [_, path] = match;

  if (event.shiftKey) {
    const parentPath = Path.parent(path);
    if (parentPath.length === 1) return true;

    const nextPath = Path.next(path);
    try {
      const [nextNode] = Editor.node(editor, nextPath);
      if (['ul', 'ol'].includes((nextNode as any).type)) {
        return true;
      }
    } catch (error) {}

    Transforms.liftNodes(editor, { at: path });
    return true;
  } else {
    if (path[path.length - 1] === 0) {
      return true;
    }

    const [parentNode] = Editor.node(editor, Path.parent(path));
    Transforms.wrapNodes(editor, { type: (parentNode as any).type, children: [] });
    return true;
  }
};

export const onKeyDownForList = (event: React.KeyboardEvent, editor: Editor) =>
  insertNewParagraph(event, editor) || listIndentation(event, editor);

export const dummyData = [{
  type: 'ul',
  children: [
    {
      type: 'li',
      children: [{ text: '1st item' }],
    },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [{ text: 'A nested list item' }],
        },
        {
          type: 'ul',
          children: [
            {
              type: 'li',
              children: [{ text: 'A nested list item' }],
            },
            {
              type: 'li',
              children: [{ text: 'super nested list item' }],
            },
            {
              type: 'li',
              children: [{ text: 'super super nested list item' }],
            },
          ],
        },
        { type: 'li', children: [{ text: 'after nested item' }] },
        {
          type: 'li',
          children: [
            { text: 'still nested list item' },
          ],
        },
        {
          type: 'ul',
          children: [{ type: 'li', children: [{ text: 'I am nested' }] }],
        }
      ],
    },
    {
      type: 'li',
      children: [{ text: 'another list item' }],
    },
    {
      type: 'li',
      children: [{ text: 'still a list item' }],
    },
    {
      type: 'li',
      children: [{ text: 'random list item' }],
    },
    {
      type: 'li',
      children: [
        { text: 'another list item' },
      ],
    },
    {
      type: 'ul', children: [
        {
          type: 'li',
          children: [{ text: 'still a list item' }], // relocated to here
        },
      ]
    }
  ],
}];