import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { calculateZoomLevel } from '@lexical/utils';
import { $getNodeByKey, LexicalEditor, NodeKey } from 'lexical';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSharedHistoryContext } from '../../context/SharedHistoryContext';
import { $isStickyNode } from './StickNote';
import './StickyNote.css';

type Positioning = {
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
  rootElementRect: null | DOMRect;
  x: number;
  y: number;
};

const positionSticky = (stickyElem: HTMLElement, positioning: Positioning,) => {
  const style = stickyElem.style;
  const rootElementRect = positioning.rootElementRect;
  const rectLeft = rootElementRect !== null ? rootElementRect.left : 0;
  const rectTop = rootElementRect !== null ? rootElementRect.top : 0;
  style.top = `${rectTop + positioning.y}px`;
  style.left = `${rectLeft + positioning.x}px`;
};

export const StickyComponent = ({
  x, y, nodeKey, color, caption,
}: {
  caption: LexicalEditor;
  color: 'pink' | 'yellow';
  nodeKey: NodeKey;
  x: number;
  y: number;
}) => {
  const [editor] = useLexicalComposerContext();
  const stickyContainerRef = useRef<null | HTMLDivElement>(null);
  const positioningRef = useRef<Positioning>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
    rootElementRect: null,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const position = positioningRef.current;
    position.x = x;
    position.y = y;

    const stickyContainer = stickyContainerRef.current;
    if (stickyContainer !== null) {
      positionSticky(stickyContainer, position);
    }
  }, [x, y]);

  useLayoutEffect(() => {
    const position = positioningRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const { target } = entry;
        position.rootElementRect = target.getBoundingClientRect();
        const stickyContainer = stickyContainerRef.current;
        if (stickyContainer !== null) {
          positionSticky(stickyContainer, position);
        }
      }
    });

    const removeRootListener = editor.registerRootListener(
      (nextRootElem, prevRootElem) => {
        if (prevRootElem !== null) {
          resizeObserver.unobserve(prevRootElem);
        }
        if (nextRootElem !== null) {
          resizeObserver.observe(nextRootElem);
        }
      },
    );

    const handleWindowResize = () => {
      const rootElement = editor.getRootElement();
      const stickyContainer = stickyContainerRef.current;
      if (rootElement !== null && stickyContainer !== null) {
        position.rootElementRect = rootElement.getBoundingClientRect();
        positionSticky(stickyContainer, position);
      }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      removeRootListener();
    };
  }, [editor]);

  const handlePointerMove = (event: PointerEvent) => {
    const stickyContainer = stickyContainerRef.current;
    const positioning = positioningRef.current;
    const rootElementRect = positioning.rootElementRect;
    const zoom = calculateZoomLevel(stickyContainer);
    if (
      stickyContainer !== null
      && positioning.isDragging
      && rootElementRect !== null
    ) {
      positioning.x = event.pageX / zoom - positioning.offsetX - rootElementRect.left;
      positioning.y = event.pageY / zoom - positioning.offsetY - rootElementRect.top;
      positionSticky(stickyContainer, positioning);
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    const stickyContainer = stickyContainerRef.current;
    const positioning = positioningRef.current;
    if (stickyContainer !== null) {
      positioning.isDragging = false;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStickyNode(node)) {
          node.setPosition(positioning.x, positioning.y);
        }
      });
    }
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  };

  const handleDelete = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStickyNode(node)) {
        node.remove();
      }
    });
  };

  const handleColorChange = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStickyNode(node)) {
        node.toggleColor();
      }
    });
  };

  const { historyState } = useSharedHistoryContext();

  return (
    <div ref={stickyContainerRef}
      un-w='72'
      un-h='50'
      un-position='absolute'
    >
      <div un-h='full'
        un-bg={`${color === 'yellow' ? '[linear-gradient(135deg,#ff8_81%,#ff8_82%,#ff8_82%,#ffffc6)]' : '[linear-gradient(135deg,#f7cbe8_81%,#f7cbe8_82%,#f7cbe8_82%,#e7bfe1)]'} `}
        un-cursor='move'
        un-position='relative'
        un-border='rounded-br-[_75px_12px] 1px solid slate-1'
        un-p='2'
        className={`sticky-note after:([content:""] absolute z--1 right-0 bottom-18px w-[120px] h-[25px] bg-[#0003] shadow-[2px_15px_5px_#0006])`}
        onPointerDown={(event) => {
          const stickyContainer = stickyContainerRef.current;
          if (
            stickyContainer == null
            || event.button === 2
            || event.target !== stickyContainer.firstChild
          ) {
            // Right click or click on editor should not work
            return;
          }
          const stickContainer = stickyContainer;
          const positioning = positioningRef.current;
          if (stickContainer !== null) {
            const { top, left } = stickContainer.getBoundingClientRect();
            const zoom = calculateZoomLevel(stickContainer);
            positioning.offsetX = event.clientX / zoom - left;
            positioning.offsetY = event.clientY / zoom - top;
            positioning.isDragging = true;
            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);
            event.preventDefault();
          }
        }}>
        <header un-grid='~' un-justify='end' un-grid-flow='col' un-gap='1' un-items='center' un-pointer-events='none'>
          <button un-cursor='pointer'
            un-pointer-events='auto'
            un-bg='hover:white'
            onClick={handleColorChange}
            aria-label="Change sticky note color"
            title="Color"
          >
            <div className="i-mdi:paint" un-text={`${color === 'yellow' ? 'hover:pink-6' : 'hover:yellow-6'}`} ></div>
          </button>
          <button un-cursor='pointer'
            un-pointer-events='auto'
            onClick={handleDelete}
            aria-label="Delete sticky note"
            title="Delete">
            <div className="i-mdi:close" un-text='hover:red-6' ></div>
          </button>
        </header>
        <LexicalNestedComposer initialEditor={caption}>
          <HistoryPlugin externalHistoryState={historyState} />
          <PlainTextPlugin
            contentEditable={
              <ContentEditable
                un-position='relative'
                un-outline='focus-visible:none'
                un-cursor='text'
                un-px='1'
                aria-placeholder="What's up?"
                placeholder={<div un-position='absolute' un-top='32px' un-left='3' un-pointer-events='none' un-text='zinc-4' >
                  What's up?
                </div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalNestedComposer>
      </div >
    </div >
  );
};

export const UnoTrick = () => <div un-w='72' />;