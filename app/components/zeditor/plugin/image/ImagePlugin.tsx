import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, CAN_USE_DOM, mergeRegister } from '@lexical/utils';
import { $createParagraphNode, $insertNodes, $isRootOrShadowRoot, COMMAND_PRIORITY_LOW, LexicalCommand, createCommand } from 'lexical';
import { useEffect } from 'react';
import { $createImageNode, ImageNode, ImagePayload } from './ImageNode';

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null) => CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

const insertImage = (payload: InsertImagePayload) => {
  const imageNode = $createImageNode(payload);
  $insertNodes([imageNode]);
  if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
    $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
  }
  return true;
};

export const ImagePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(INSERT_IMAGE_COMMAND, insertImage, COMMAND_PRIORITY_LOW)
    );
  }, [editor]);

  return null;
};