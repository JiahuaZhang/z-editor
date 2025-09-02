import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

type DocumentSyncStatus = 'loading' | 'new' | 'saved';

type DocumentSynchronization = {
  syncStatus: DocumentSyncStatus;
  setSyncStatus: Dispatch<SetStateAction<DocumentSyncStatus>>;
};

const Context = createContext<DocumentSynchronization>({
  syncStatus: 'loading',
  setSyncStatus: () => {}
});

export const DocumentSynchronizationContext = ({ children }: { children: React.ReactNode; }) => {
  const [syncStatus, setSyncStatus] = useState<DocumentSyncStatus>('loading');

  return <Context.Provider value={{ syncStatus, setSyncStatus }}>{children}</Context.Provider>;
};

export const useDocumentSynchronizationContext = () => useContext(Context);

export const DocumentSynchronizationPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const { syncStatus, setSyncStatus } = useDocumentSynchronizationContext();

  return null;
};
