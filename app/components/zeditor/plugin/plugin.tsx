import { CodeHighlightPlugin } from './code/CodeHighlightPlugin';
import { EmojiPickerPlugin } from './emoji/EmojiPickerPlugin';
import { EmojiPlugin } from './emoji/EmojiPlugin';
import { HashtagPlugin } from './hashtag/HashTagPlugin';
import { ImagePlugin } from './image/ImagePlugin';
import { InlineImagePlugin } from './inline-image/InlineImagePlugin';
import { FloatingLinkEditorPlugin } from './link/FloatingLinkEditorPlugin';
import { TableCellResizerPlugin } from './table/TableCellResizer';
import { TableHoverActionsPlugin } from './table/TableHoverActionsPlugin';
import { ToolbarPlugin } from './toolbar/ToolbarPlugin';

export namespace Plugin {
  export namespace Code {
    export const Highlight = CodeHighlightPlugin;
  }
  export namespace Table {
    export const CellResizer = TableCellResizerPlugin;
    export const HoverActinos = TableHoverActionsPlugin;
  }
  export namespace Emoji {
    export const Transform = EmojiPlugin;
    export const Picker = EmojiPickerPlugin;
  }
  export const HashTag = HashtagPlugin;
  export namespace Link {
    export const Float = FloatingLinkEditorPlugin;
  }
  export namespace Image {
    export const Insert = ImagePlugin;
    export const Inline = InlineImagePlugin;
  }
  export const Toolbar = ToolbarPlugin;
}