import { HistoryState, createEmptyHistoryState } from '@lexical/history';
import { createContext, useContext, useMemo } from 'react';

type ContextShape = { historyState: HistoryState; };

const Context = createContext<ContextShape | null>(null);

export const SharedHistoryContext = ({ children }: { children: JSX.Element; }) => {
  const historyContext = useMemo(() => ({ historyState: createEmptyHistoryState() }), []);
  return <Context.Provider value={historyContext}>{children}</Context.Provider>;
};

export const useSharedHistoryContext = () => {
  const historyContext = useContext(Context);
  if (!historyContext) {
    throw new Error('No history context found');
  }
  return historyContext;
};