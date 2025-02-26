import { MenuOption } from '@lexical/react/LexicalNodeMenuPlugin';
import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $getSelection, $isRangeSelection, LexicalEditor } from "lexical";

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

export const generateOption = (editor: LexicalEditor, text: string) => {
  if (!text) return { end: true, result: [] };

  const headingOptions = generateHeadingOption(text);
  if (headingOptions.end) return headingOptions;

  const tableOptions = generateTableOption(text);
  if (tableOptions.end) return tableOptions;

  return {
    end: false,
    result: []
  }
}

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
    }
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
  }
}

const generateTableOption = (text: string) => {
  const tableMatch = text.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

  if (!tableMatch) return { end: false, result: [] };

  const rows = tableMatch[1];
  const colOptions = tableMatch[2] ? [tableMatch[2]] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);
  return {
    end: true, result: colOptions.map(columns => new ComponentPickerOption(`${rows}x${columns} Table`, {
      icon: <i className="i-material-symbols-light:table-outline" un-text='xl' />,
      keywords: ['table'],
      onSelect: (editor: LexicalEditor, queryString: string) => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
    }))
  }
}