import { EditorThemeClasses, Klass, LexicalEditor, LexicalNode } from 'lexical';
import { createContext, useMemo, useState } from 'react';

export type CellEditorConfig = Readonly<{
  namespace: string;
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
  onError: (error: Error, editor: LexicalEditor) => void;
  readOnly?: boolean;
  theme?: EditorThemeClasses;
}>;

export type ContextShape = {
  cellEditorConfig: null | CellEditorConfig;
  cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  set: (
    cellEditorConfig: null | CellEditorConfig,
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>,
  ) => void;
};

export type CellContextShape = {
  cellEditorConfig: null | CellEditorConfig;
  cellEditorPlugins: null | JSX.Element | JSX.Element[];
  set: (
    cellEditorConfig: null | CellEditorConfig,
    cellEditorPlugins: null | JSX.Element | JSX.Element[],
  ) => void;
};

export const CellContext = createContext<CellContextShape>({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {},
});

export const TableContext = ({ children }: { children: JSX.Element; }) => {
  const [contextValue, setContextValue] = useState<{
    cellEditorConfig: null | CellEditorConfig;
    cellEditorPlugins: null | JSX.Element | JSX.Element[];
  }>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
  });

  return <CellContext.Provider value={useMemo(() => ({
    cellEditorConfig: contextValue.cellEditorConfig,
    cellEditorPlugins: contextValue.cellEditorPlugins,
    set: (cellEditorConfig, cellEditorPlugins) => setContextValue({ cellEditorConfig, cellEditorPlugins })
  }), [contextValue.cellEditorConfig, contextValue.cellEditorPlugins])} >
    {children}
  </CellContext.Provider>;
};