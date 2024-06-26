import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { ClientOnly } from 'remix-utils/client-only';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { $generateContent } from './init';
import { EmojiNode } from './plugin/emoji/EmojiNode';
import { EmojiPlugin } from './plugin/emoji/EmojiPlugin';

export const UnoStaticTrick = () => <div un-top='2' un-left='2' />;

const initialConfig = {
  namespace: 'MyEditor',
  theme: {
    heading: {
      h1: 'text-4xl font-bold text-blue-950 ',
      h2: 'text-3xl font-bold text-blue-9 ',
      h3: 'text-2xl font-bold text-blue-8 ',
      h4: 'text-xl font-bold text-blue-7 ',
      h5: 'text-lg font-bold text-blue-6 ',
      h6: 'text-base font-bold font-blue-5 '
    }
  },
  onError: console.error,
  nodes: [HeadingNode, EmojiNode],
  editorState: $generateContent
};

export const ZEditor = () => {
  return <ClientOnly>{() =>
    <div un-border='~ rounded 2' un-m='2' un-position='relative' >
      <SharedHistoryContext>
        <LexicalComposer initialConfig={initialConfig}>
          {/* ToolbarPlugin */}

          <RichTextPlugin
            contentEditable={<ContentEditable un-p='2' />}
            placeholder={<div un-position='absolute' un-top='2' un-left='2'>Enter some rich text...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />

          <EmojiPlugin />
        </LexicalComposer>
      </SharedHistoryContext>
    </div>
  }</ClientOnly>;
};