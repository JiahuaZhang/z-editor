import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Tooltip } from 'antd';

export const CreateOrSaveDocument = () => {
  const [editor] = useLexicalComposerContext();

  // state:
  // new document?
  // old, need save? or alredy sync

  return <button>
    <Tooltip title='Create New Document' >
      <span className="i-mdi:create" un-text='xl green-6' />
    </Tooltip>
  </button>;

  // return <button>
  //   <Tooltip title='Save Document' >
  //     <span className="i-material-symbols-light:save" un-text='xl blue-4' />
  //   </Tooltip>
  // </button>;

  // return <Tooltip title='Document Already Sync' >
  //   <span className="i-material-symbols-light:sync" un-text='xl green-6' un-cursor='pointer' />
  // </Tooltip>;

  // return <span className="i-ph:spinner" un-text='xl blue-3' un-cursor='pointer' un-animate='spin' />;
};
