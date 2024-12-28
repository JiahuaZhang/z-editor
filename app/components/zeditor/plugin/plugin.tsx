import { AutocompletePlugin } from './auto-complete/AutoCompletePlugin';
import { CodeHighlightPlugin } from './code/CodeHighlightPlugin';
import { CollapsiblePlugin } from './collapsible/CollapsiblePlugin';
import { CommentPlugin } from './comment/CommentPlugin';
import { EmojiPickerPlugin } from './emoji/EmojiPickerPlugin';
import { EmojiPlugin } from './emoji/EmojiPlugin';
import { EquationPlugin } from './equation/EquationPlugin';
import { ExcalidrawPlugin } from './excalidraw/ExcalidrawPlugin';
import { HashtagPlugin } from './hashtag/HashTagPlugin';
import { HorizontalRulePlugin } from './horizontal-rule/HorizontalRulePlugin';
import { ImagePlugin } from './image/ImagePlugin';
import { InlineImagePlugin } from './inline-image/InlineImagePlugin';
import { LayoutPlugin } from './layout/LayoutPlugin';
import { FloatingLinkEditorPlugin } from './link/FloatingLinkEditorPlugin';
import { PageBreakPlugin } from './page-break/PageBreakPlugin';
import { ShortcutsPlugin } from './shortcut/ShortcutsPlugin';
import { SpecialTextPlugin } from './special/SpecialTextPlugin';
import { TableCellResizerPlugin } from './table/TableCellResizer';
import { TableHoverActionsPlugin } from './table/TableHoverActionsPlugin';
import { ToolbarPlugin } from './toolbar/ToolbarPlugin';
import { TwitterPlugin } from './twitter/TwitterPlugin';
import { YouTubePlugin } from './youtube/YouTubePlugin';

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
  export const Excalidraw = ExcalidrawPlugin;
  export const AutoComplete = AutocompletePlugin;
  export const Comment = CommentPlugin;
  export const Layout = LayoutPlugin;
  export const SpecialText = SpecialTextPlugin;
  export const Shortcuts = ShortcutsPlugin;
  export const HorizontalRule = HorizontalRulePlugin;
  export const PageBreak = PageBreakPlugin;
  export const Equation = EquationPlugin;
  export const Collapsible = CollapsiblePlugin;
  export const YouTube = YouTubePlugin;
  export const Twitter = TwitterPlugin;
}