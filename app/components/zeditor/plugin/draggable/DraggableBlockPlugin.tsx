import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';
import { useEffect, useRef, useState } from 'react';

const DRAGGABLE_BLOCK_MENU_CLASSNAME = 'draggable-block-menu';

const isOnMenu = (element: HTMLElement) => !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);

export const DraggableBlockPlugin = ({ anchorElem = document.body }: { anchorElem?: HTMLElement; }) => {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<HTMLElement>(anchorElem);

  useEffect(() => {
    setAnchor(editor.getRootElement()?.parentElement ?? anchorElem);
  }, [editor]);

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchor}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={
        <div ref={menuRef} className={DRAGGABLE_BLOCK_MENU_CLASSNAME}
          un-border='rounded' un-z='5' un-cursor='grab active:grabbing' un-position='absolute'
          un-top='0' un-left='0' un-will-change='transform' un-bg='hover:zinc-2'
        >
          <div un-flex='~' un-justify='center' un-items='center' >
            <span className="i-carbon:draggable" un-text='xl' />
          </div>
        </div>
      }
      targetLineComponent={<div ref={targetLineRef} className="pointer-events-none bg-sky-5 h-1 absolute top-0" />}
      isOnMenu={isOnMenu}
    />
  );
};
