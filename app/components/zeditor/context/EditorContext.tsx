import { LexicalComposer } from '@lexical/react/LexicalComposer';
import _ from 'lodash';
import { generateInitConfig } from '../config';
import { SharedHistoryContext } from './SharedHistoryContext';
import { ActiveEditorContext } from './activeEditor';

export const EditorContext = ({ children }: { children: JSX.Element; }) => <LexicalComposer initialConfig={generateInitConfig(_.uniqueId(''))} >
  <SharedHistoryContext>
    <ActiveEditorContext>
      {children}
    </ActiveEditorContext>
  </SharedHistoryContext>
</LexicalComposer>;