import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin, MenuOption, useBasicTypeaheadTriggerMatch } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createTextNode, $getSelection, $isRangeSelection, TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { EmojiList } from './emoji-list';

class EmojiOption extends MenuOption {
  title: string;
  emoji: string;
  keywords: string[];

  constructor(title: string, emoji: string, options: { keywords?: string[]; },) {
    super(title);
    this.title = title;
    this.emoji = emoji;
    this.keywords = options.keywords || [];
  }
}

const EmojiMenuItem = ({ index, isSelected, onClick, onMouseEnter, option }: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmojiOption;
}) => {
  return <li un-grid='~'
    un-grid-flow='col'
    un-items='center'
    un-justify='start'
    un-gap='1'
    un-bg={`${isSelected ? 'blue-2' : ''}`}
    key={option.key}
    tabIndex={-1}
    ref={option.setRefElement}
    role="option"
    aria-selected={isSelected}
    id={'typeahead-item-' + index}
    onMouseEnter={onMouseEnter}
    onClick={onClick}>
    {option.emoji} {option.title}
  </li>;
};

const MAX_EMOJI_SUGGESTION_COUNT = 10;
const emojiOptions = EmojiList.map(
  ({ emoji, aliases, tags }) => new EmojiOption(aliases[0], emoji, { keywords: [...aliases, ...tags] })
);

export const EmojiPickerPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(':', { minLength: 0 });

  const options = useMemo(() => (queryString === null ? emojiOptions : emojiOptions.filter(
    option => new RegExp(queryString, 'gi').exec(option.title)
      || option.keywords.some(keyword => new RegExp(queryString, 'gi').exec(keyword))
  )).slice(0, MAX_EMOJI_SUGGESTION_COUNT), [queryString]);

  const onSelectOption = useCallback(
    (selectedOption: EmojiOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection === null || !$isRangeSelection(selection)) {
          return;
        }

        nodeToRemove?.remove();
        selection.insertNodes([$createTextNode(selectedOption.emoji)]);
        closeMenu();
      });
    },
    [editor],
  );

  return <LexicalTypeaheadMenuPlugin onQueryChange={setQueryString}
    triggerFn={checkForTriggerMatch}
    options={options}
    onSelectOption={onSelectOption}
    menuRenderFn={
      (anchorElement, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) =>
        (anchorElement.current
          && options.length > 0
          && createPortal(
            <div un-border='rounded 2 solid blue-1' un-min-w='80' un-bg='white'>
              <ul>{
                options.map((option, i) => <EmojiMenuItem key={option.key}
                  index={i}
                  isSelected={selectedIndex === i}
                  onClick={() => {
                    setHighlightedIndex(i);
                    selectOptionAndCleanUp(option);
                  }}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  option={option} />)}
              </ul>
            </div>,
            anchorElement.current
          )) as JSX.Element
    }
  />;
};