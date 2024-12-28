import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical';
import { useEffect } from 'react';
import { $createTweetNode, TweetNode } from './TweetNode';

export const INSERT_TWEET_COMMAND: LexicalCommand<string> = createCommand('INSERT_TWEET_COMMAND');

export const TwitterPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TweetNode])) throw new Error('TwitterPlugin: TweetNode not registered on editor');

    return editor.registerCommand<string>(
      INSERT_TWEET_COMMAND,
      (payload) => {
        const tweetNode = $createTweetNode(payload);
        $insertNodeToNearestRoot(tweetNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
};
