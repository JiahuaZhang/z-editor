import { HistoryState, createEmptyHistoryState } from '@lexical/history';
import { ReactNode, createContext, useContext, useMemo } from 'react';

type ContextShape = { historyState?: HistoryState; };

const Context = createContext<ContextShape>({});

export const SharedHistoryContext = ({ children }: { children: ReactNode; }) => {
  const historyContext = useMemo(() => ({ historyState: createEmptyHistoryState() }), []);
  return <Context.Provider value={historyContext}>{children}</Context.Provider>;
};

export const useSharedHistoryContext = () => useContext(Context);