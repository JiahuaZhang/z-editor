import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_NORMAL, createCommand } from 'lexical';
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import { FetcherWithComponents, useFetcher, useNavigate, useParams } from 'react-router';
import { useCommentContext } from '../comment/CommentContext';
import { useHashTagContext } from '../hashtag/HashTagPlugin';
import { useTimeNodeContext } from '../time/TimePlugin';

export const DOCUMENT_SYNC_COMMAND = createCommand<void>('DOCUMENT_SYNC_COMMAND');

type DocumentSyncStatus = 'loading' | 'new' | 'saved';

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
  const { syncStatus, setSyncStatus, fetcher } = useDocumentSynchronizationContext();
  const [editor] = useLexicalComposerContext();
  const { comments } = useCommentContext();
  const hashTagMap = useHashTagContext();
  const timeNodeMap = useTimeNodeContext();
  const params = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    return editor.registerCommand(
      DOCUMENT_SYNC_COMMAND,
      () => {
        upsertDocument();
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor, upsertDocument]);

  return null;
};
