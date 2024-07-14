import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ClientOnly } from 'remix-utils/client-only';
import { initialConfig } from './config';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { CodeHighlightPlugin } from './plugin/code/CodeHighlightPlugin';
import { EmojiPlugin } from './plugin/emoji/EmojiPlugin';
import { TableContext } from './plugin/table/TablePlugin';

export const UnoStaticTrick = () => <div un-top='2' un-left='2' />;

export const ZEditor = () => {
  return <ClientOnly>{() =>
    <>
      <div un-border='~ rounded 2' un-m='2' un-position='relative' >
        <SharedHistoryContext>
          <TableContext>
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
          </TableContext>
        </SharedHistoryContext>
      </div>
    </>
  }</ClientOnly>;
};