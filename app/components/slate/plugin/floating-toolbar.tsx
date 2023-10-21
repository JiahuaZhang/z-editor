import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BsTypeBold } from 'react-icons/bs/index.js';

export const FloatingToolbar = () => {
  const [isClient, setIsClient] = useState(false);
  const content = <BsTypeBold />;

  useEffect(() => setIsClient(true), []);

  return isClient && createPortal(content, document.body);
};
