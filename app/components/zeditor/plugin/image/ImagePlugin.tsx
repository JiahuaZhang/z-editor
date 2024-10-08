import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, CAN_USE_DOM, mergeRegister } from '@lexical/utils';
import { $createParagraphNode, $getSelection, $insertNodes, $isNodeSelection, $isRootOrShadowRoot, COMMAND_PRIORITY_LOW, DRAGSTART_COMMAND, LexicalCommand, createCommand } from 'lexical';
import { useEffect } from 'react';
import { $createImageNode, $isImageNode, ImageNode, ImagePayload } from './ImageNode';

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null) => CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

const $insertImage = (payload: InsertImagePayload) => {
  const imageNode = $createImageNode(payload);
  $insertNodes([imageNode]);
  if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
    $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
  }
  return true;
};

const $getImageNodeInSelection = () => {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
};

const $onDragStart = (event: DragEvent) => {
  const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const img = document.createElement('img');
  img.src = TRANSPARENT_IMAGE;

  const { dataTransfer } = event;
  if (!dataTransfer) return false;

  const node = $getImageNodeInSelection();
  if (!node) return false;

  dataTransfer.setData('text/plain', '_');
  dataTransfer.setDragImage(img, 0, 0);
  const data = {
    altText: node.__altText,
    caption: node.__caption,
    height: node.__height,
    key: node.getKey(),
    maxWidth: node.__maxWidth,
    showCaption: node.__showCaption,
    src: node.__src,
    width: node.__width,
  };
  dataTransfer.setData('application/x-lexical-drag', JSON.stringify({ data, type: 'image' }));
  return true;
};

export const ImagePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(INSERT_IMAGE_COMMAND, $insertImage, COMMAND_PRIORITY_LOW),
      editor.registerCommand<DragEvent>(DRAGSTART_COMMAND, $onDragStart, COMMAND_PRIORITY_LOW),
    );
  }, [editor]);

  return null;
};