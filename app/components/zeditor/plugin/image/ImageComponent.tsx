import { HashtagNode } from '@lexical/hashtag';
import { LinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $isRootTextContentEmptyCurry } from '@lexical/text';
import { mergeRegister } from '@lexical/utils';
import { $getNodeByKey, $getSelection, $isNodeSelection, $isRangeSelection, $setSelection, BLUR_COMMAND, BaseSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, DRAGSTART_COMMAND, KEY_DELETE_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, LexicalCommand, LexicalEditor, LineBreakNode, NodeKey, ParagraphNode, RootNode, SELECTION_CHANGE_COMMAND, TextNode, createCommand } from 'lexical';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSharedHistoryContext } from '../../context/SharedHistoryContext';
import { ImageResizer } from '../../ui/ImageResizer';
import { validateUrl } from '../../util/url';
import { EmojiNode } from '../emoji/EmojiNode';
import { EmojiPlugin } from '../emoji/EmojiPlugin';
import { $isImageNode } from './ImageNode';

const imageCache = new Set();

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> = createCommand('RIGHT_CLICK_IMAGE_COMMAND');

const useSuspenseImage = (src: string) => {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
      img.onerror = () => {
        imageCache.add(src);
      };
    });
  }
};

const LazyImage = ({ altText, className, imageRef, src, width, height, maxWidth, onError, ...rest }: {
  altText: string;
  className?: string;
  height: 'inherit' | number;
  imageRef: { current: null | HTMLImageElement; };
  maxWidth: number;
  src: string;
  width: 'inherit' | number; onError: () => void;
}) => {
  useSuspenseImage(src);
  return <img
    className={className || undefined}
    src={src}
    alt={altText}
    ref={imageRef}
    style={{ height, maxWidth, width }}
    onError={onError}
    draggable={false}
    {...rest}
  />;
};

const ImageCaptionPlugin = ({ closeCaption }: { closeCaption: () => void; }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => editor.getRootElement()?.focus({ preventScroll: true }), [editor]);

  useEffect(() => {
    editor.registerCommand(BLUR_COMMAND, (payload) => {
      const isEmpty = editor.getEditorState().read($isRootTextContentEmptyCurry(editor.isComposing(), true));
      if (isEmpty) closeCaption();
      return false;
    },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
};

export const ImageComponent = ({ src, altText, nodeKey, width, height, maxWidth, showCaption, caption, captionsEnabled }: {
  altText: string;
  caption: LexicalEditor;
  height: 'inherit' | number;
  maxWidth: number;
  nodeKey: NodeKey;
  showCaption: boolean;
  src: string;
  width: 'inherit' | number;
  captionsEnabled: boolean;
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const [isLoadError, setIsLoadError] = useState(false);

  const $onDelete = useCallback(
    (event: KeyboardEvent) => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        event.preventDefault();
        editor.update(() => {
          deleteSelection.getNodes().forEach((node) => {
            if ($isImageNode(node)) {
              node.remove();
            }
          });
        });
      }
      return false;
    },
    [isSelected, nodeKey]
  );

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElm = buttonRef.current;
      if (
        isSelected
        && $isNodeSelection(latestSelection)
        && latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          $setSelection(null);
          event.preventDefault();
          caption.focus();
          return true;
        } else if (buttonElm !== null && buttonElm !== document.activeElement) {
          event.preventDefault();
          buttonElm.focus();
          return true;
        }
      }
      return false;
    },
    [caption, isSelected, showCaption]
  );

  const $onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (activeEditorRef.current === caption || buttonRef.current === event?.target) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [caption, editor, setSelected]
  );

  const onClick = useCallback(
    (event: MouseEvent) => {
      if (isResizing) {
        return true;
      }

      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }

      return false;
    },
    [isResizing, isSelected, setSelected, clearSelection]
  );

  const onRightClick = useCallback(
    (event: MouseEvent) => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target as HTMLElement;
        if (
          domElement.tagName === 'IMG'
          && $isRangeSelection(latestSelection)
          && latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event as MouseEvent);
        }
      });
    },
    [editor]
  );

  useEffect(() => {
    let isMounted = true;
    const rootElement = editor.getRootElement();
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW)
    );

    rootElement?.addEventListener('contextmenu', onRightClick);

    return () => {
      isMounted = false;
      unregister();
      rootElement?.removeEventListener('contextmenu', onRightClick);
    };
  }, [clearSelection, editor, isResizing, nodeKey, $onDelete, $onEnter, $onEscape, onClick, onRightClick, setSelected]);

  const setShowCaption = (show = true) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setShowCaption(show);
      }
    });
  };

  const onResizeEnd = (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
    setTimeout(() => { setIsResizing(false); }, 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => setIsResizing(true);

  const { historyState } = useSharedHistoryContext();
  const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
  const isFocused = isSelected || isResizing;

  return <Suspense>
    <div un-mx='1' >
      <div draggable={draggable}>
        {isLoadError ? <span className="i-material-symbols-light:broken-image" un-w='32' un-h='32' /> : <LazyImage
          un-border={`${isFocused ? '2 solid blue-4' : '0'}`}
          un-cursor={`${(isFocused && $isNodeSelection(selection)) ? 'grab' : ''}`}
          src={src}
          altText={altText}
          imageRef={imageRef}
          width={width}
          height={height}
          maxWidth={maxWidth}
          onError={() => setIsLoadError(true)}
        />}
      </div>

      {showCaption && <div un-position='absolute' un-left='0' un-right='0' >
        <LexicalNestedComposer
          initialEditor={caption}
          initialNodes={[RootNode, TextNode, LineBreakNode, ParagraphNode, LinkNode, EmojiNode, HashtagNode]}
        >
          <LinkPlugin validateUrl={validateUrl} />
          <EmojiPlugin />
          <HashtagPlugin />
          <HistoryPlugin externalHistoryState={historyState} />
          <RichTextPlugin
            contentEditable={<ContentEditable un-border='rounded-b top-0 solid x-2 b-2 blue-1 focus-within:blue-6' un-p='1' un-outline='none' un-text='sm' un-bg='white' />}
            placeholder={
              <div un-position='absolute' un-top='[5px]' un-pointer-events='none' un-left='[7px]' un-text='gray-5 sm'>
                Enter a caption...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ImageCaptionPlugin closeCaption={() => setShowCaption(false)} />
        </LexicalNestedComposer>
      </div>}

      {$isNodeSelection(selection) && isFocused && (
        <ImageResizer
          showCaption={showCaption}
          setShowCaption={setShowCaption}
          editor={editor}
          buttonRef={buttonRef}
          imageRef={imageRef}
          maxWidth={maxWidth}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
          captionsEnabled={!isLoadError && captionsEnabled}
        />
      )}
    </div>
  </Suspense>;
};

const UnoTrick = <div un-top='[5px]' un-left='[7px]' un-text='gray-5' un-pointer-events='none' />;