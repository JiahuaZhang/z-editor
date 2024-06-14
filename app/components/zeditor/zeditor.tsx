import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Suspense } from 'react';
import { EmojiNode } from './plugin/emoji/EmojiNode';
import { EmojiPlugin } from './plugin/emoji/EmojiPlugin';

export const UnoStaticTrick = () => <div un-top='2' un-left='2' />;

const initialConfig = {
  namespace: 'MyEditor',
  theme: {},
  onError: console.error,
  nodes: [EmojiNode]
};

export const ZEditor = () => {
  return <Suspense>
    <div un-border='~ rounded 2' un-m='2' un-position='relative' >
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable un-p='2' />}
          placeholder={<div un-position='absolute' un-top='2' un-left='2'>Enter some rich text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <EmojiPlugin />
      </LexicalComposer>
    </div>
  </Suspense>;
};