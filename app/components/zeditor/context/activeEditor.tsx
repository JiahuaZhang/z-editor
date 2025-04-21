import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { atom, useSetAtom } from 'jotai';
import { COMMAND_PRIORITY_CRITICAL, LexicalEditor, SELECTION_CHANGE_COMMAND } from 'lexical';
import { createContext, useEffect, useState } from 'react';

// todo: this atom is shared
export const activeEditorAtom = atom<LexicalEditor | null>(null);

// mark this deprecated
export const useActiveEditor = () => {
  const [editor] = useLexicalComposerContext();
  const setActiveEditor = useSetAtom(activeEditorAtom);

  useEffect(() => editor.registerCommand(
    SELECTION_CHANGE_COMMAND,
    (_payload, newEditor) => {
      setActiveEditor(newEditor);
      return false;
    },
    COMMAND_PRIORITY_CRITICAL
  ), [editor]);
};

const Context = createContext<LexicalEditor | null>(null);

export const ActiveEditorContext = ({ children }: { children: JSX.Element; }) => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);

  useEffect(() => editor.registerCommand(
    SELECTION_CHANGE_COMMAND,
    (_payload, newEditor) => {
      setActiveEditor(newEditor);
      return false;
    },
    COMMAND_PRIORITY_CRITICAL
  ), [editor]);

  return <Context.Provider value={activeEditor}>{children}</Context.Provider>;
};