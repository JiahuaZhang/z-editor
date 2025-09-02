import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

type DocumentSyncStatus = 'loading' | 'new' | 'saved';

type DocumentSynchronization = {
  state: DocumentSyncStatus;
  setState: Dispatch<SetStateAction<DocumentSyncStatus>>;
};

const Context = createContext<DocumentSynchronization>({
  state: 'loading',
  setState: () => {}
});

export const DocumentSynchronizationContext = ({ children }: { children: React.ReactNode; }) => {
  const [state, setState] = useState<DocumentSyncStatus>('loading');

  return <Context.Provider value={{ state, setState }}>{children}</Context.Provider>;
};

export const DocumentSynchronizationPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const { state, setState } = useContext(Context);

  return null;
};