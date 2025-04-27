import { LexicalComposer } from '@lexical/react/LexicalComposer';
import _ from 'lodash';
import { generateInitConfig } from '../config';
import { HashTagContext } from '../plugin/hashtag/HashTagPlugin';
import { TimeNodeContext } from '../plugin/time/TimePlugin';
import { ActiveEditorContext } from './ActiveEditor';
import { FloatContext } from './FloatContext';
import { FloatingAnchorContext } from './FloatingAnchor';
import { SharedHistoryContext } from './SharedHistoryContext';
import { ToolbarContext } from './ToolbarContext';

export const EditorContext = ({ children }: { children: JSX.Element; }) => <LexicalComposer initialConfig={generateInitConfig(_.uniqueId(''))} >
  <ActiveEditorContext>
    <SharedHistoryContext>
      <FloatingAnchorContext>
        <ToolbarContext>
          <FloatContext>
            <HashTagContext>
              <TimeNodeContext>
                {children}
              </TimeNodeContext>
            </HashTagContext>
          </FloatContext>
        </ToolbarContext>
      </FloatingAnchorContext>
    </SharedHistoryContext>
  </ActiveEditorContext>
</LexicalComposer>;