import { $createHashtagNode, HashtagNode } from '@lexical/hashtag';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { atom, useSetAtom } from 'jotai';
import { $getNodeByKey, type TextNode } from 'lexical';
import { useCallback, useEffect, useRef } from 'react';

const HASHTAG_REGEX = /(?<prefix>^|\s)(?<sign>#)(?<tag>[^#\s]+)/i;

export const hashTagMapAtom = atom<Record<string, string>>({});

export const HashtagPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const setHashTagMap = useSetAtom(hashTagMapAtom);
  const hasInitalizedRef = useRef(false);

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

  useLexicalTextEntity<HashtagNode>(getHashtagMatch, HashtagNode, $createHashtagNode_,);

  useEffect(() => editor.registerMutationListener(HashtagNode, (mutations) => {
    editor.update(() => {
      for (const [key, mutation] of mutations) {
        const hashTagNode = $getNodeByKey(key) as HashtagNode;

        if (mutation === 'created') {
          setHashTagMap((prev) => ({ ...prev, [key]: hashTagNode.getTextContent() }));
        } else if (mutation === 'destroyed') {
          setHashTagMap((prev) => {
            const newMap = { ...prev };
            delete newMap[key];
            return newMap;
          });
        } else if (mutation === 'updated') {
          setHashTagMap((prev) => {
            const newMap = { ...prev };
            newMap[key] = hashTagNode.getTextContent();
            return newMap;
          });
        }
      }
    });
  }), [editor]);

  useEffect(() => editor.registerUpdateListener(({ editorState }) => {
    if (hasInitalizedRef.current) return;

    const hashTagNodes = Array.from(editorState._nodeMap.values())
      .filter((node) => node instanceof HashtagNode);

    const newMap: Record<string, string> = {};
    editor.read(() => hashTagNodes.forEach((node) => newMap[node.getKey()] = node.getTextContent()));
    setHashTagMap(newMap);
    hasInitalizedRef.current = true;
  }), [editor]);

  return null;
};