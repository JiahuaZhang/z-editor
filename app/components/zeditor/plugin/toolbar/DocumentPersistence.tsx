import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Dropdown, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { LexicalEditor } from 'lexical';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FetcherWithComponents, useFetcher, useNavigate, useParams } from 'react-router';
import { Comments, useCommentContext } from '../comment/CommentContext';
import { useHashTagContext } from '../hashtag/HashTagPlugin';
import { TimeNode } from '../time/TimeNode';
import { useTimeNodeContext } from '../time/TimePlugin';

type DocumentSyncStatus = 'loading' | 'new' | 'saved';

const autoSaveInterval = (Number(import.meta.env.VITE_AUTO_SAVE_INTERVAL) || 30) * 1000;

const NewDocumentPersistence = ({ upsertDocument, fetcher }: { upsertDocument: () => void, fetcher: FetcherWithComponents<any>; }) => {
  return <button onClick={upsertDocument}>
    <Tooltip title='Create New Document'>
      <span className="i-mdi:create" un-text='xl green-600' />
    </Tooltip>
    {fetcher.data?.error && (
      <Tooltip title={`${fetcher.data?.error?.message}`}>
        <span className="i-material-symbols-light:error" un-text='xl red-600' />
      </Tooltip>
    )}
  </button>;
};

const isTimeNodeMapChanged = (prev: Record<string, TimeNode>, current: Record<string, TimeNode>) => {
  if (Object.keys(prev).length !== Object.keys(current).length) {
    return true;
  }

  const p = Object.values(prev)
    .sort((a, b) => dayjs(a.getDate()).diff(dayjs(b.getDate()), 'day') || dayjs(a.getTime()).diff(dayjs(b.getTime()), 'second'))
    .map(n => ({ __date: n.getDate(), __time: n.getTime(), __format: n.getFormat(), __reminders: n.getReminders() }));
  const c = Object.values(current)
    .sort((a, b) => dayjs(a.getDate()).diff(dayjs(b.getDate()), 'day') || dayjs(a.getTime()).diff(dayjs(b.getTime()), 'second'))
    .map(n => ({ __date: n.getDate(), __time: n.getTime(), __format: n.getFormat(), __reminders: n.getReminders() }));

  return !_.isEqual(p, c);
};

const SavedDocumentPersistence = ({ upsertDocument, deleteDocument, fetcher, editor, comments, hashTagMap, timeNodeMap }: { upsertDocument: () => Promise<void>, deleteDocument: () => void, fetcher: FetcherWithComponents<any>, editor: LexicalEditor, comments: Comments, hashTagMap: Record<string, string>, timeNodeMap: Record<string, TimeNode>; }) => {
  const [isChanged, setIsChanged] = useState(false);
  const prevComments = useRef(comments);
  const prevHashTagMap = useRef(hashTagMap);
  const prevTimeNodeMap = useRef(timeNodeMap);
  const prevEditorState = useRef(editor.getEditorState());
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const update = useCallback(async () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    await upsertDocument();
    prevComments.current = comments;
    prevHashTagMap.current = hashTagMap;
    prevTimeNodeMap.current = timeNodeMap;
    prevEditorState.current = editor.getEditorState();
  }, [comments, hashTagMap, timeNodeMap, editor]);

  useEffect(() => {
    if (prevComments.current && !_.isEqual(prevComments.current, comments)) {
      setIsChanged(true);
      prevComments.current = comments;
    }
  }, [comments]);

  useEffect(() => {
    if (prevHashTagMap.current && !_.isEqual(Object.values(prevHashTagMap.current).sort(), Object.values(hashTagMap).sort())) {
      setIsChanged(true);
      prevHashTagMap.current = hashTagMap;
    }
  }, [hashTagMap]);

  useEffect(() => {
    if (prevTimeNodeMap.current && isTimeNodeMapChanged(prevTimeNodeMap.current, timeNodeMap)) {
      setIsChanged(true);
      prevTimeNodeMap.current = timeNodeMap;
    }
  }, [timeNodeMap]);

  useEffect(() => {
    return editor.registerUpdateListener(async listener => {
      if (!_.isEqual(prevEditorState.current.toJSON(), listener.editorState.toJSON())) {
        if (!isChanged) { setIsChanged(true); }
        if (autoSaveTimer.current) { clearTimeout(autoSaveTimer.current); }
        autoSaveTimer.current = setTimeout(update, autoSaveInterval);
      }
    });
  }, [editor, isChanged]);

  useEffect(() => {
    if (fetcher.data?.status === 200 && fetcher.data?.statusText === 'OK') {
      setIsChanged(false);
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = null;
      }
    }
  }, [fetcher.data, editor]);

  return <div un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='0.5'>
    <Dropdown.Button className='[&>button:last-child]:w-5 [&>button:first-child]:(px-3)'
      onClick={update}
      trigger={['click']}
      icon={<div un-grid='~'><span className="i-ph:caret-down" un-text='xl gray-400' un-w='4' /></div>}
      menu={{
        items: [
          {
            key: 'delete',
            label: <button un-bg='white hover:red-400' un-text='hover:white' un-border='rounded' un-cursor='pointer'
              un-flex='~' un-items='center' un-gap='1' un-px='2' un-py='1'
              className='group'
            >
              <span className="i-bi:trash3" un-text='xl red-400 group-hover:white' />
              Delete
            </button>,
            onClick: deleteDocument,
          },
        ],
      }}
    >
      {isChanged && (
        <Tooltip title='Sync Document'>
          <span className="i-material-symbols-light:sync" un-text='xl blue-400' />
        </Tooltip>
      )}
      {!isChanged && (
        <Tooltip title='Document Already Saved' >
          <span className="i-material-symbols-light:save" un-text='xl blue-400' un-cursor='pointer' />
        </Tooltip>
      )}
      {fetcher.data?.error && (
        <Tooltip title={`${fetcher.data?.error?.message}`}>
          <span className="i-material-symbols-light:error" un-text='xl red-600' />
        </Tooltip>
      )}
    </Dropdown.Button>
  </div>;
};

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
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      if (fetcher.data?.status === 204 && fetcher.data?.statusText === 'No Content') {
        navigate('/z-editor/search');
      }
    } else if (fetcher.state === 'idle') {
      if (fetcher.data?.status === 201 && fetcher.data?.statusText === 'Created') {
        navigate(`/z-editor/${fetcher.data.data[0].id}`);
      } else if (fetcher.data?.status === 200 && fetcher.data?.statusText === 'OK') {
        setStatus('saved');
      }
    }
  }, [fetcher.state, fetcher.data]);

  const upsertDocument = useCallback(async () => {
    const content = editor.getEditorState().toJSON();
    const tag = [...new Set(Object.values(hashTagMap))];
    const reminder = Object.values(timeNodeMap).filter(node => node.getReminders().length > 0).map(node => node.exportJSON());
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
    return <span className="i-ph:spinner" un-text='xl blue-300' un-cursor='pointer' un-animate='spin' />;
  }

  if (status === 'new') {
    return <NewDocumentPersistence upsertDocument={upsertDocument} fetcher={fetcher} />;
  }

  return <SavedDocumentPersistence upsertDocument={upsertDocument} deleteDocument={deleteDocument} fetcher={fetcher} editor={editor} comments={comments} hashTagMap={hashTagMap} timeNodeMap={timeNodeMap} />;
};
