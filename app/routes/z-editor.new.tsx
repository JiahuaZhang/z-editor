import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { ZEditor } from '~/components/zeditor/zeditor';

const NewPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(true);
  }, []);

  return null;
};

const Page = () => {
  return <div un-h='[calc(100vh-46px)]'  >
    <ZEditor>
      <NewPlugin />
    </ZEditor>
  </div>;
};

export default Page;