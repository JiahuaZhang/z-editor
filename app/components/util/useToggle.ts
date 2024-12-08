import { useCallback, useEffect, useRef, useState } from 'react';

export const useToggle = () => {
  const [toggle, setToggle] = useState(false);
  const containerRef = useRef(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!(containerRef.current! as HTMLElement).contains(event.target as Node)) {
      setToggle(false);
    }
  }, []);

  useEffect(() => {
    if (toggle) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  }, [toggle]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToggle(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);

    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  return { toggle, setToggle, containerRef };
};