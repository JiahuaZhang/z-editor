import { CodeHighlightPlugin } from './code/CodeHighlightPlugin';
import { EmojiPlugin } from './emoji/EmojiPlugin';
import { TableCellResizerPlugin } from './table/TableCellResizer';

export namespace Plugin {
  export namespace Code {
    export const Highlight = CodeHighlightPlugin;
  }
  export namespace Table {
    export const CellResizer = TableCellResizerPlugin;
  }
  export const Emoji = EmojiPlugin;
}