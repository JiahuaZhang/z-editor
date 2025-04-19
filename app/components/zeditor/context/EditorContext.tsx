import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { initialConfig } from '../config';
import { TableContext } from '../plugin/table/TablePlugin';
import { SharedHistoryContext } from './SharedHistoryContext';

export const EditorContext = ({ children }: { children: JSX.Element; }) => <LexicalComposer initialConfig={initialConfig} >
  <SharedHistoryContext>
    <TableContext>
      {children}
    </TableContext>
  </SharedHistoryContext>
</LexicalComposer>;