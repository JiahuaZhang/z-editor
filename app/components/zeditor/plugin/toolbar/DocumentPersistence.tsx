import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Dropdown, Tooltip } from 'antd';
import { useCallback, useRef } from 'react';
import { useFetcher, useNavigate, useParams } from 'react-router';
import { useCommentContext } from '../comment/CommentContext';
import { useHashTagContext } from '../hashtag/HashTagPlugin';
import { useTimeNodeContext } from '../time/TimePlugin';

export const DocumentPersistence = () => {
  const fetcher = useFetcher();
  const [editor] = useLexicalComposerContext();
  const { comments } = useCommentContext();
  const hashTagMap = useHashTagContext();
  const timeNodeMap = useTimeNodeContext();
  const params = useParams();
  const navigate = useNavigate();
  const documentIdRef = useRef<string | undefined>();
  if (documentIdRef.current === undefined) {
    documentIdRef.current = params.id;
  }

  if (fetcher.data?.status === 204 && fetcher.data?.statusText === 'No Content') {
    navigate('/z-editor/search');
  }

  if (fetcher.data?.status === 201 && fetcher.data?.statusText === 'Created') {
  }

  const upsertDocument = useCallback(async () => {
    const content = editor.getEditorState().toJSON();
    const tag = [...new Set(Object.values(hashTagMap))];
    const reminder = Object.values(timeNodeMap).filter(node => node.getReminders().length > 0);
    const document = {
      content,
      comment: comments,
      tag,
      reminder,
      id: documentIdRef.current,
    };

    // todo: if created new document, then redirect to the new document
    const response = await fetcher.submit(document as any, {
      method: 'post',
      action: '/api/document/upsert',
      encType: 'application/json'
    });

    if (!documentIdRef.current) {
      console.log('created new document case');
      console.log(response);
      // redirect(`/z-editor/${response.data.id}`);
    }

    if (documentIdRef.current) {
      console.log('created new document case');
      console.log(response);
    }
  }, [editor, documentIdRef.current]);

  const deleteDocument = useCallback(async () => {
    await fetcher.submit({ id: documentIdRef.current! }, {
      method: 'post',
      action: '/api/document/delete'
    });
  }, []);

  console.log(fetcher.data);

  if (fetcher.state === 'submitting') {
    return <span className="i-ph:spinner" un-text='xl blue-3' un-cursor='pointer' un-animate='spin' />;
  }

  if (fetcher.state === 'idle') {
    if (!documentIdRef.current) {
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
        {fetcher.data === undefined && (
          <Tooltip title='Create New Document'>
            <span className="i-mdi:create" un-text='xl green-6' />
          </Tooltip>
        )}
        {fetcher.data?.error && (
          <Tooltip title={`${fetcher.data?.error?.message}`}>
            <span className="i-material-symbols-light:error" un-text='xl red-6' />
          </Tooltip>
        )}
      </Dropdown.Button>
    </div>;
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
