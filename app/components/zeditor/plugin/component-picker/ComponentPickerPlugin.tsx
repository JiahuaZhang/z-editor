import { $createCodeNode } from '@lexical/code';
import { exportFile, importFile } from '@lexical/file';
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { INSERT_EMBED_COMMAND } from '@lexical/react/LexicalAutoEmbedPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { useSetAtom } from 'jotai';
import { $createParagraphNode, $getSelection, $isRangeSelection, CLEAR_EDITOR_COMMAND, FORMAT_ELEMENT_COMMAND, LexicalEditor, TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { INSERT_COLLAPSIBLE_COMMAND } from '../collapsible/CollapsiblePlugin';
import { EmbedConfigs } from '../embed/EmbedPlugin';
import { INSERT_EXCALIDRAW_COMMAND } from '../excalidraw/ExcalidrawPlugin';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '../horizontal-rule/HorizontalRuleNode';
import { INSERT_PAGE_BREAK } from '../page-break/PageBreakPlugin';
import { TOGGLE_SPEECH_TO_TEXT_COMMAND } from '../speech/SpeechToTextPlugin';
import { isInsertingColumnLayoutAtom, isInsertingImageAtom, isInsertingTableAtom, isIsInsertEquationModeAtom } from '../toolbar/InsertDropDown';
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
  const setIsInsertingImage = useSetAtom(isInsertingImageAtom);
  const setIsInsertingTable = useSetAtom(isInsertingTableAtom);
  const setIsInsertEquationMode = useSetAtom(isIsInsertEquationModeAtom);
  const setIsInsertingColumnLayout = useSetAtom(isInsertingColumnLayoutAtom);
  const baseOptions = useMemo(() => [
    new ComponentPickerOption('Paragraph', {
      icon: <i className="i-system-uicons:paragraph-left" un-text='xl' />,
      keywords: ['normal', 'paragraph', 'p', 'text'],
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, $createParagraphNode);
          }
        }),
    }),
    ...([1, 2, 3] as const).map(
      (n) =>
        new ComponentPickerOption(`Heading ${n}`, {
          icon: <i className={`i-ci:heading-h${n}`} un-text='xl' />,
          keywords: ['heading', 'header', `h${n}`],
          onSelect: (editor: LexicalEditor, queryString: string) =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
              }
            }),
        }),
    ),
    new ComponentPickerOption('Table', {
      icon: <i className="i-material-symbols-light:table-outline" un-text='xl' />,
      keywords: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
      onSelect: (editor: LexicalEditor, queryString: string) => setIsInsertingTable(true),
    }),
    new ComponentPickerOption('Numbered List', {
      icon: <i className="i-ph:list-numbers" un-text='xl' />,
      keywords: ['numbered list', 'ordered list', 'ol', 'list'],
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption('Bulleted List', {
      icon: <i className="i-ph:list-bullets" un-text='xl' />,
      keywords: ['bulleted list', 'unordered list', 'ul', 'list'],
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption('Check List', {
      icon: <i className="i-material-symbols-light:check-box-outline" un-text='xl' />,
      keywords: ['checklist', 'check list', 'todo list', 'list'],
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption('Quote', {
      icon: <i className="i-mdi:format-quote-open" un-text='xl' />,
      keywords: ['block quote'],
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, $createQuoteNode);
          }
        }),
    }),
    new ComponentPickerOption('Code', {
      icon: <i className="i-ph:code-bold" un-text='xl' />,
      keywords: ['javascript', 'python', 'js', 'codeblock'],
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, $createCodeNode);
            } else {
              // Will this ever happen?
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    new ComponentPickerOption('Divider', {
      icon: <i className="i-material-symbols-light:horizontal-rule" un-text='xl' />,
      keywords: ['horizontal rule', 'divider', 'hr'],
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),
    new ComponentPickerOption('Page Break', {
      icon: <i className="i-mdi:scissors" un-text='xl' />,
      keywords: ['page break', 'divider'],
      onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(INSERT_PAGE_BREAK, undefined),
    }),
    new ComponentPickerOption('Excalidraw', {
      icon: <i className="i-ph:graph" un-text='xl' />,
      keywords: ['excalidraw', 'diagram', 'drawing'],
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
    }),
    ...EmbedConfigs.map(
      (embedConfig) =>
        new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
          icon: embedConfig.icon,
          keywords: [...embedConfig.keywords, 'embed'],
          onSelect: (editor: LexicalEditor, queryString: string) =>
            editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type),
        }),
    ),
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
    new ComponentPickerOption('Collapsible', {
      icon: <span className="i-mdi:triangle" un-text='xl' un-rotate='90' />,
      keywords: ['collapse', 'collapsible', 'toggle'],
      onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
    }),
    new ComponentPickerOption('Columns Layout', {
      icon: <i className="i-material-symbols-light:view-column-outline" un-text='xl' />,
      keywords: ['columns', 'layout', 'grid'],
      onSelect: (editor: LexicalEditor, queryString: string) => setIsInsertingColumnLayout(true)
    }),
    ...(['left', 'center', 'right', 'justify'] as const).map(
      (alignment) =>
        new ComponentPickerOption(`Align ${alignment}`, {
          icon: <i className={`i-mdi:format-align-${alignment}`} un-text='lg' />,
          keywords: ['align', 'justify', alignment],
          onSelect: (editor: LexicalEditor, queryString: string) =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment),
        }),
    ),
    new ComponentPickerOption('Speech to Text', {
      icon: <span className="i-material-symbols-light:mic" un-text='xl' />,
      keywords: ['speech to text', 'stt'],
      onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(TOGGLE_SPEECH_TO_TEXT_COMMAND, undefined),
    }),
    new ComponentPickerOption('Import', {
      icon: <span className="i-circum:import" un-text='xl' />,
      keywords: ['import', 'file'],
      onSelect: (editor: LexicalEditor, queryString: string) => importFile(editor)
    }),
    new ComponentPickerOption('Export', {
      icon: <span className="i-circum:export" un-text='xl' />,
      keywords: ['export', 'file'],
      onSelect: (editor: LexicalEditor, queryString: string) => exportFile(editor)
    }),
    new ComponentPickerOption('Clear', {
      icon: <span className="i-mdi:trash" un-text='xl red-6' />,
      keywords: ['clear', 'trash'],
      onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
    }),
    new ComponentPickerOption('Read-Only Mode', {
      icon: <span className="i-mdi:lock" un-text='xl zinc-4' />,
      keywords: ['lock', 'read-only', 'read'],
      onSelect: (editor: LexicalEditor, queryString: string) => editor.setEditable(false)
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
    )
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
