import { $createHashtagNode, HashtagNode } from '@lexical/hashtag';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import type { TextNode } from 'lexical';
import { useCallback, useEffect } from 'react';

const HASHTAG_REGEX = /(?<prefix>^|\s)(?<sign>#)(?<tag>[^#\s]+)/i;

export const HashtagPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([HashtagNode])) {
      throw new Error('HashtagPlugin: HashtagNode not registered on editor');
    }
  }, [editor]);

  const $createHashtagNode_ = useCallback(
    (textNode: TextNode): HashtagNode => $createHashtagNode(textNode.getTextContent()), []
  );

  const getHashtagMatch = useCallback((text: string) => {
    const match = HASHTAG_REGEX.exec(text);
    if (match === null) return null;

    const start = match.index + match.groups!.prefix.length;
    const end = start + 1 + match.groups!.tag.length;
    return { start, end };
  }, []);

  useLexicalTextEntity<HashtagNode>(
    getHashtagMatch,
    HashtagNode,
    $createHashtagNode_,
  );

  return null;
};