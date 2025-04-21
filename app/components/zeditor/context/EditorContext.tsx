import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { initialConfig } from '../config';
import { SharedHistoryContext } from './SharedHistoryContext';

export const EditorContext = ({ children }: { children: JSX.Element; }) => <LexicalComposer initialConfig={initialConfig} >
  <SharedHistoryContext>
    {children}
  </SharedHistoryContext>
</LexicalComposer>;