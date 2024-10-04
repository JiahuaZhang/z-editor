import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { atom, useSetAtom } from 'jotai';
import { COMMAND_PRIORITY_CRITICAL, LexicalEditor, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useEffect } from 'react';

export const activeEditorAtom = atom<LexicalEditor | null>(null);

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
