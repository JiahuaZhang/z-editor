import { Editor, Path, Transforms } from 'slate';

export const onKeyDownForList = (event: React.KeyboardEvent, editor: Editor) => {
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