import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const FloatingToolbar = () => {
  const [isClient, setIsClient] = useState(false);
  const content = <div
    className=''
    un-position='absolute'
    un-top='0'
    un-bg='gray-7'
    un-border='rounded'
    un-font='1.5em'
    un-text='2xl'
    un-size='1.5em'
    un-flex='~'
    un-p='1'
  >
    <div className='i-radix-icons:font-bold'
      un-color='white'
    />
    <div className='i-radix-icons:font-italic'
      un-color='white' />
    <div className='i-tabler:underline'
      un-color='white' />
  </div>;

  useEffect(() => setIsClient(true), []);

  return isClient && createPortal(content, document.body);
};
