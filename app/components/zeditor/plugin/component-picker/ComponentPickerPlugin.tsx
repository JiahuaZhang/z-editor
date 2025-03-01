import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ComponentPickerOption, generateOption } from './generate-option';
import { slashPattern } from './trigger-pattern';

const ComponentPickerMenuItem = ({ index, isSelected, onClick, onMouseEnter, option }: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}) => {
  return (
    <li un-bg={`${isSelected && 'blue-1'}`}
      un-grid='~'
      un-grid-flow='col'
      un-justify='start'
      un-items='center'
      un-gap='1'
      un-p='0.5'
      un-border='rounded'
      key={option.key}
      tabIndex={-1}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}>
      {option.icon} {option.title}
    </li>
  );
};

export const ComponentPickerMenuPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const options = useMemo(() => generateOption(queryString), [editor, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => editor.update(() => {
      nodeToRemove?.remove();
      selectedOption.onSelect(editor, matchingString);
      closeMenu();
    }),
    [editor],
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={slashPattern}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex, options },
          matchingString
        ) =>
          anchorElementRef.current && options.length
            ? createPortal(
              <ul un-w='50' un-max-h='50' un-overflow-y='auto' un-border='rounded 2 solid blue-1' un-bg='white' un-position='relative' un-z='5'>
                {options.map((option, index) => (
                  <ComponentPickerMenuItem
                    index={index}
                    isSelected={selectedIndex === index}
                    onClick={() => {
                      setHighlightedIndex(index);
                      selectOptionAndCleanUp(option);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    key={option.key}
                    option={option}
                  />
                ))}
              </ul>,
              anchorElementRef.current,
            )
            : null
        }
      />
    </>
  );
};
