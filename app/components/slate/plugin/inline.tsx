import { Popover, Tag } from 'antd';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClientOnly } from 'remix-utils/client-only';
import Slate, { Editor, Path, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react';

// inline element: link/url, tag
export const LINK_TYPE = 'link';
export const HASH_TAG_TYPE = 'hash-tag';

export const isNewLinkShortcut = (event: KeyboardEvent) => {
  if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
    return true;
  }
};

export const isFocusOnLink = (editor: Editor) => {
  const { selection } = editor;
  if (!selection || Range.isCollapsed(selection)) {
    const ancestor = editor.above();
    if (ancestor && (ancestor[0] as any).type === LINK_TYPE) {
      return true;
    }
  }
  return false;
};

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
    Transforms.setNodes(editor, { url } as Partial<Slate.Node>, { at: path });

    const linkEntry = Editor.above(editor, { match: n => (n as any).type === LINK_TYPE });
    if (linkEntry) {
      const [_, path] = linkEntry;
      const textNodePath = path.concat(0);
      const textNodeRange = Editor.range(editor, textNodePath);
      Transforms.select(editor, textNodeRange);
      Transforms.insertText(editor, text);
    }

    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      const { scrollX, scrollY } = window;
      Promise.resolve().then(() => {
        ref?.current?.focus();
        window.scrollTo(scrollX, scrollY);
      });
    } else {
      ReactEditor.focus(editor);
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

  useEffect(() => () => ReactEditor.focus(editor), []);

  useEffect(() => {
    const handleShortCut = (event: KeyboardEvent) => {
      const { selection } = editor;
      if (!selection || Range.isExpanded(selection)) {
        return;
      }

      if (isNewLinkShortcut(event)) {
        event.preventDefault();
        const ancestor = editor.above();
        const path = ReactEditor.findPath(editor, element);
        if (ancestor![1].join('') === path.join('')) {
          setIsOpen(prev => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleShortCut);
    return () => document.removeEventListener('keydown', handleShortCut);
  }, []);

  const content = <div un-text='lg'>
    <div
      un-grid='~'
      un-grid-flow='col'
      un-justify-between='~'
    >
      <a href={url} target='_blank'  >
        <i className='i-tabler:external-link'
          un-cursor='pointer'
          un-focus='text-blue-4'
          tabIndex={0}
          onKeyDown={event => {
            if (['Enter', ' '].includes(event.key)) {
              window.open(url, '_blank');
            }
          }}
        />
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
            event.preventDefault();
            Transforms.unwrapNodes(editor, { at: ReactEditor.findPath(editor, element) });
          }
        }}
      />
    </div>

    <label
      un-grid='~'
      un-items='center'
      un-grid-flow='col'
      un-gap='1'
      un-focus-within='[&>i]:text-blue-4'
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
            event.preventDefault();
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
      un-focus-within='[&>i]:text-blue-4'
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
            event.preventDefault();
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

export const isFloatingLinkOpenAtom = atom(false);
const LinkPanel = () => {
  const [isFloatingLinkOpen, setIsFloatingLinkOpen] = useAtom(isFloatingLinkOpenAtom);
  const ref = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const editor = useSlateStatic();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (!isFloatingLinkOpen) return;

    const { selection } = editor;
    if (selection && Range.isExpanded(selection)) {
      const selectedText = Editor.string(editor, selection);
      setUrl(selectedText);
      setText(selectedText);
    }

    ref.current?.focus();
  }, [isFloatingLinkOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (isFloatingLinkOpen && event.key === 'Escape') {
        setIsFloatingLinkOpen(false);
        ReactEditor.focus(editor);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFloatingLinkOpen && !container.current?.contains(event.target as Node)) {
        setIsFloatingLinkOpen(false);
        ReactEditor.focus(editor);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const submit = () => {
    if (!url || !text) return;

    setIsFloatingLinkOpen(false);
    ReactEditor.focus(editor);

    if (editor.selection && Range.isExpanded(editor.selection)) {
      Transforms.unwrapNodes(editor, {
        match: n => Editor.isInline(editor, n as any),
        split: true
      });
      Transforms.delete(editor);
    }

    const link = {
      type: LINK_TYPE,
      url,
      children: [{ text }],
    };

    const [entry] = Editor.nodes(editor, { match: n => Editor.isVoid(editor, n as any) });
    if (entry) {
      const [, path] = entry;
      const paragraph = {
        type: 'paragraph',
        children: [link],
      };
      Transforms.insertNodes(editor, paragraph as any, { at: Path.next(path) });
    } else {
      Transforms.insertNodes(editor, link);
    }

  };

  return <div ref={container}
    un-position='fixed'
    un-top='1/2'
    un-left='1/2'
    un-transform='~'
    un-translate='x--1/2 y--1/2'
    un-bg='white'
    un-border='rounded 2 blue-4'
    un-px='8'
    un-py='6'
  >
    <form un-space='y-2'>
      <label
        un-grid='~'
        un-items='center'
        un-grid-flow='col'
        un-gap='1'
        un-focus-within='[&>i]:text-blue-4'
      >
        <i className='i-mdi:link-variant'
          un-cursor='pointer'
          un-hover='text-blue-4'
          un-focus-within='text-blue-4'
        />
        <input ref={ref}
          type="text"
          placeholder="url"
          un-outline='none'
          un-border='2px solid focus:blue-5 rounded'
          un-shadow='focus:[0_0_5px_#007bff]'
          un-px='2'
          un-py='1'
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
        />
      </label>
      <label
        un-grid='~'
        un-items='center'
        un-grid-flow='col'
        un-gap='1'
        un-focus-within='[&>i]:text-blue-4'
      >
        <i className='i-radix-icons:text-align-left' un-cursor='pointer' un-hover='text-blue-4' />
        <input type="text" placeholder="text"
          un-outline='none'
          un-border='2px solid focus:blue-5 rounded'
          un-shadow='focus:[0_0_5px_#007bff]'
          un-px='2'
          un-py='1'
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
        />
      </label>
      <div un-grid='~ justify-between'
        un-auto-flow='col'
      >
        <button type='button'
          un-focus-visible='outline-none [&>i]:text-red-4'
          onClick={() => {
            setIsFloatingLinkOpen(false);
            ReactEditor.focus(editor);
          }}
          onKeyDown={event => {
            if (['Enter', 'Space'].includes(event.key)) {
              event.preventDefault();
              setIsFloatingLinkOpen(false);
              ReactEditor.focus(editor);
            }
          }}
        >
          <i className='i-carbon:close-outline'
            un-cursor='pointer'
            un-hover='text-orange-4'
            un-text='hover:red-4 focus:red-4 3xl' />
        </button>
        <button type='button'
          un-focus-visible='outline-none [&>i]:text-green-4'
          onClick={submit}
          onKeyDown={event => {
            if (['Enter', 'Space'].includes(event.key)) {
              event.preventDefault();
              submit();
            }
          }}
        >
          {url !== '' && text !== ''
            && <i className='i-material-symbols-light:check'
              un-cursor='pointer'
              un-hover='text-orange-4'
              un-text='hover:green-4 focus:green-4 3xl'
            />}
        </button>
      </div>
    </form>
  </div>;
};

export const LinkPlugin = () => {
  const isFloatingLinkOpen = useAtomValue(isFloatingLinkOpenAtom);
  return <ClientOnly>
    {() => createPortal(isFloatingLinkOpen && <LinkPanel />, document.body)}
  </ClientOnly>;
};

export const HashTag = ({ children, attributes }: RenderElementProps) => {
  return <Tag
    un-text='lg'
    un-px='1'
    {...attributes}>{children}</Tag>;
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
        type: HASH_TAG_TYPE,
        children: [{ text: 'react' }],
      },
      { text: ' ' },
      {
        type: LINK_TYPE,
        url: 'https://apple.com',
        children: [{ text: 'apple' }],
      },
    ]
  }
];