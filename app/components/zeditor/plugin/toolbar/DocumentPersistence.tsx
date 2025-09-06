import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Dropdown, Tooltip } from 'antd';
import { DOCUMENT_DELETE_COMMAND, DOCUMENT_SYNC_COMMAND, useDocumentSynchronizationContext } from '../document-synchronization/DocumentSynchronizationPlugin';

const NewDocumentPersistence = () => {
  const [editor] = useLexicalComposerContext();
  const { fetcher } = useDocumentSynchronizationContext();

  return <button onClick={() => editor.dispatchCommand(DOCUMENT_SYNC_COMMAND, undefined)}>
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


const SavedDocumentPersistence = () => {
  const { syncStatus } = useDocumentSynchronizationContext();
  const { fetcher } = useDocumentSynchronizationContext();
  const [editor] = useLexicalComposerContext();

  return <div un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='0.5'>
    <Dropdown.Button className='[&>button:last-child]:w-5 [&>button:first-child]:(px-3)'
      onClick={() => editor.dispatchCommand(DOCUMENT_SYNC_COMMAND, undefined)}
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
            onClick: () => editor.dispatchCommand(DOCUMENT_DELETE_COMMAND, undefined),
          },
        ],
      }}
    >
      {syncStatus === 'changed' && (
        <Tooltip title='Save Document'>
          <span className="i-material-symbols-light:save" un-text='xl blue-400' un-cursor='pointer' />
        </Tooltip>
      )}
      {syncStatus !== 'changed' && (
        <Tooltip title='Document Already Sync' >
          <span className="i-material-symbols-light:sync" un-text='xl green-500' />
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
  const { syncStatus } = useDocumentSynchronizationContext();

  if (syncStatus === 'loading') {
    return <span className="i-ph:spinner" un-text='xl blue-300' un-cursor='pointer' un-animate='spin' />;
  }

  if (syncStatus === 'new') {
    return <NewDocumentPersistence />;
  }

  return <SavedDocumentPersistence />;
};
