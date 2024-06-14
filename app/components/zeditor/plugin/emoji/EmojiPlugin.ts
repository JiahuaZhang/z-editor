import { TextNode, LexicalEditor } from 'lexical';
import { findEmoji } from './findEmoji';
import { $createEmojiNode } from './EmojiNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

const $textNodeTransform = (node: TextNode) => {
  if (!node.isSimpleText() || node.hasFormat('code')) return;

  const text = node.getTextContent();
  const emojiMatch = findEmoji(text);
  if (emojiMatch == null) return;

  let targetNode;
  if (emojiMatch.position === 0) {
    [targetNode] = node.splitText(
      emojiMatch.position + emojiMatch.shortcode.length
    );
  } else {
    [, targetNode] = node.splitText(
      emojiMatch.position,
      emojiMatch.position + emojiMatch.shortcode.length
    );
  }

  const emojiNode = $createEmojiNode(emojiMatch.unifiedID);
  targetNode.replace(emojiNode);
};

export const registerEmoji = (editor: LexicalEditor) => editor.registerNodeTransform(TextNode, $textNodeTransform);

export const EmojiPlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => registerEmoji(editor), [editor]);

  return null;
};