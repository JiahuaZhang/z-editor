import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { ListItemNode, ListNode } from '@lexical/list';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ClientOnly } from 'remix-utils/client-only';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { $generateContent } from './init';
import { CodeHighlightPlugin } from './plugin/code/CodeHighlightPlugin';
import { EmojiNode } from './plugin/emoji/EmojiNode';
import { EmojiPlugin } from './plugin/emoji/EmojiPlugin';

export const UnoStaticTrick = () => <div un-top='2' un-left='2' />;

const initialConfig = {
  namespace: 'z-editor',
  theme: {
    heading: {
      h1: 'text-4xl font-bold text-blue-950 ',
      h2: 'text-3xl font-bold text-blue-9 ',
      h3: 'text-2xl font-bold text-blue-8 ',
      h4: 'text-xl font-bold text-blue-7 ',
      h5: 'text-lg font-bold text-blue-6 ',
      h6: 'text-base font-bold font-blue-5 '
    },
    list: {
      checklist: 'pl-0',
      listitem: '',
      listitemChecked: 'line-through relative list-none pl-6 outline-none [&:before]:[content:""] [&:before]:absolute [&:before]:w-4 [&:before]:h-4 [&:before]:bg-blue-4 [&:before]:border-rounded-0.5 [&:before]:left-0 [&:before]:top-1 [&:before]:cursor-pointer	[&:after]:[content:""] [&:after]:absolute [&:after]:w-1.75 [&:after]:h-3.5 [&:after]:border-white [&:after]:border-r-2 [&:after]:border-b-2 [&:after]:rotate-45 [&:after]:left-1 [&:after]:top-1 [&:after]:cursor-pointer',
      listitemUnchecked: 'relative list-none pl-6 outline-none [&:before]:[content:""] [&:before]:absolute [&:before]:w-4 [&:before]:h-4 [&:before]:border-1 [&:before]:border-black [&:before]:border-rounded-0.5 [&:before]:left-0 [&:before]:top-1 [&:before]:cursor-pointer',
      nested: {
        listitem: 'list-none'
      },
      ul: 'list-disc pl-4',
      ol: 'list-decimal pl-4',
      olDepth: [],
    },
    quote: 'm-2 text-md text-gray-6 border-l-4 border-l-gray-4 pl-2',
    code: 'bg-zinc-1 text-sm font-mono relative block my-2 pl-7 [&:before]:[content:attr(data-gutter)] [&:before]:absolute [&:before]:bg-gray-2 [&:before]:left-0 [&:before]:min-w-6 [&:before]:text-right [&:before]:border-r-2 [&:before]:border-r-gray-6 [&:before]:pr-1',
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
    }
  },
  onError: console.error,
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, CodeHighlightNode, EmojiNode],
  editorState: $generateContent
};

export const ZEditor = () => {
  return <ClientOnly>{() =>
    <>
      <div un-border='~ rounded 2' un-m='2' un-position='relative' >
        <SharedHistoryContext>
          <LexicalComposer initialConfig={initialConfig}>
            {/* ToolbarPlugin */}

            <RichTextPlugin
              contentEditable={<ContentEditable un-p='2' un-z='10' />}
              placeholder={<div un-position='absolute' un-top='2' un-left='2' un-z='1' un-pointer-events='none' >Enter some rich text...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <CodeHighlightPlugin />

            <EmojiPlugin />
          </LexicalComposer>
        </SharedHistoryContext>
      </div>
    </>
  }</ClientOnly>;
};