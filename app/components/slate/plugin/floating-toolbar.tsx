import { createPortal } from 'react-dom';
import { ClientOnly } from "remix-utils/client-only";

export const FloatingToolbar = () => {
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

  return <ClientOnly>
    {() => createPortal(content, document.body)}
  </ClientOnly>;
};
