import { Tooltip } from 'antd';
import { atom, useAtom } from 'jotai';

const showCommentSidebarAtom = atom(true);

export const CommentSidebar = ({ ...rest }: {}) => {
  const [showSidebar, setShowSidebar] = useAtom(showCommentSidebarAtom);

  if (!showSidebar) return <button un-position='absolute' un-right='0.2' un-top='1'
    un-border='2 rounded solid gray-3 hover:blue-4' un-z='10' un-flex='~'
    onClick={() => setShowSidebar(true)}
  >
    <Tooltip title='Expand Comments' >
      <span className="i-material-symbols-light:keyboard-double-arrow-left" un-text='xl hover:blue-6' />
    </Tooltip>
  </button>;

  return <aside un-max-w='90' {...rest} >
    <h1 un-flex='~' un-items='center' un-text='white' un-cursor='pointer'
      un-px='2' un-py='1' un-border='rounded' un-m='1' un-bg='blue-5 hover:gray-5'
      onClick={() => setShowSidebar(false)}
    >Comments <span className="i-material-symbols-light:keyboard-double-arrow-right" un-text='xl' /></h1>
  </aside>;
};