import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createContext, useContext, useEffect, useState } from 'react';

const Context = createContext<HTMLElement | null>(null);

export const FloatingAnchorContext = ({ children }: { children: JSX.Element; }) => {
  const [editor] = useLexicalComposerContext();
  const [floatingAnchor, setFloatingAnchor] = useState<HTMLElement | null>(document.body);

  useEffect(() => setFloatingAnchor(editor.getRootElement()?.parentElement ?? document.body), [editor]);

  return <Context.Provider value={floatingAnchor}>{children}</Context.Provider>;
};

export const useFloatingAnchor = () => {
  const floatingAnchor = useContext(Context);

  if (floatingAnchor === null) {
    throw new Error('FloatingAnchorContext is not available');
  }

  return floatingAnchor;
};
