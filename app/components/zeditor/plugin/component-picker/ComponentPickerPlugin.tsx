import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { useSetAtom } from 'jotai';
import { LexicalEditor, TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { isInsertingColumnLayoutAtom, isInsertingImageAtom, isInsertingTableAtom, isIsInsertEquationModeAtom } from '../toolbar/InsertDropDown';
import { ComponentPickerOption, generateOption, simpleOptions } from './generate-option';
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
  const setIsInsertingImage = useSetAtom(isInsertingImageAtom);
  const setIsInsertingTable = useSetAtom(isInsertingTableAtom);
  const setIsInsertEquationMode = useSetAtom(isIsInsertEquationModeAtom);
  const setIsInsertingColumnLayout = useSetAtom(isInsertingColumnLayoutAtom);
  const baseOptions = useMemo(() => [
    ...simpleOptions,
    new ComponentPickerOption('Table', {
      icon: <i className="i-material-symbols-light:table-outline" un-text='xl' />,
      keywords: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
      onSelect: (editor: LexicalEditor, queryString: string) => setIsInsertingTable(true),
    }),
    new ComponentPickerOption('Equation', {
      icon: <i className="i-ph:plus-minus" un-text='xl' />,
      keywords: ['equation', 'latex', 'math'],
      onSelect: (editor: LexicalEditor, queryString: string) => setIsInsertEquationMode(true)
    }),
    new ComponentPickerOption('Image', {
      icon: <i className="i-mdi:image-outline" un-text='xl' />,
      keywords: ['image', 'photo', 'picture', 'file'],
      onSelect: (editor: LexicalEditor, queryString: string) => setIsInsertingImage(true)
    }),
    new ComponentPickerOption('Columns Layout', {
      icon: <i className="i-material-symbols-light:view-column-outline" un-text='xl' />,
      keywords: ['columns', 'layout', 'grid'],
      onSelect: (editor: LexicalEditor, queryString: string) => setIsInsertingColumnLayout(true)
    }),
  ], []);

  const options = useMemo(() => {
    if (!queryString) return baseOptions;

    const dynamicOptions = generateOption(editor, queryString);
    if (dynamicOptions.end) return dynamicOptions.result;

    const regex = new RegExp(`^${queryString}`, 'i');
    return baseOptions.filter(option =>
      regex.test(option.title) ||
      option.keywords.some((keyword) => regex.test(keyword)),
    );
  }, [editor, queryString]);

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
