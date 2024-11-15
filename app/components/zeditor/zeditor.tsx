import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { initialConfig } from './config';
import { useActiveEditor } from './context/activeEditor';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { Plugin } from './plugin/plugin';
import { TableContext } from './plugin/table/TablePlugin';
import { MATCHERS, validateUrl } from './util/url';

export const UnoStaticTrick = () => <div un-top='12.5' un-left='2' />;

const Plugins = () => {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  useActiveEditor();

  return <>
    <Plugin.Toolbar />
    <RichTextPlugin
      contentEditable={<ContentEditable un-p='2' un-z='10' />}
      placeholder={<div un-position='absolute' un-top='12.5' un-left='2' un-z='1' un-pointer-events='none' >Enter some rich text...</div>}
      ErrorBoundary={LexicalErrorBoundary}
    />
    <HistoryPlugin />
    <AutoFocusPlugin />
    <ListPlugin />
    <CheckListPlugin />
    <Plugin.Code.Highlight />
    <TablePlugin />
    <Plugin.Table.CellResizer />
    <Plugin.Table.HoverActinos />
    <Plugin.HashTag />
    <AutoLinkPlugin matchers={MATCHERS} />
    <LinkPlugin validateUrl={validateUrl} />
    <ClickableLinkPlugin disabled={isEditable} />
    <Plugin.Link.Float isLinkEditMode={isLinkEditMode} setIsLinkEditMode={setIsLinkEditMode} />
    <Plugin.Image.Insert />
    <Plugin.Image.Inline />
    {/* <Plugin.Emoji.Transform /> */}
    <Plugin.Emoji.Picker />
    <Plugin.Excalidraw />
    {/* <Plugin.AutoComplete /> */}

    {/* <TreeView editor={editor} /> */}
  </>;
};

export const ZEditor = () => {
  return <ClientOnly>{() =>
    <div un-border='~ rounded 2' un-m='2' un-position='relative' >
      <SharedHistoryContext>
        <TableContext>
          <LexicalComposer initialConfig={initialConfig} >
            <Plugins />
          </LexicalComposer>
        </TableContext>
      </SharedHistoryContext>
    </div>
  }</ClientOnly>;
};