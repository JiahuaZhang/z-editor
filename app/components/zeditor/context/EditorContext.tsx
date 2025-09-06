import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { SerializedEditorState } from 'lexical';
import _ from 'lodash';
import { generateInitConfig } from '../config';
import { CommentContext } from '../plugin/comment/CommentContext';
import { DocumentSynchronizationContext } from '../plugin/document-synchronization/DocumentSynchronizationPlugin';
import { HashTagContext } from '../plugin/hashtag/HashTagPlugin';
import { TimeNodeContext } from '../plugin/time/TimePlugin';
import { ActiveEditorContext } from './ActiveEditor';
import { FloatContext } from './FloatContext';
import { FloatingAnchorContext } from './FloatingAnchor';
import { SharedHistoryContext } from './SharedHistoryContext';
import { ToolbarContext } from './ToolbarContext';

export const EditorContext = ({ children, document }: { children: JSX.Element; document?: SerializedEditorState; }) => <LexicalComposer initialConfig={generateInitConfig(_.uniqueId(''), document)} >
  <ActiveEditorContext>
    <SharedHistoryContext>
      <FloatingAnchorContext>
        <ToolbarContext>
          <FloatContext>
            <CommentContext>
              <HashTagContext>
                <TimeNodeContext>
                  <DocumentSynchronizationContext>
                    {children}
                  </DocumentSynchronizationContext>
                </TimeNodeContext>
              </HashTagContext>
            </CommentContext>
          </FloatContext>
        </ToolbarContext>
      </FloatingAnchorContext>
    </SharedHistoryContext>
  </ActiveEditorContext>
</LexicalComposer>;