import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Editor, Path, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { BlockquoteDropDown, H1DropDown, H2DropDown, H3DropDown, H4DropDown, H5DropDown, H6DropDown, PDropDown } from '../../element/block';
import { CodeLeafDropDown, CodeLineType } from '../code';
import { HASH_TAG_TYPE, HashTagDropDown } from '../inline/hash-tag';
import { LINK_TYPE, LinkDropDown } from '../inline/link';
import { CHECK_LIST_ITEM_TYPE, CheckListItemDropDown, OrderedListDropDown, UnorderedListDropDown } from '../list/list';
import { InlinePanelType } from '../panel/inline-panel';
import { dropDownKeyAtom, dropDownMessageAtom, dropDownOptionsAtom } from './drop-down';

const DropDownItem = ({ icon, children }: { icon: string, children: React.ReactNode; }) => {
  const dropDownKey = useAtomValue(dropDownKeyAtom);

  return <div un-grid='~ flow-col'
    un-items='center'
    un-gap='1'
    un-cursor='pointer'
    un-rounded='~'
    un-bg={`hover:gray-200 ${dropDownKey === icon ? 'gray-200' : ''}`}
    un-text={`[&>i]:hover:blue-4 ${dropDownKey === icon ? 'blue-4' : ''}`}
    un-outline='none'
    un-p='1'
    onClick={event => event.stopPropagation()}
  >
    <i className={icon} />
    {children}
  </div>;
};

const headings = [
  ['i-ci:heading-h1', H1DropDown, 'h1'],
  ['i-ci:heading-h2', H2DropDown, 'h2'],
  ['i-ci:heading-h3', H3DropDown, 'h3'],
  ['i-ci:heading-h4', H4DropDown, 'h4'],
  ['i-ci:heading-h5', H5DropDown, 'h5'],
  ['i-ci:heading-h6', H6DropDown, 'h6'],
] as const;
const allHeadings = headings.map(([icon, Component]) => <DropDownItem key={icon} icon={icon}>
  <Component />
</DropDownItem>);

const basicBlocks = [
  ['i-carbon:text-short-paragraph', PDropDown, 'p'],
  ['i-carbon:quotes', BlockquoteDropDown, 'blockquote'],
  ['i-material-symbols-light:list', UnorderedListDropDown, 'ul'],
  ['i-material-symbols-light:format-list-numbered-sharp', OrderedListDropDown, 'ol'],
  ['i-material-symbols-light:checklist', CheckListItemDropDown, CHECK_LIST_ITEM_TYPE],
  ['i-ph:code-light', CodeLeafDropDown, CodeLineType],
  ['i-mdi:link-variant', LinkDropDown, LINK_TYPE],
  ['i-mdi:hashtag', HashTagDropDown, HASH_TAG_TYPE],
] as const;
const allBasicBlocks = basicBlocks.map(([icon, Component]) => <DropDownItem key={icon} icon={icon}>
  <Component />
</DropDownItem>);

const iconToType = Object.fromEntries([...headings, ...basicBlocks].map(([icon, _, type]) => [icon, type]));

const simpleType = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', CHECK_LIST_ITEM_TYPE];
const listType = ['ul', 'ol'];

const toggleElementType = (editor: Editor, type: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => (n as any)?.type === InlinePanelType,
  });
  if (!match) return false;

  if (simpleType.includes(type)) {
    const [node, path] = match;
    Transforms.removeNodes(editor, { at: path });

    const parentPath = Path.parent(path);
    const [parentNode] = Editor.node(editor, parentPath);

    if ((parentNode as any).type === 'li') {
      Transforms.splitNodes(editor, { at: path, always: true });
    }

    Transforms.setNodes(editor, { type }, { at: parentPath });
    ReactEditor.focus(editor);
    return true;
  } else if (listType.includes(type)) {
    const [node, path] = match;
    Transforms.removeNodes(editor, { at: path });

    const parentPath = Path.parent(path);
    Transforms.setNodes(editor, { type: 'li' }, { at: parentPath });
    Transforms.wrapNodes(editor,
      { type, children: [] },
      { match: n => (n as any).type === 'li' });

    ReactEditor.focus(editor);
    return true;
  }

  return true;
};

export const DefaultDropDown = () => {
  const [isHeadingExpanded, setIsHeadingExpanded] = useState(false);
  const [isBasicBlockExpanded, setIsBasicBlockExpanded] = useState(false);
  const [dropDownKey, setDropDownKey] = useAtom(dropDownKeyAtom);
  const setDropDownOptions = useSetAtom(dropDownOptionsAtom);
  const [dropDownMessage, setDropDownMessage] = useAtom(dropDownMessageAtom);
  const editor = useSlateStatic();

  useEffect(() => {
    const headingKeys = (isHeadingExpanded ? headings : [...headings.slice(0, 3), ['heading-expand']]).map(([icon, _]) => icon);
    const basicBlockKeys = (isBasicBlockExpanded ? basicBlocks : [...basicBlocks.slice(0, 3), ['basic-block-expand']]).map(([icon, _]) => icon);
    setDropDownOptions([...headingKeys, ...basicBlockKeys]);
  }, [isHeadingExpanded, isBasicBlockExpanded]);

  useEffect(() => {
    if (['enter', 'space-trigger'].includes(dropDownMessage)) {
      if (dropDownKey === 'heading-expand') {
        setIsHeadingExpanded(true);
        setDropDownKey(headings[3][0]);
        setDropDownMessage('');
        return;
      } else if (dropDownKey === 'basic-block-expand') {
        setIsBasicBlockExpanded(true);
        setDropDownKey(basicBlocks[3][0]);
        setDropDownMessage('');
        return;
      }

      // if (dropDownKey === 'i-ci:heading-h1') {
      //   const [match] = Editor.nodes(editor, {
      //     match: n => (n as any)?.type === InlinePanelType,
      //   });

      //   if (match) {
      //     const [node, path] = match;
      //     Transforms.removeNodes(editor, { at: path });

      //     // if current block is list? need to unwrap
      //     const parentPath = Path.parent(path);
      //     Transforms.setNodes(editor, { type: 'h1' }, { at: parentPath });
      //   }

      //   ReactEditor.focus(editor);
      //   setDropDownMessage('');
      //   return;
      // }

      const type = iconToType[dropDownKey];
      if (type) {
        toggleElementType(editor, type);
        setDropDownMessage('');
        return;
      }

      if (dropDownMessage === 'space-trigger') {
        setDropDownMessage('space');
        return;
      } else {
        setDropDownMessage('');
      }
    }

  }, [dropDownMessage]);

  return <div>
    <div>
      <h1 un-text='lg purple-800'
        un-font='bold'>
        Headings
      </h1>
      {isHeadingExpanded && allHeadings}

      {!isHeadingExpanded && allHeadings.slice(0, 3)}
      {!isHeadingExpanded && <div un-grid='~ flow-col'
        un-items='center'
        un-gap='1'
        un-cursor='pointer'
        un-rounded='~'
        un-bg={`hover:gray-200 ${dropDownKey === 'heading-expand' ? 'gray-200' : ''}`}
        un-text={`[&>button]:hover:blue-4 ${dropDownKey === 'heading-expand' ? 'blue-4' : ''}`}
        un-outline='none'
        un-p='1'
        role='button'
        onClick={event => {
          event.stopPropagation();
          setIsHeadingExpanded(true);
          setDropDownKey(headings[3][0]);
        }}
        onKeyDown={event => {
          if (['Enter', ' '].includes(event.key)) {
            setIsHeadingExpanded(true);
            setDropDownKey(headings[3][0]);
          }
        }}
      >
        <button>...</button>
      </div>}
    </div>
    <div>
      <h1 un-text='lg purple-800'
        un-font='bold'>
        Basic blocks
      </h1>
      {isBasicBlockExpanded && allBasicBlocks}

      {!isBasicBlockExpanded && allBasicBlocks.slice(0, 3)}
      {!isBasicBlockExpanded && <div un-grid='~ flow-col'
        un-items='center'
        un-gap='1'
        un-cursor='pointer'
        un-rounded='~'
        un-bg={`hover:gray-200 ${dropDownKey === 'basic-block-expand' ? 'gray-200' : ''}`}
        un-text={`[&>button]:hover:blue-4 ${dropDownKey === 'basic-block-expand' ? 'blue-4' : ''}`}
        un-outline='none'
        un-p='1'
        role='button'
        onClick={event => {
          event.stopPropagation();
          setIsBasicBlockExpanded(true);
          setDropDownKey(basicBlocks[3][0]);
        }}
        onKeyDown={event => {
          if (['Enter', ' '].includes(event.key)) {
            setIsBasicBlockExpanded(true);
            setDropDownKey(basicBlocks[3][0]);
          }
        }}
      >
        <button>...</button>
      </div>}
    </div>
  </div >;
};