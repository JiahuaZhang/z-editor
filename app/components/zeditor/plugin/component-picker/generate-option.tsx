import { $createCodeNode } from '@lexical/code';
import { exportFile, importFile } from '@lexical/file';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { INSERT_EMBED_COMMAND } from '@lexical/react/LexicalAutoEmbedPlugin';
import { MenuOption } from '@lexical/react/LexicalNodeMenuPlugin';
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from '@lexical/rich-text';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $createParagraphNode, $createTextNode, $getSelection, $isRangeSelection, CLEAR_EDITOR_COMMAND, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, LexicalEditor } from "lexical";
import { clearFormat } from '../../util/utils';
import { INSERT_COLLAPSIBLE_COMMAND } from '../collapsible/CollapsiblePlugin';
import { EmbedConfigs } from '../embed/EmbedPlugin';
import { INSERT_EXCALIDRAW_COMMAND } from '../excalidraw/ExcalidrawPlugin';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '../horizontal-rule/HorizontalRuleNode';
import { INSERT_PAGE_BREAK } from '../page-break/PageBreakPlugin';
import { OPEN_COLUMN_LAYOUT_POPUP_COMMAND, OPEN_EQUATION_POPUP_COMMAND, OPEN_IMAGE_POPUP_COMMAND, OPEN_TABLE_POPUP_COMMAND } from '../popup/PopupPlugin';
import { TOGGLE_SPEECH_TO_TEXT_COMMAND } from '../speech/SpeechToTextPlugin';
import { EDITOR_FONTS } from '../toolbar/FontDropDown';

export class ComponentPickerOption extends MenuOption {
  title: string;
  icon?: JSX.Element;
  keywords: string[];
  keyboardShortcut?: string;
  onSelect: (editor: LexicalEditor, queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: string[];
      keyboardShortcut?: string;
      onSelect: (editor: LexicalEditor, queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

export const fontOptions = [
  new ComponentPickerOption('Bold', {
    icon: <i className="i-tabler:bold" un-text='xl' />,
    keywords: ['bold', 'strong', 'font style bold', 'font-style bold'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'),
  }),
  new ComponentPickerOption('Italic', {
    icon: <i className="i-ci:italic" un-text='xl' />,
    keywords: ['italic', 'font style italic', 'font-style italic'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'),
  }),
  new ComponentPickerOption('Underline', {
    icon: <i className="i-ci:underline" un-text='xl' />,
    keywords: ['underline', 'font style underline', 'font-style underline'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'),
  }),
  new ComponentPickerOption('Strikethrough', {
    icon: <span className="i-mdi:format-strikethrough" un-text='xl!' />,
    keywords: ['strikethrough', 'line-through'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'),
  }),
  new ComponentPickerOption('Align Left', {
    icon: <span className="i-mdi:format-align-left" un-text='xl!' />,
    keywords: ['align left', 'left align'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'),
  }),
  new ComponentPickerOption('Align Center', {
    icon: <span className="i-mdi:format-align-center" un-text='xl!' />,
    keywords: ['align center', 'center align'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'),
  }),
  new ComponentPickerOption('Align Right', {
    icon: <span className="i-mdi:format-align-right" un-text='xl!' />,
    keywords: ['align right', 'right align'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'),
  }),
  new ComponentPickerOption('Align Justify', {
    icon: <span className="i-mdi:format-align-right" un-text='xl!' />,
    keywords: ['align justify', 'justify align'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'),
  }),
  new ComponentPickerOption('Align Start', {
    icon: <span className="i-mdi:format-align-left" un-text='xl!' />,
    keywords: ['align start', 'start align'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'start'),
  }),
  new ComponentPickerOption('Align End', {
    icon: <span className="i-mdi:format-align-right" un-text='xl!' />,
    keywords: ['align end', 'end align'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'end'),
  }),
  ...EDITOR_FONTS.map(font => new ComponentPickerOption(font, {
    icon: <span className="i-bi:fonts" un-text='xl!' />,
    keywords: [font, `font ${font}`, `${font} font`, `font family ${font}`, `font-family ${font}`],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.update(
      () => {
        const selection = $getSelection();
        if (selection === null) return;
        $patchStyleText(selection, { 'font-family': font });
      }),
  })),
  new ComponentPickerOption('Lowercase', {
    icon: <span className="i-mdi:format-lowercase" un-text='xl!' />,
    keywords: ['lowercase', 'font style lowercase', 'font-style lowercase'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase'),
  }),
  new ComponentPickerOption('Uppercase', {
    icon: <span className="i-mdi:format-uppercase" un-text='xl!' />,
    keywords: ['uppercase', 'font style uppercase', 'font-style uppercase'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase'),
  }),
  new ComponentPickerOption('Capitalize', {
    icon: <span className="i-mdi:format-text" un-text='xl!' />,
    keywords: ['capitalize', 'font style capitalize', 'font-style capitalize'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize'),
  }),
  new ComponentPickerOption('Subscript', {
    icon: <span className="i-mdi:format-subscript" un-text='xl!' />,
    keywords: ['subscript', 'font style subscript', 'font-style subscript'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript'),
  }),
  new ComponentPickerOption('Superscript', {
    icon: <span className="i-mdi:format-superscript" un-text='xl!' />,
    keywords: ['superscript', 'font style superscript', 'font-style superscript'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript'),
  }),
];

export const simpleOptions = [
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
    keywords: ['block quote', 'quote', 'blockquote'],
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
  new ComponentPickerOption('Collapsible', {
    icon: <span className="i-mdi:triangle" un-text='xl' un-rotate='90' />,
    keywords: ['collapse', 'collapsible', 'toggle'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
  }),
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
    keywords: ['lock', 'read only', 'read'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.setEditable(false)
  }),
  new ComponentPickerOption('Image', {
    icon: <i className="i-mdi:image-outline" un-text='xl' />,
    keywords: ['image', 'photo', 'picture', 'file'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(OPEN_IMAGE_POPUP_COMMAND, undefined)
  }),
  new ComponentPickerOption('Table', {
    icon: <i className="i-material-symbols-light:table-outline" un-text='xl' />,
    keywords: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(OPEN_TABLE_POPUP_COMMAND, undefined),
  }),
  new ComponentPickerOption('Columns Layout', {
    icon: <i className="i-material-symbols-light:view-column-outline" un-text='xl' />,
    keywords: ['columns', 'layout', 'grid'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(OPEN_COLUMN_LAYOUT_POPUP_COMMAND, undefined)
  }),
  new ComponentPickerOption('Equation', {
    icon: <i className="i-ph:plus-minus" un-text='xl' />,
    keywords: ['equation', 'latex', 'math'],
    onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(OPEN_EQUATION_POPUP_COMMAND, undefined)
  }),
  new ComponentPickerOption('Link', {
    icon: <i className="i-ci:link" un-text='xl' />,
    keywords: ['link', 'url', 'hyperlink'],
    onSelect: (editor: LexicalEditor, queryString: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection && $isRangeSelection(selection)) {
          const textNode = $createTextNode('link');
          selection.insertNodes([textNode]);
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
        }
      });
    }
  }),
  new ComponentPickerOption('Clear Formatting', {
    icon: <span className="i-mdi:format-clear" un-text='xl!' />,
    keywords: ['clear', 'formatting', 'clear formatting', 'clear-formatting'],
    onSelect: (editor: LexicalEditor, queryString: string) => clearFormat(editor),
  }),
  ...fontOptions
];

export const generateOption = (text: string | null) => {
  if (!text) return simpleOptions;

  const headingOptions = generateHeadingOption(text);
  if (headingOptions.end) return headingOptions.result;

  const tableOptions = generateTableOption(text);
  if (tableOptions.end) return tableOptions.result;

  const codeOptions = generateCodeOption(text);
  if (codeOptions.end) return codeOptions.result;

  const textRegex = new RegExp(`^${text}`, 'i');
  return simpleOptions.filter(option => textRegex.test(option.title)
    || option.keywords.some(keyword => textRegex.test(keyword)));
};

export const fullHeaderRegexp = /^(h|H)(ead|eading|eader)?\s?(?<level>[1-6])$/;
export const partialHeaderRegExp = /^(h|H)(?:e(?:a(?:d(?:e(?:r)?|i(?:n(?:g)?)?)?)?)?)?\s?$/i;
const generateHeadingOption = (text: string) => {
  let match = fullHeaderRegexp.exec(text);
  if (match) {
    const level = match.groups?.level;
    return {
      end: true,
      result: [new ComponentPickerOption(`Heading ${level}`, {
        icon: <i className={`i-ci:heading-h${level}`} un-text='xl' />,
        onSelect: (editor: LexicalEditor, queryString: string) =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(`h${level}` as HeadingTagType));
            }
          }),
      })]
    };
  }

  match = partialHeaderRegExp.exec(text);
  if (!match) return { end: false, result: [] };

  const header = ['heading ', 'Heading ', 'header ', 'Header '].find(item => item.startsWith(match[0]));
  return {
    end: true,
    result: [1, 2, 3, 4, 5, 6].map(level => new ComponentPickerOption(`${header}${level}`, {
      icon: <i className={`i-ci:heading-h${level}`} un-text='xl' />,
      onSelect: (editor: LexicalEditor, queryString: string) =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode(`h${level}` as HeadingTagType));
          }
        }),
    }))
  };
};

const generateTableOption = (text: string) => {
  const tableMatch = text.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

  if (!tableMatch) return { end: false, result: [] };

  const rows = tableMatch[1];
  const colOptions = tableMatch[2] ? [tableMatch[2]] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);
  return {
    end: true,
    result: colOptions.map(columns => new ComponentPickerOption(`${rows}x${columns} Table`, {
      icon: <i className="i-material-symbols-light:table-outline" un-text='xl' />,
      keywords: ['table'],
      onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
    }))
  };
};

const codeLanguages = {
  c: ['c'],
  clike: ['C-like', 'clike'],
  cpp: ['cpp', 'c++'],
  css: ['css'],
  html: ['html'],
  java: ['java'],
  js: ['js', 'javascript'],
  markdown: ['md', 'markdown'],
  objc: ['objc', 'objective-c', 'objective c'],
  plain: ['plain text', 'text'],
  powershell: ['powershell'],
  py: ['py', 'python'],
  rust: ['rust'],
  sql: ['sql'],
  swift: ['swift'],
  typescript: ['ts', 'typescript'],
  xml: ['xml'],
};
const generateCodeComponentPickerOption = (name: string, filter: string[]) =>
  new ComponentPickerOption(name, {
    icon: <i className="i-ph:code-bold" un-text='xl' />,
    keywords: filter.map(f => `code ${f}`),
    onSelect: (editor: LexicalEditor, queryString: string) =>
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode(name));
          } else {
            // Will this ever happen?
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode(name);
            selection.insertNodes([codeNode]);
            selection.insertRawText(textContent);
          }
        }
      }),
  });
const allCodeOptions = Object.entries(codeLanguages)
  .map(([key, value]) => generateCodeComponentPickerOption(key, value));

const generateCodeOption = (text: string) => {
  if (!/^code/i.test(text)) return {
    end: false,
    result: []
  };

  const textRegex = new RegExp(`^${text}`, 'i');
  return {
    end: true,
    result: allCodeOptions.filter(
      option => option.keywords.some(keyword => textRegex.test(keyword))
    )
  };
};