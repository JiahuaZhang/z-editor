import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, CAN_USE_DOM, mergeRegister } from '@lexical/utils';
import { $createParagraphNode, $createRangeSelection, $getSelection, $insertNodes, $isNodeSelection, $isRootOrShadowRoot, $setSelection, COMMAND_PRIORITY_LOW, createCommand, DRAGOVER_COMMAND, DRAGSTART_COMMAND, DROP_COMMAND, LexicalCommand, LexicalEditor } from 'lexical';
import { useEffect } from 'react';
import { $createInlineImageNode, $isInlineImageNode, InlineImageNode, InlineImagePayload } from './InlineImageNode';

export const INSERT_INLINE_IMAGE_COMMAND: LexicalCommand<InlineImagePayload> = createCommand('INSERT_INLINE_IMAGE_COMMAND');

const getDOMSelection = (targetWindow: Window | null) => CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

const $getImageNodeInSelection = () => {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isInlineImageNode(node) ? node : null;
};

const $onDragStart = (event: DragEvent) => {
  const node = $getImageNodeInSelection();
  if (!node) return false;

  const { dataTransfer } = event;
  if (!dataTransfer) return false;

  const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const img = document.createElement('img');
  img.src = TRANSPARENT_IMAGE;
  dataTransfer.setData('text/plain', '_');
  dataTransfer.setDragImage(img, 0, 0);
  const data = {
    altText: node.__altText,
    height: node.__height,
    key: node.getKey(),
    showCaption: node.__showCaption,
    src: node.__src,
    width: node.__width,
  };
  dataTransfer.setData('application/x-lexical-drag', JSON.stringify({ data, type: 'image' }));
  return true;
};

const canDropImage = (event: DragEvent) => {
  const { target } = event;
  return (
    target
    && target instanceof HTMLElement
    && (!(target as HTMLElement).closest('code')?.getAttribute('data-language'))
    && !(target instanceof HTMLImageElement)
  );
};

const $onDragover = (event: DragEvent) => {
  const node = $getImageNodeInSelection();
  if (!node) return false;
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
};

const getDragImageData = (event: DragEvent) => {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
  if (!dragData) return null;

  const { data, type } = JSON.parse(dragData);
  if (type !== 'image' || !data) return null;

  return data;
};

const getDragSelection = (event: DragEvent) => {
  const target = event.target as null | Element | Document;
  const targetWindow = target == null ? null : target.nodeType === 9 ? (target as Document).defaultView : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    return domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }
};

const $onDrop = (event: DragEvent, editor: LexicalEditor) => {
  const node = $getImageNodeInSelection();
  if (!node) return false;

  const data = getDragImageData(event);
  if (!data) return false;

  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, data);
  }
  return true;
};

export const InlineImagePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([InlineImageNode])) {
      throw new Error('InlineImagePlugin: InlineImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InlineImagePayload>(INSERT_INLINE_IMAGE_COMMAND, (payload) => {
        const imageNode = $createInlineImageNode(payload);
        $insertNodes([imageNode]);
        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
        }
        return true;
      }, COMMAND_PRIORITY_LOW),
      editor.registerCommand<DragEvent>(DRAGSTART_COMMAND, $onDragStart, COMMAND_PRIORITY_LOW),
      editor.registerCommand<DragEvent>(DRAGOVER_COMMAND, $onDragover, COMMAND_PRIORITY_LOW),
      editor.registerCommand<DragEvent>(DROP_COMMAND, event => $onDrop(event, editor), COMMAND_PRIORITY_LOW),
    );
  }, [editor]);

  return null;
};