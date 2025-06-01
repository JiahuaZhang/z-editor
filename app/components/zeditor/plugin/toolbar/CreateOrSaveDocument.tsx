import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Tooltip } from 'antd';
import { useCallback } from 'react';
import { useFetcher } from 'react-router';
import { useCommentContext } from '../comment/CommentContext';
import { useHashTagContext } from '../hashtag/HashTagPlugin';
import { useTimeNodeContext } from '../time/TimePlugin';

export const CreateOrSaveDocument = () => {
  const fetcher = useFetcher();
  const [editor] = useLexicalComposerContext();
  const { comments } = useCommentContext();
  const hashTagMap = useHashTagContext();
  const timeNodeMap = useTimeNodeContext();

  const upsertDocument = useCallback(async () => {
    const content = editor.getEditorState().toJSON();
    const tag = [...new Set(Object.values(hashTagMap))];
    const reminder = Object.values(timeNodeMap).filter(node => node.getReminders().length > 0);
    const document = {
      content,
      comment: comments,
      tag,
      reminder,
    };

    await fetcher.submit(document as any, {
      method: 'post',
      action: '/api/document/upsert',
      encType: 'application/json'
    });
  }, [editor]);

  if (fetcher.state === 'submitting') {
    return <span className="i-ph:spinner" un-text='xl blue-3' un-cursor='pointer' un-animate='spin' />;
  }

  if (fetcher.state === 'idle') {
    return <button onClick={upsertDocument} >
      {
        fetcher.data === undefined && <Tooltip title='Create New Document' >
          <span className="i-mdi:create" un-text='xl green-6' />
        </Tooltip>
      }

      {
        fetcher.data?.error && <Tooltip title={`${fetcher.data?.error?.message}`} >
          <span className="i-material-symbols-light:error" un-text='xl red-6' />
        </Tooltip>
      }
    </button>;
  }

  // return <button>
  //   <Tooltip title='Save Document' >
  //     <span className="i-material-symbols-light:save" un-text='xl blue-4' />
  //   </Tooltip>
  // </button>;

  // return <Tooltip title='Document Already Sync' >
  //   <span className="i-material-symbols-light:sync" un-text='xl green-6' un-cursor='pointer' />
  // </Tooltip>;
};
