import { atom, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { Editor, Element, Node, NodeEntry, Path, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useSelected, useSlateStatic } from 'slate-react';

export const CHECK_LIST_ITEM_TYPE = 'check-list-item';

export const UnorderedList = ({ children, attributes }: RenderElementProps) => {
  return <ul un-list='disc'
    un-pl='4'
    un-indent='[&>li]:-2'
    {...attributes} >
    {children}
  </ul>;
};

export const OrderedList = ({ children, attributes }: RenderElementProps) => {
  return <ol un-list='decimal'
    un-pl='4'
    un-indent='[&>li]:-1'
    {...attributes} >
    {children}
  </ol>;
};

export const ListItem = ({ children, attributes }: RenderElementProps) => {
  return <li {...attributes} >
    {children}
  </li>;
};

export const currentCheckListCheckBoxAtom = atom<HTMLInputElement | null>(null);
export const CheckListItem = ({ children, element, attributes }: RenderElementProps) => {
  const editor = useSlateStatic();
  const { checked } = element as any;
  const isSelected = useSelected();
  const ref = useRef<HTMLInputElement>(null);
  const setCurrentCheckListCheckBox = useSetAtom(currentCheckListCheckBoxAtom);

  useEffect(() => {
    if (isSelected) { setCurrentCheckListCheckBox(ref.current); }
  }, [isSelected]);

  return (
    <div un-flex='~ items-center'
      tabIndex={-1}
      {...attributes}
    >
      <input contentEditable={false}
        un-border='rounded'
        un-h='4'
        un-w='4'
        un-accent='blue-500'
        un-cursor='pointer'
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={event => {
          Transforms.setNodes(editor,
            { checked: event.target.checked, } as Partial<Element>,
            { at: ReactEditor.findPath(editor as ReactEditor, element) });
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            const path = ReactEditor.findPath(editor, element).concat(0);
            Transforms.select(editor, { path, offset: 0 });
            ReactEditor.focus(editor);
          } else if (event.key === 'ArrowLeft') {
            const path = ReactEditor.findPath(editor, element);
            const hasPrevious = Path.hasPrevious(path);
            if (!hasPrevious) return;
            Transforms.select(editor, { path: [...path, 0], offset: 0 });
            Transforms.move(editor, { unit: 'offset', reverse: true });
            ReactEditor.focus(editor);
          } else if (event.key === 'ArrowUp') {
            const path = ReactEditor.findPath(editor, element);
            const hasPrevious = Path.hasPrevious(path);
            if (!hasPrevious) return;

            const prevPath = Path.previous(path);
            const [prevNode] = Editor.node(editor, prevPath);
            if ((prevNode as any).type === CHECK_LIST_ITEM_TYPE) {
              (ref.current?.parentElement?.previousSibling?.firstChild as HTMLInputElement).focus();
            } else {
              const path = ReactEditor.findPath(editor, element).concat(0);
              Transforms.select(editor, { path, offset: 0 });
              Transforms.move(editor, { unit: 'line', reverse: true });
              ReactEditor.focus(editor);
            }
          } else if (event.key === 'ArrowDown') {
            const path = ReactEditor.findPath(editor, element);
            const nextPath = Path.next(path);
            try {
              const [nextNode] = Editor.node(editor, nextPath);
              if (nextNode) {
                if ((nextNode as any).type === CHECK_LIST_ITEM_TYPE) {
                  (ref.current?.parentElement?.nextSibling?.firstChild as HTMLInputElement).focus();
                } else {
                  const path = ReactEditor.findPath(editor, element).concat(0);
                  Transforms.select(editor, { path, offset: 0 });
                  Transforms.move(editor, { unit: 'line' });
                  ReactEditor.focus(editor);
                }
              }
            } catch (error) {
              const path = ReactEditor.findPath(editor, element).concat(0);
              Transforms.select(editor, { path, offset: 0 });
              ReactEditor.focus(editor);
            }
          }
        }}
      />
      <span un-flex='1'
        un-m='l-2'
        un-text={`${checked && 'gray-500'}`}
        un-font={`${checked && 'italic'}`}
        un-decoration={`${checked && 'line-through'}`}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </div >
  );
};

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

export const onKeyDownForCheckList = (event: React.KeyboardEvent, editor: Editor, input: HTMLInputElement | null) => {
  if (event.key === 'ArrowLeft') {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection);
      if (start.offset !== 0) return false;

      const [match] = Editor.nodes(editor, {
        match: n => (n as any).type === CHECK_LIST_ITEM_TYPE,
        at: start,
      });
      if (!match) return false;

      event.preventDefault();
      ReactEditor.blur(editor);
      input?.focus();
      return true;
    }
  } else if (event.key === 'ArrowRight') {
    const { selection } = editor;
    if (!selection || Range.isExpanded(selection)) return false;

    const [match] = Editor.nodes(editor, {
      match: n => (n as any).type === CHECK_LIST_ITEM_TYPE,
    });
    if (!match) return false;

    const [node, path] = match;
    if (Range.edges(selection)[0].offset !== Node.string(node).length) return false;

    const nextPath = Path.next(path);
    try {
      const [nextNode] = Editor.node(editor, nextPath);
      if ((nextNode as any).type === CHECK_LIST_ITEM_TYPE) {
        event.preventDefault();
        (input?.parentElement?.nextSibling?.firstChild as HTMLInputElement).focus();
        ReactEditor.blur(editor);
        return true;
      }
    } catch (error) {
      Transforms.move(editor, { unit: 'offset' });
    }
  }
  return false;
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
}, {
  type: CHECK_LIST_ITEM_TYPE,
  checked: true,
  children: [{ text: 'Slide to the left.' }],
},
{
  type: CHECK_LIST_ITEM_TYPE,
  checked: false,
  children: [{ text: 'Criss-cross.' }],
},
{
  type: CHECK_LIST_ITEM_TYPE,
  checked: true,
  children: [{ text: 'Criss-cross!' }],
},
{
  type: CHECK_LIST_ITEM_TYPE,
  checked: false,
  children: [{ text: 'Cha cha real smooth…' }],
},
{
  type: CHECK_LIST_ITEM_TYPE,
  checked: false,
  children: [{ text: "Let's go to work!" }],
},
{
  type: CHECK_LIST_ITEM_TYPE,
  checked: false,
  children: [{ text: "" }],
},];