import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_CRITICAL, LexicalEditor, SELECTION_CHANGE_COMMAND } from 'lexical';
import { createContext, useContext, useEffect, useState } from 'react';

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

export const useActiveEditorContext = () => {
  const activeEditor = useContext(Context);

  if (!activeEditor) {
    throw new Error('Current Active Editor is null');
  }

  return activeEditor;
};