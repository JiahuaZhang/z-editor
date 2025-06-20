import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Dropdown, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useFetcher, useNavigate, useParams } from 'react-router';
import { useCommentContext } from '../comment/CommentContext';
import { useHashTagContext } from '../hashtag/HashTagPlugin';
import { useTimeNodeContext } from '../time/TimePlugin';

type DocumentSyncStatus = 'loading' | 'new' | 'sync' | 'saved';

export const DocumentPersistence = () => {
  const fetcher = useFetcher();
  const [editor] = useLexicalComposerContext();
  const { comments } = useCommentContext();
  const hashTagMap = useHashTagContext();
  const timeNodeMap = useTimeNodeContext();
  const params = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<DocumentSyncStatus>('loading');

  useEffect(() => {
    if (params.id === undefined) {
      setStatus('new');
    } else {
      setStatus('saved');
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'saved') {
      editor.registerTextContentListener(_ => {
        setStatus('sync');
      });
    }
    return undefined;
  }, [editor, status]);

  useEffect(() => {
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      if (fetcher.data?.status === 204 && fetcher.data?.statusText === 'No Content') {
        navigate('/z-editor/search');
      }
      setStatus('loading');
    } else if (fetcher.state === 'idle') {
      if (fetcher.data?.status === 201 && fetcher.data?.statusText === 'Created') {
        setStatus('saved');
        navigate(`/z-editor/${fetcher.data.data[0].id}`);
      } else if (fetcher.data?.status === 200 && fetcher.data?.statusText === 'OK') {
        setStatus('saved');
      }
    }
  }, [fetcher.state, fetcher.data]);

  const upsertDocument = useCallback(async () => {
    const content = editor.getEditorState().toJSON();
    const tag = [...new Set(Object.values(hashTagMap))];
    const reminder = Object.values(timeNodeMap).filter(node => node.getReminders().length > 0);
    const document = {
      content,
      comment: comments,
      tag,
      reminder,
      id: params.id,
    };

    await fetcher.submit(document as any, {
      method: 'post',
      action: '/api/document/upsert',
      encType: 'application/json'
    });
  }, [editor, params.id, comments, hashTagMap, timeNodeMap]);

  const deleteDocument = useCallback(async () => {
    await fetcher.submit({ id: params.id! }, {
      method: 'post',
      action: '/api/document/delete'
    });
  }, [params.id]);

  if (status === 'loading') {
    return <span className="i-ph:spinner" un-text='xl blue-3' un-cursor='pointer' un-animate='spin' />;
  }

  if (status === 'new') {
    return <button onClick={upsertDocument}>
      {fetcher.data === undefined && <Tooltip title='Create New Document'>
        <span className="i-mdi:create" un-text='xl green-6' />
      </Tooltip>}
      {fetcher.data?.error && (
        <Tooltip title={`${fetcher.data?.error?.message}`}>
          <span className="i-material-symbols-light:error" un-text='xl red-6' />
        </Tooltip>
      )}
    </button>;
  }

  return <div un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='0.5'>
    <Dropdown.Button className='[&>button:last-child]:w-5 [&>button:first-child]:(px-3)'
      onClick={upsertDocument}
      trigger={['click']}
      icon={<div un-grid='~'><span className="i-ph:caret-down" un-text='xl gray-4' un-w='4' /></div>}
      menu={{
        items: [
          {
            key: 'delete',
            label: <button un-bg='white hover:red-4' un-text='hover:white' un-border='rounded' un-cursor='pointer'
              un-flex='~' un-items='center' un-gap='1' un-px='2' un-py='1'
              className='group'
            >
              <span className="i-bi:trash3" un-text='xl red-4 group-hover:white' />
              Delete
            </button>,
            onClick: deleteDocument,
          },
        ],
      }}
    >
      {status === 'sync' && (
        <Tooltip title='Sync Document'>
          <span className="i-material-symbols-light:sync" un-text='xl blue-4' />
        </Tooltip>
      )}
      {status === 'saved' && (
        <Tooltip title='Document Already Saved' >
          <span className="i-material-symbols-light:save" un-text='xl blue-4' un-cursor='pointer' />
        </Tooltip>
      )}
      {fetcher.data?.error && (
        <Tooltip title={`${fetcher.data?.error?.message}`}>
          <span className="i-material-symbols-light:error" un-text='xl red-6' />
        </Tooltip>
      )}
    </Dropdown.Button>
  </div>;
};
