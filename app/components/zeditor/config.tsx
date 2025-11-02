import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { InitialConfigType } from '@lexical/react/LexicalComposer';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { $generateContent } from './init';
import { CollapsibleContainerNode } from './plugin/collapsible/CollapsibleContainerNode';
import { CollapsibleContentNode } from './plugin/collapsible/CollapsibleContentNode';
import { CollapsibleTitleNode } from './plugin/collapsible/CollapsibleTitleNode';
import { EmojiNode } from './plugin/emoji/EmojiNode';
import { EquationNode } from './plugin/equation/EuqationNode';
import { ExcalidrawNode } from './plugin/excalidraw/ExcalidrawNode';
import { HorizontalRuleNode } from './plugin/horizontal-rule/HorizontalRuleNode';
import { ImageNode } from './plugin/image/ImageNode';
import { InlineImageNode } from './plugin/inline-image/InlineImageNode';
import { LayoutContainerNode } from './plugin/layout/LayoutContainerNode';
import { LayoutItemNode } from './plugin/layout/LayoutItemNode';
import { PageBreakNode } from './plugin/page-break/PageBreakNode';
import { SpecialTextNode } from './plugin/special/SpecialTextNode';
import { StickyNode } from './plugin/sticky-note/StickNote';
import { TimeNode } from './plugin/time/TimeNode';
import { TweetNode } from './plugin/twitter/TweetNode';
import { YouTubeNode } from './plugin/youtube/YouTubeNode';
import { LexicalEditor, SerializedEditorState } from 'lexical';

export const initialConfig: InitialConfigType = {
  namespace: 'z-editor',
  theme: {
    heading: {
      h1: 'text-4xl font-bold text-slate-950 ',
      h2: 'text-3xl font-bold text-slate-900 ',
      h3: 'text-2xl font-bold text-slate-800 ',
      h4: 'text-xl font-bold text-slate-700 ',
      h5: 'text-lg font-bold text-slate-600 ',
      h6: 'text-base font-bold font-slate-500 '
    },
    text: {
      bold: '',
      capitalize: 'capitalize',
      code: 'bg-zinc-100 p-1 rounded text-sm font-mono',
      italic: '',
      lowercase: 'lowercase',
      strikethrough: 'line-through',
      subscript: '',
      superscript: '',
      underline: 'underline',
      underlineStrikethrough: 'underline line-through',
      uppercase: 'uppercase',
    },
    list: {
      checklist: 'pl-0',
      listitem: '',
      listitemChecked: 'line-through relative list-none pl-6 outline-none [&:before]:[content:""] [&:before]:absolute [&:before]:w-4 [&:before]:h-4 [&:before]:bg-blue-400 [&:before]:border-rounded-0.5 [&:before]:left-0 [&:before]:top-1 [&:before]:cursor-pointer	[&:after]:[content:""] [&:after]:absolute [&:after]:w-1.75 [&:after]:h-3.5 [&:after]:border-white [&:after]:border-r-2 [&:after]:border-b-2 [&:after]:rotate-45 [&:after]:left-1 [&:after]:top-1 [&:after]:cursor-pointer',
      listitemUnchecked: 'relative list-none pl-6 outline-none [&:before]:[content:""] [&:before]:absolute [&:before]:w-4 [&:before]:h-4 [&:before]:border-1 [&:before]:border-black [&:before]:border-rounded-0.5 [&:before]:left-0 [&:before]:top-1 [&:before]:cursor-pointer',
      nested: {
        listitem: 'list-none'
      },
      ul: 'list-disc pl-4',
      ol: 'list-decimal pl-4',
      olDepth: [],
    },
    quote: 'm-2 text-md text-gray-600 border-l-4 border-l-gray-400 pl-2',
    code: 'bg-zinc-100 text-sm font-mono relative block my-2 pl-7 [&:before]:[content:attr(data-gutter)] [&:before]:absolute [&:before]:bg-gray-200 [&:before]:left-0 [&:before]:min-w-6 [&:before]:text-right [&:before]:border-r-2 [&:before]:border-r-gray-600 [&:before]:pr-1 lexical-code-locator',
    codeHighlight: {
      atrule: 'text-purple-600',
      attr: 'text-sky-600',
      boolean: 'text-yellow-400',
      builtin: 'text-indigo-600',
      cdata: 'text-gray-400',
      char: 'text-green-500',
      class: 'text-amber-600',
      'class-name': 'text-blue-500',
      comment: 'text-gray-500',
      constant: 'text-purple-500',
      deleted: 'text-red-600',
      doctype: 'text-gray-500',
      entity: 'text-gray-500',
      function: 'text-blue-500',
      important: 'text-red-500',
      inserted: 'text-green-500',
      keyword: 'text-purple-600',
      namespace: 'text-gray-600',
      number: 'text-blue-400',
      operator: 'text-pink-600',
      prolog: 'text-gray-500',
      property: 'text-blue-500',
      punctuation: 'text-gray-700',
      regex: 'text-red-400',
      selector: 'text-green-600',
      string: 'text-green-500',
      symbol: 'text-orange-400',
      tag: 'text-red-500',
      url: 'text-blue-500',
      variable: 'text-red-400',
    },
    table: 'w-max border border-gray-300 border-rounded m-2',
    tableCell: 'min-w-24 p-1 border border-gray-400 zeditor-table-cell',
    // tableCellActionButton: 'PlaygroundEditorTheme__tableCellActionButton',
    // tableCellActionButtonContainer: 'PlaygroundEditorTheme__tableCellActionButtonContainer',
    // tableCellEditing: 'PlaygroundEditorTheme__tableCellEditing',
    // tableCellHeader: 'PlaygroundEditorTheme__tableCellHeader',
    // tableCellPrimarySelected: 'PlaygroundEditorTheme__tableCellPrimarySelected',
    // tableCellResizer: 'PlaygroundEditorTheme__tableCellResizer',
    tableCellSelected: 'bg-blue-100',
    // tableCellSortedIndicator: 'PlaygroundEditorTheme__tableCellSortedIndicator',
    // tableResizeRuler: 'PlaygroundEditorTheme__tableCellResizeRuler',
    tableRowStriping: 'even:[&>tr]:bg-teal-100',
    // tableSelected: 'PlaygroundEditorTheme__tableSelected',
    // tableSelection: 'PlaygroundEditorTheme__tableSelection',
    hashtag: 'bg-blue-200 border-b-blue-400 border-b-2',
    link: 'text-blue-700 hover:cursor-pointer hover:underline',
    keyword: 'prose prose-fuchsia',
    mention: 'bg-blue-200',
    image: 'relative inline-block',
    inlineImage: 'inline-block',
    hr: 'p-0.5 my-2 border-t-2 border-zinc-400',
    embedBlock: {
      base: '',
      focus: ''
    },
    details: 'border-1 border-rounded border-zinc-300 bg-zinc-50 position-relative p-1 [&[open]>summary:before]:(border-x-4 border-y-6 top-3 left-2.25 border-t-black border-l-transparent)',
    summary: 'cursor-pointer list-none px-4 [&:before]:(absolute [content:""] left-2.5 border-transparent border-x-6 border-y-4 top-3 border-l-black)',
    layoutContainer: 'grid gap-2 my-1',
    layoutItem: 'border-1 border-rounded border-dashed border-zinc-300',
    specialText: 'prose-rose prose',
    time: ''
  },
  onError: console.error,
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, CodeHighlightNode, TableNode, TableRowNode, TableCellNode, HashtagNode, LinkNode, AutoLinkNode, StickyNode, ImageNode, InlineImageNode, EmojiNode, ExcalidrawNode, EquationNode, HorizontalRuleNode, TweetNode, YouTubeNode, MarkNode, CollapsibleContainerNode, CollapsibleTitleNode, CollapsibleContentNode, PageBreakNode, LayoutContainerNode, LayoutItemNode, SpecialTextNode, TimeNode],
  // editorState: $generateContent,
  // editable: true
};

export const generateInitConfig = (namespace: string, document?: SerializedEditorState) => ({
  ...initialConfig,
  namespace,
  ...(document && {
    editorState: (editor: LexicalEditor) => {
      const editorState = editor.parseEditorState(document);
      editor.setEditorState(editorState);
    }
  }),
});