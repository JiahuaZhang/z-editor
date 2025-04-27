import { LexicalComposer } from '@lexical/react/LexicalComposer';
import _ from 'lodash';
import { generateInitConfig } from '../config';
import { HashTagContext } from '../plugin/hashtag/HashTagPlugin';
import { TimeNodeContext } from '../plugin/time/TimePlugin';
import { ActiveEditorContext } from './activeEditor';
import { FloatingAnchorContext } from './floatingAnchor';
import { SharedHistoryContext } from './SharedHistoryContext';
import { ToolbarContext } from './ToolbarContext';

export const EditorContext = ({ children }: { children: JSX.Element; }) => <LexicalComposer initialConfig={generateInitConfig(_.uniqueId(''))} >
  <ActiveEditorContext>
    <SharedHistoryContext>
      <FloatingAnchorContext>
        <ToolbarContext>
          <HashTagContext>
            <TimeNodeContext>
              {children}
            </TimeNodeContext>
          </HashTagContext>
        </ToolbarContext>
      </FloatingAnchorContext>
    </SharedHistoryContext>
  </ActiveEditorContext>
</LexicalComposer>;