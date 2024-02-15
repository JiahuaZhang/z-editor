import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { BlockquoteDropDown, H1DropDown, H2DropDown, H3DropDown, H4DropDown, H5DropDown, H6DropDown, PDropDown } from '../../element/block';
import { CodeLeafDropDown } from '../code';
import { HashTagDropDown } from '../inline/hash-tag';
import { LinkDropDown } from '../inline/link';
import { CheckListItemDropDown, OrderedListDropDown, UnorderedListDropDown } from '../list/list';
import { dropDownActionAtom, dropDownFeedbackAtom, dropDownKeyAtom, dropDownOptionsAtom } from './drop-down';

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
  >
    <i className={icon} />
    {children}
  </div>;
};

const headings = [
  ['i-ci:heading-h1', H1DropDown],
  ['i-ci:heading-h2', H2DropDown],
  ['i-ci:heading-h3', H3DropDown],
  ['i-ci:heading-h4', H4DropDown],
  ['i-ci:heading-h5', H5DropDown],
  ['i-ci:heading-h6', H6DropDown],
] as const;
const allHeadings = headings.map(([icon, Component]) => <DropDownItem key={icon} icon={icon}>
  <Component />
</DropDownItem>);

const basicBlocks = [
  ['i-carbon:text-short-paragraph', PDropDown],
  ['i-carbon:quotes', BlockquoteDropDown],
  ['i-material-symbols-light:list', UnorderedListDropDown],
  ['i-material-symbols-light:format-list-numbered-sharp', OrderedListDropDown],
  ['i-material-symbols-light:checklist', CheckListItemDropDown],
  ['i-ph:code-light', CodeLeafDropDown],
  ['i-mdi:link-variant', LinkDropDown],
  ['i-mdi:hashtag', HashTagDropDown],
] as const;
const allBasicBlocks = basicBlocks.map(([icon, Component]) => <DropDownItem key={icon} icon={icon}>
  <Component />
</DropDownItem>);

export const DefaultDropDown = () => {
  const [isHeadingExpanded, setIsHeadingExpanded] = useState(false);
  const [isBasicBlockExpanded, setIsBasicBlockExpanded] = useState(false);
  const [dropDownKey, setDropDownKey] = useAtom(dropDownKeyAtom);
  const setDropDownOptions = useSetAtom(dropDownOptionsAtom);
  const [dropDownAction, setDropDownAction] = useAtom(dropDownActionAtom);
  const [dropDownFeedback, setDropDownFeedback] = useAtom(dropDownFeedbackAtom);

  useEffect(() => {
    const headingKeys = (isHeadingExpanded ? headings : [...headings.slice(0, 3), ['heading-expand']]).map(([icon, _]) => icon);
    const basicBlockKeys = (isBasicBlockExpanded ? basicBlocks : [...basicBlocks.slice(0, 3), ['basic-block-expand']]).map(([icon, _]) => icon);
    setDropDownOptions([...headingKeys, ...basicBlockKeys]);
  }, [isHeadingExpanded, isBasicBlockExpanded]);

  useEffect(() => {
    if (['space', 'enter'].includes(dropDownAction)) {
      if (dropDownKey === 'heading-expand') {
        setIsHeadingExpanded(true);
        setDropDownKey(headings[3][0]);
      } else if (dropDownKey === 'basic-block-expand') {
        setIsBasicBlockExpanded(true);
        setDropDownKey(basicBlocks[3][0]);
      }
      // todo
    }
  }, [dropDownAction]);

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
        onClick={() => { setIsHeadingExpanded(true); setDropDownKey(headings[3][0]); }}
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
        onClick={() => { setIsBasicBlockExpanded(true); setDropDownKey(basicBlocks[3][0]); }}
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