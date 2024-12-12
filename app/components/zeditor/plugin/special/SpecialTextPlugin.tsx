import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalEditor, TextNode } from 'lexical';
import { useEffect } from 'react';
import { $createSpecialTextNode, SpecialTextNode } from './SpecialTextNode';

const BRACKETED_TEXT_REGEX = /(\[[^\[\]]+\])/; // eslint-disable-line

const $findAndTransformText = (node: TextNode): null | TextNode => {
  const text = node.getTextContent();

  const match = BRACKETED_TEXT_REGEX.exec(text);
  if (match) {
    const matchedText = match[1];
    const startIndex = match.index;

    let targetNode;
    if (startIndex === 0) {
      [targetNode] = node.splitText(startIndex + match[0].length);
    } else {
      [, targetNode] = node.splitText(startIndex, startIndex + match[0].length);
    }

    const specialTextNode = $createSpecialTextNode(matchedText);
    targetNode.replace(specialTextNode);
    return specialTextNode;
  }

  return null;
};

const $textNodeTransform = (node: TextNode) => {
  let targetNode: TextNode | null = node;

  while (targetNode !== null) {
    if (!targetNode.isSimpleText()) {
      return;
    }

    targetNode = $findAndTransformText(targetNode);
  }
};

const useTextTransformation = (editor: LexicalEditor) => {
  useEffect(() => {
    if (!editor.hasNodes([SpecialTextNode])) {
      throw new Error(
        'SpecialTextPlugin: SpecialTextNode not registered on editor',
      );
    }

    return editor.registerNodeTransform(TextNode, $textNodeTransform);
  }, [editor]);
};

export const SpecialTextPlugin = () => {
  const [editor] = useLexicalComposerContext();
  useTextTransformation(editor);
  return null;
};
