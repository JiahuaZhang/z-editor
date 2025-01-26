import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { atom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export const floatingAnchorAtom = atom<HTMLElement | null>(null);

export const useFloatingAnchor = () => {
  const [editor] = useLexicalComposerContext();
  const setFloatingAnchor = useSetAtom(floatingAnchorAtom);

  useEffect(() => {
    setFloatingAnchor(editor.getRootElement()?.parentElement ?? document.body);
  }, [editor]);

  return null;
};