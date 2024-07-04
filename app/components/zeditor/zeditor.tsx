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
      listitemUnchecked: 'relative list-none pl-6 outline-none [&:before]:[content:""] [&:before]:absolute [&:before]:w-4 [&:before]:h-4 [&:before]:border-1 [&:before]:border-black [&:before]:border-rounded-0.5 [&:before]:left-0 [&:before]:top-1 [&:before]:cursor-pointer ',
      nested: {
        listitem: 'list-none'
      },
      ul: 'list-disc pl-4',
      ol: 'list-decimal pl-4',
      olDepth: [],
    }
  },
  onError: console.error,
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, EmojiNode],
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

            <EmojiPlugin />
          </LexicalComposer>
        </SharedHistoryContext>
      </div>
    </>
  }</ClientOnly>;
};