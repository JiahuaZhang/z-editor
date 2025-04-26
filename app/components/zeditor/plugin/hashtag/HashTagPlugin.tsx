import { $createHashtagNode, HashtagNode } from '@lexical/hashtag';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { $getNodeByKey, type TextNode } from 'lexical';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const HASHTAG_REGEX = /(?<prefix>^|\s)(?<sign>#)(?<tag>[^#\s]+)/i;

const Context = createContext<Record<string, string>>({});

export const HashTagContext = ({ children }: { children: JSX.Element; }) => {
  const [editor] = useLexicalComposerContext();
  const [hashTagMap, setHashTagMap] = useState<Record<string, string>>({});
  const hasInitalizedRef = useRef(false);

  useEffect(() => editor.registerMutationListener(HashtagNode, (mutations) => {
    editor.update(() => {
      for (const [key, mutation] of mutations) {
        const hashTagNode = $getNodeByKey(key) as HashtagNode;

        if (mutation === 'created') {
          const content = hashTagNode.getTextContent();
          setHashTagMap((prev) => ({ ...prev, [key]: content }));
        } else if (mutation === 'destroyed') {
          setHashTagMap((prev) => {
            const newMap = { ...prev };
            delete newMap[key];
            return newMap;
          });
        } else if (mutation === 'updated') {
          const content = hashTagNode.getTextContent();
          setHashTagMap((prev) => {
            const newMap = { ...prev };
            newMap[key] = content;
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

  return <Context.Provider value={hashTagMap}>{children}</Context.Provider>;
};

export const useHashTagContext = () => useContext(Context);

export const HashtagPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([HashtagNode])) {
      throw new Error('HashtagPlugin: HashtagNode not registered on editor');
    }
  }, [editor]);

  const $createHashtagNode_ = useCallback((textNode: TextNode): HashtagNode => $createHashtagNode(textNode.getTextContent()), []);

  const getHashtagMatch = useCallback((text: string) => {
    const match = HASHTAG_REGEX.exec(text);
    if (match === null) return null;

    const start = match.index + match.groups!.prefix.length;
    const end = start + 1 + match.groups!.tag.length;
    return { start, end };
  }, []);

  useLexicalTextEntity<HashtagNode>(getHashtagMatch, HashtagNode, $createHashtagNode_,);

  return null;
};