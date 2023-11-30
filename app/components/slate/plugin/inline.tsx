import { Popover } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Node, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react';

// inline element: link/url, tag
export const LINK_TYPE = 'link';
export const TAG_TYPE = 'tag';

export const Link = ({ children, attributes, element }: RenderElementProps) => {
  const { url, children: [{ text }] } = element as any;
  const [newUrl, setNewUrl] = useState(url);
  const [newText, setNewText] = useState(text);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const editor = useSlateStatic();

  useEffect(() => {
    setNewUrl(url);
    setNewText(text);
  }, [url, text]);

  const updateLink = (url: string, text: string) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { url } as Partial<Node>, { at: path });
    Transforms.insertText(editor, text, { at: path });
  };

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => ref?.current?.focus());
    }
  }, [isOpen]);

  const handleEsc = (event: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const content = <div un-text='lg'>
    <div
      un-grid='~'
      un-grid-flow='col'
      un-justify-between='~'
    >
      <a href={url} target='_blank' >
        <i className='i-tabler:external-link' un-cursor='pointer' />
      </a>
      <i className='i-mdi:link-variant-off'
        un-cursor='pointer'
        un-hover='text-red-6'
        un-focus='text-red-6'
        tabIndex={0}
        onClick={() => {
          Transforms.unwrapNodes(editor, { at: ReactEditor.findPath(editor, element) });
        }}
        onKeyDown={event => {
          if (['Enter', ' '].includes(event.key)) {
            Transforms.unwrapNodes(editor, { at: ReactEditor.findPath(editor, element) });
            // todo: put focus back to end of current element
            // similar for click event?
          }
        }}
      />
    </div>

    <label
      un-grid='~'
      un-items='center'
      un-grid-flow='col'
      un-gap='1'
    >
      <i className='i-mdi:link-variant' un-cursor='pointer' un-hover='text-blue-4' />
      <input
        ref={ref}
        un-outline='none'
        un-border='2px solid focus:blue-5 rounded'
        un-shadow='focus:[0_0_5px_#007bff]'
        un-px='1'
        value={newUrl}
        onChange={evengt => setNewUrl(evengt.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            updateLink(newUrl, newText);
          }
        }}
      />
    </label>

    <hr un-my='2' />

    <label
      un-grid='~'
      un-items='center'
      un-grid-flow='col'
      un-gap='1'
      un-mb='2'
    >
      <i className='i-radix-icons:text-align-left' un-cursor='pointer' un-hover='text-blue-4' />
      <input
        spellCheck={false}
        un-outline='none'
        un-border='2px solid focus:blue-5 rounded'
        un-shadow='focus:[0_0_5px_#007bff]'
        un-px='1'
        value={newText}
        onChange={evengt => setNewText(evengt.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            updateLink(newUrl, newText);
          }
        }}
      />
    </label>

    <div
      un-grid='~'
      un-justify='end'
    >
      {url === newUrl && text === newText &&
        <i className='i-carbon:close-outline'
          tabIndex={0}
          un-cursor='pointer'
          un-hover='text-orange-4'
          un-text='hover:blue-4 focus:blue-4'
          onKeyDown={event => {
            if (['Enter', ' '].includes(event.key)) {
              event.preventDefault();
              setIsOpen(false);
              // todo: put focus back to end of current element
              // similar for click event?
            }
          }}
          onClick={() => setIsOpen(false)}
        />}
      {(url !== newUrl || text !== newText) &&
        <div>
          <i
            className='i-material-symbols-light:undo-rounded'
            tabIndex={0}
            un-cursor='pointer'
            un-text='hover:blue-4 focus:blue-4'
            onClick={() => {
              setNewUrl(url);
              setNewText(text);
              ref.current?.focus();
            }}
            onKeyDown={event => {
              if (['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                setNewUrl(url);
                setNewText(text);
                ref.current?.focus();
              }
            }}
          />
          <i className='i-ph:check'
            tabIndex={0}
            un-cursor='pointer'
            un-text='hover:blue-4 focus:blue-4'
            un-ml='2'
            onClick={() => updateLink(newUrl, newText)}
            onKeyDown={event => {
              if (['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                updateLink(newUrl, newText);
              }
            }}
          />
        </div>}
    </div>
  </div>;

  return <Popover content={content}
    trigger='click'
    open={isOpen}
    onOpenChange={setIsOpen}
  >
    <a
      un-text='blue-600 hover:blue-800 visited:purple-600'
      un-cursor='pointer'
      {...attributes}
    >{children}</a>
  </Popover>;
};

export const Tag = ({ children, attributes }: RenderElementProps) => {
  return <span {...attributes}>{children}</span>;
};

// todo:? hash-tag like #id element?
// e.g., ${id, 0} <-> [meta - id], they all refers to the same id, and could have various text
// type Identity = {
//   id: number; // auto generated, but unique
//   text: string[];
//   description?: string;
//   decoration?: { [key: string]: string; };
// };

export const dummyData = [
  {
    type: 'paragraph',
    children: [
      {
        type: LINK_TYPE,
        url: 'https://github.com',
        children: [{ text: 'github' }],
      },
      { text: ' ' },
      {
        type: TAG_TYPE,
        children: [{ text: 'react' }],
      },]
  }
];