import { useState } from 'react';
import { BlockquoteDropDown, H1DropDown, H2DropDown, H3DropDown, H4DropDown, H5DropDown, H6DropDown, PDropDown } from '../../element/block';
import { CodeLeafDropDown } from '../code';
import { HashTagDropDown } from '../inline/hash-tag';
import { LinkDropDown } from '../inline/link';
import { CheckListItemDropDown, OrderedListDropDown, UnorderedListDropDown } from '../list/list';
import { TAB_INDEX } from './drop-down';

const navigateDropDown = (event: React.KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    const focusableElements = document.querySelectorAll<HTMLElement>(`[tabindex="${TAB_INDEX}"]`);
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowUp') {
      focusableElements[currentIndex > 1 ? currentIndex - 1 : 0]?.focus();
    } else {
      focusableElements[currentIndex + 1 < focusableElements.length ? currentIndex + 1 : currentIndex]?.focus();
    }
  }
};

const DropDownItem = ({ icon, children }: { icon: string, children: React.ReactNode; }) => {
  return <div un-grid='~ flow-col'
    un-items='center'
    un-gap='1'
    un-cursor='pointer'
    un-rounded='~'
    un-bg='hover:gray-200 focus:gray-200'
    un-text='[&>i]:hover:blue-4 [&>i]:focus:blue-4'
    un-outline='none'
    un-p='1'
    tabIndex={TAB_INDEX}
    onKeyDown={navigateDropDown}
  >
    <i className={icon} />
    {children}
  </div>;
};

const allHeadings = ([
  ['i-ci:heading-h1', H1DropDown],
  ['i-ci:heading-h2', H2DropDown],
  ['i-ci:heading-h3', H3DropDown],
  ['i-ci:heading-h4', H4DropDown],
  ['i-ci:heading-h5', H5DropDown],
  ['i-ci:heading-h6', H6DropDown],
] as const)
  .map(([icon, Component]) => <DropDownItem key={icon} icon={icon}>
    <Component />
  </DropDownItem>);

const allBasicBlocks = ([
  ['i-carbon:text-short-paragraph', PDropDown],
  ['i-carbon:quotes', BlockquoteDropDown],
  ['i-material-symbols-light:list', UnorderedListDropDown],
  ['i-material-symbols-light:format-list-numbered-sharp', OrderedListDropDown],
  ['i-material-symbols-light:checklist', CheckListItemDropDown],
  ['i-ph:code-light', CodeLeafDropDown],
  ['i-mdi:link-variant', LinkDropDown],
  ['i-mdi:hashtag', HashTagDropDown],
] as const).map(([icon, Component]) => <DropDownItem key={icon} icon={icon}>
  <Component />
</DropDownItem>);

export const DefaultDropDown = () => {
  const [isHeadingExpanded, setIsHeadingExpanded] = useState(false);
  const [isBasicBlockExpanded, setIsBasicBlockExpanded] = useState(false);

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
        un-bg='hover:gray-200 focus:gray-200'
        un-text='[&>button]:hover:blue-4 [&>button]:focus:blue-4'
        un-outline='none'
        un-p='1'
        tabIndex={TAB_INDEX}
        role='button'
        onClick={() => setIsHeadingExpanded(true)}
        onKeyDown={event => {
          if (['Enter', ' '].includes(event.key)) {
            setIsHeadingExpanded(true);

            const focusableElements = document.querySelectorAll<HTMLElement>(`[tabindex="${TAB_INDEX}"]`);
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);
            Promise.resolve()
              .then(() => {
                const focusableElements = document.querySelectorAll<HTMLElement>(`[tabindex="${TAB_INDEX}"]`);
                focusableElements[currentIndex].focus();
              });
          } else {
            navigateDropDown(event);
          }
        }}
      >
        <button tabIndex={-1}>...</button>
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
        un-bg='hover:gray-200 focus:gray-200'
        un-text='[&>button]:hover:blue-4 [&>button]:focus:blue-4'
        un-outline='none'
        un-p='1'
        tabIndex={TAB_INDEX}
        role='button'
        onClick={() => setIsBasicBlockExpanded(true)}
        onKeyDown={event => {
          if (['Enter', ' '].includes(event.key)) {
            setIsBasicBlockExpanded(true);

            const focusableElements = document.querySelectorAll<HTMLElement>(`[tabindex="${TAB_INDEX}"]`);
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);
            Promise.resolve()
              .then(() => {
                const focusableElements = document.querySelectorAll<HTMLElement>(`[tabindex="${TAB_INDEX}"]`);
                focusableElements[currentIndex].focus();
              });
          } else {
            navigateDropDown(event);
          }
        }}
      >
        <button tabIndex={-1} >...</button>
      </div>}
    </div>
  </div >;
};