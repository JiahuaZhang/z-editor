import { CodeHighlightPlugin } from './code/CodeHighlightPlugin';
import { EmojiPlugin } from './emoji/EmojiPlugin';
import { HashtagPlugin } from './hashtag/HashTagPlugin';
import { FloatingLinkEditorPlugin } from './link/FloatingLinkEditorPlugin';
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
  export const HashTag = HashtagPlugin;
  export namespace Link {
    export const Float = FloatingLinkEditorPlugin;
  }
}