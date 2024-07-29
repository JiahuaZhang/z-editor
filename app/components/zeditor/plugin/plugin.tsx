import { CodeHighlightPlugin } from './code/CodeHighlightPlugin';
import { EmojiPlugin } from './emoji/EmojiPlugin';
import { TableCellResizerPlugin } from './table/TableCellResizer';
import { TableHoverActionsPlugin } from './table/TableHoverActionsPlugin';

export namespace Plugin {
  export namespace Code {
    export const Highlight = CodeHighlightPlugin;
  }
  export namespace Table {
    export const CellResizer = TableCellResizerPlugin;
    export const HoverActinos = TableHoverActionsPlugin;
  }
  export const Emoji = EmojiPlugin;
}