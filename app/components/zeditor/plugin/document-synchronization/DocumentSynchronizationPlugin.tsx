import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_NORMAL, createCommand } from 'lexical';
import _ from 'lodash';
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FetcherWithComponents, useFetcher, useNavigate, useParams } from 'react-router';
import { useCommentContext } from '../comment/CommentContext';
import { useHashTagContext } from '../hashtag/HashTagPlugin';
import { useTimeNodeContext } from '../time/TimePlugin';

export const DOCUMENT_SYNC_COMMAND = createCommand<void>('DOCUMENT_SYNC_COMMAND');
export const DOCUMENT_DELETE_COMMAND = createCommand<void>('DOCUMENT_DELETE_COMMAND');

const autoSaveInterval = (Number(import.meta.env.VITE_AUTO_SAVE_INTERVAL) || 30) * 1000;

type DocumentSyncStatus = 'loading' | 'new' | 'saved' | 'changed';

type DocumentSynchronization = {
  syncStatus: DocumentSyncStatus;
  setSyncStatus: Dispatch<SetStateAction<DocumentSyncStatus>>;
  fetcher: FetcherWithComponents<any>;
};

const Context = createContext<DocumentSynchronization>({
  syncStatus: 'loading',
  setSyncStatus: () => {},
  fetcher: {} as FetcherWithComponents<any>,
});

export const DocumentSynchronizationContext = ({ children }: { children: React.ReactNode; }) => {
  const [syncStatus, setSyncStatus] = useState<DocumentSyncStatus>('loading');
  const fetcher = useFetcher();

  return <Context.Provider value={{ syncStatus, setSyncStatus, fetcher }}>{children}</Context.Provider>;
};

export const useDocumentSynchronizationContext = () => useContext(Context);

export const DocumentSynchronizationPlugin = () => {
  const { setSyncStatus, fetcher } = useDocumentSynchronizationContext();
  const [editor] = useLexicalComposerContext();
  const { comments } = useCommentContext();
  const hashTagMap = useHashTagContext();
  const timeNodeMap = useTimeNodeContext();
  const params = useParams();
  const navigate = useNavigate();
  const prevComments = useRef(comments);
  const prevEditorState = useRef(editor.getEditorState());
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (params.id === undefined) {
      setSyncStatus('new');
    } else {
      setSyncStatus('saved');
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
        setSyncStatus('saved');
      }
    }
  }, [fetcher.state, fetcher.data]);

  const upsertDocument = useCallback(async () => {
    const content = editor.getEditorState().toJSON();
    const tag = [...new Set(Object.values(hashTagMap).map(tag => tag.replace(/^#/, '')))];
    const alert = Object.values(timeNodeMap).filter(node => node.getAlert().length > 0).map(node => node.exportJSON());
    const document = {
      content,
      comment: comments,
      tag,
      alert,
      id: params.id,
    };

    await fetcher.submit(document as any, {
      method: 'post',
      action: '/api/document/upsert',
      encType: 'application/json'
    });
  }, [editor, params.id, comments, hashTagMap, timeNodeMap]);

  const deleteDocument = useCallback(async () => {
    if (params.id === undefined) {
      return;
    }

    await fetcher.submit({ id: params.id! }, {
      method: 'post',
      action: '/api/document/delete'
    });
  }, [params.id]);

  useEffect(() => editor.registerCommand(
    DOCUMENT_SYNC_COMMAND,
    () => {
      upsertDocument();
      return true;
    },
    COMMAND_PRIORITY_NORMAL
  ), [editor, upsertDocument]);

  useEffect(() => editor.registerCommand(
    DOCUMENT_DELETE_COMMAND,
    () => {
      deleteDocument();
      return true;
    },
    COMMAND_PRIORITY_NORMAL
  ), [editor, deleteDocument]);

  const update = useCallback(async () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    await upsertDocument();
    prevComments.current = comments;
    prevEditorState.current = editor.getEditorState();
  }, [comments, hashTagMap, timeNodeMap, editor, upsertDocument]);

  useEffect(() => {
    prevComments.current = comments;
    prevEditorState.current = editor.getEditorState();
  }, [editor]);

  useEffect(() => {
    if (prevComments.current && !_.isEqual(prevComments.current, comments)) {
      setSyncStatus(prev => prev === 'saved' ? 'changed' : prev);
      prevComments.current = comments;
    }
  }, [comments]);

  useEffect(() => {
    return editor.registerUpdateListener(async listener => {
      if (!_.isEqual(prevEditorState.current.toJSON(), listener.editorState.toJSON())) {
        setSyncStatus(prev => prev === 'saved' ? 'changed' : prev);
        if (autoSaveTimer.current) { clearTimeout(autoSaveTimer.current); }
        autoSaveTimer.current = setTimeout(update, autoSaveInterval);
      }
    });
  }, [editor, update]);

  useEffect(() => {
    if (fetcher.data?.status === 200 && fetcher.data?.statusText === 'OK') {
      setSyncStatus(prev => prev === 'saved' ? 'changed' : prev);
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = null;
      }
    }
  }, [fetcher.data, editor]);

  return null;
};
