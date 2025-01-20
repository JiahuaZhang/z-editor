import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { ClientOnly } from 'remix-utils/client-only';
import { initialConfig } from './config';
import { useActiveEditor } from './context/activeEditor';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { Plugin } from './plugin/plugin';
import { TableContext } from './plugin/table/TablePlugin';
import { MATCHERS, validateUrl } from './util/url';

export const UnoStaticTrick = () => <div un-top='2.5' un-left='2.75' />;

const Plugins = ({ ...rest }) => {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  useActiveEditor();

  return <main un-h='100vh' un-overflow-y='auto' un-flex='~ col' un-items='center' un-max-w='screen-xl' un-mx='auto' {...rest} >
    <Plugin.Toolbar />
    <div un-grid='~' un-grid-flow='col' un-auto-cols='[1fr_max-content]' un-w='full' un-position='relative' >
    <RichTextPlugin
        contentEditable={
          <div>
            <ContentEditable un-p='2' un-pl='6' un-z='5' un-position='relative' id='lexical-content-deitable' />
          </div>
        }
        placeholder={
          <div un-position='absolute' un-top='2.5' un-left='2.75' un-z='1' un-pointer-events='none' >Enter some rich text...</div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <Plugin.Comment onChange={comments => {
        // persist comments
      }} />
    </div >
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
    <Plugin.Link.Float />
    <Plugin.Image.Insert />
    <Plugin.Image.Inline />
    {/* <Plugin.Emoji.Transform /> */}
    <Plugin.HorizontalRule />
    <Plugin.PageBreak />
    <Plugin.Emoji.Picker />
    <Plugin.Excalidraw />
    {/* <Plugin.AutoComplete /> */}
    <Plugin.Layout />
    {/* <Plugin.SpecialText /> */}
    <Plugin.Shortcuts />
    <Plugin.Equation />
    <Plugin.Collapsible />
    <Plugin.YouTube />
    <Plugin.Twitter />
    <Plugin.Embed />
    <Plugin.DragDropPaste />
    <Plugin.ComponentPicker />
    <Plugin.SpeechToText />
    <Plugin.Markdown />
    {/* <Plugin.TabFocus /> */}
    <TabIndentationPlugin />
    <Plugin.DraggableBlock />

    <ClearEditorPlugin />

    {/* <SelectionAlwaysOnDisplay /> */}
    {/* <TreeView editor={editor} /> */}
  </main>;
};

export const ZEditor = ({ ...rest }: {}) => {
  return <ClientOnly>{() =>
    <SharedHistoryContext>
      <TableContext>
        <LexicalComposer initialConfig={initialConfig} >
          <Plugins {...rest} />
        </LexicalComposer>
      </TableContext>
    </SharedHistoryContext>
  }</ClientOnly>;
};