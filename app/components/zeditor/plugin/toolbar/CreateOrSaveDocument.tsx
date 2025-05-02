import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createClient } from '@supabase/supabase-js';
import { Tooltip } from 'antd';
import { useCommentContext } from '../comment/CommentContext';
import { useHashTagContext } from '../hashtag/HashTagPlugin';
import { useTimeNodeContext } from '../time/TimePlugin';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

export const CreateOrSaveDocument = () => {
  const [editor] = useLexicalComposerContext();
  const { comments } = useCommentContext();
  const hashTagMap = useHashTagContext();
  const timeNodeMap = useTimeNodeContext();

  return <button onClick={async () => {
    const content = editor.getEditorState().toJSON();
    const tag = [...new Set(Object.values(hashTagMap))];
    const reminder = Object.values(timeNodeMap)
      .filter(node => node.getReminders().length > 0);
    const result = {
      content,
      comment: comments,
      tag,
      reminder,
    };
    const response = await supabase.from('editor_documents').insert(result);
    console.log(response);
  }} >
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
