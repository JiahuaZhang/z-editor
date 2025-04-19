import { HistoryState, createEmptyHistoryState } from '@lexical/history';
import { createContext, useContext, useMemo } from 'react';

type ContextShape = { historyState?: HistoryState; };

const Context = createContext<ContextShape>({});

export const SharedHistoryContext = ({ children }: { children: JSX.Element; }) => {
  const historyContext = useMemo(() => ({ historyState: createEmptyHistoryState() }), []);
  return <Context.Provider value={historyContext}>{children}</Context.Provider>;
};

export const useSharedHistoryContext = () => useContext(Context);