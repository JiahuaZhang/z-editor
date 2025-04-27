import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

type FloatContext = {
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<SetStateAction<boolean>>;
};

const Context = createContext<FloatContext>({ isLinkEditMode: false, setIsLinkEditMode: () => {} });

export const FloatContext = ({ children }: { children: JSX.Element; }) => {
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  return <Context.Provider value={{ isLinkEditMode, setIsLinkEditMode }}>{children}</Context.Provider>;
};

export const useFloatContext = () => useContext(Context);