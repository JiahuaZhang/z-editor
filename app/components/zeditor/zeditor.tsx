import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { SerializedEditorState } from 'lexical';
import { useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { EditorContext } from './context/EditorContext';
import { useCommentContext } from './plugin/comment/CommentContext';
import { Plugin } from './plugin/plugin';
import { MATCHERS, validateUrl } from './util/url';

export const UnoStaticTrick = () => <div un-top='2.25' un-left='6.5' un-text='zinc-600' />;

const Plugins = ({ comments, children, ...rest }: { comments?: any[]; children?: React.ReactNode; }) => {
  const isEditable = useLexicalEditable();
  const { setComments } = useCommentContext();

  useEffect(() => {
    setComments(comments ?? []);
  }, [comments]);

  return <main un-h='full' un-border=' solid blue-400' un-overflow-y='auto' un-flex='~ col' un-items='center' un-max-w='screen-xl' un-mx='auto' {...rest} >
    {/* <Plugin.Toolbar.Top /> */}
    <div un-grid='~' un-grid-flow='col' un-auto-cols='[1fr_max-content]' un-w='full' un-position='relative' >
      <RichTextPlugin
        contentEditable={
          <div>
            <ContentEditable un-p='2' un-pl='6' un-z='5' un-position='relative' id='lexical-content-deitable' un-min-h='[calc(100vh-90px)]' un-border='rounded-b 1 solid zinc-400'
            />
          </div>
        }
        placeholder={
          <div un-position='absolute' un-top='2.25' un-left='6.5' un-z='1' un-pointer-events='none' un-text='zinc-600' >Enter some rich text...</div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      {/* <Plugin.Comment /> */}
    </div >
    <Plugin.Popup />
    <Plugin.Toolbar.Floating />
    <HistoryPlugin />
    <AutoFocusPlugin />
    <ListPlugin />
    <CheckListPlugin />
    <Plugin.Code.Highlight />
    <Plugin.Code.ActionMenu />
    <TablePlugin />
    <Plugin.Table.CellResizer />
    <Plugin.Table.HoverActinos />
    <Plugin.Table.ActionMenu />
    <Plugin.HashTag />
    <AutoLinkPlugin matchers={MATCHERS} />
    <LinkPlugin validateUrl={validateUrl} />
    <ClickableLinkPlugin disabled={isEditable} />
    <Plugin.Link.Float />
    <Plugin.Image.Insert />
    <Plugin.Image.Inline />
    <Plugin.HorizontalRule />
    <Plugin.PageBreak />
    <Plugin.Emoji.Picker />
    <Plugin.Excalidraw />
    <Plugin.Layout />
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
    <TabIndentationPlugin />
    <Plugin.DraggableBlock />
    <Plugin.Time />
    <Plugin.DocumentSynchronization />

    <ClearEditorPlugin />

    {/* <Plugin.Emoji.Transform /> */}
    {/* <Plugin.AutoComplete /> */}
    {/* <Plugin.SpecialText /> */}
    {/* <Plugin.TabFocus /> */}
    {/* <SelectionAlwaysOnDisplay /> */}
    {/* <TreeView editor={editor} /> */}
    {children}
  </main>;
};

export const ZEditor = ({ document, comments, children, ...rest }: { document?: SerializedEditorState; comments?: any[]; children?: React.ReactNode; }) => <ClientOnly>{() =>
  <EditorContext document={document}>
    <Plugins comments={comments} {...rest} >
      {children}
    </Plugins>
  </EditorContext>
}</ClientOnly>;