import { Button, Dropdown, MenuProps } from 'antd';
import { useAtomValue } from 'jotai';
import { $getRoot, LexicalEditor } from 'lexical';
import { useMemo } from 'react';
import { activeEditorAtom } from '../../context/activeEditor';
import { INSERT_INLINE_COMMAND } from '../comment/CommentPlugin';
import { INSERT_EXCALIDRAW_COMMAND } from '../excalidraw/ExcalidrawPlugin';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '../horizontal-rule/HorizontalRuleNode';
import { INSERT_IMAGE_COMMAND } from '../image/ImagePlugin';
import { INSERT_PAGE_BREAK } from '../page-break/PageBreakPlugin';
import { $createStickyNode } from '../sticky-note/StickNote';

const getInsertItems = (editor: LexicalEditor) => [
  {
    key: 'horizontal-rule',
    label: 'Horizontal Rule',
    icon: <span className="i-material-symbols-light:horizontal-rule" un-text='xl!' />,
    onClick: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
  },
  {
    key: 'page-break',
    label: 'Page Break',
    icon: <span className="i-mdi:scissors" un-text='xl!' />,
    onClick: () => editor.dispatchCommand(INSERT_PAGE_BREAK, undefined)
  },
  {
    key: 'sticky-note',
    label: 'Sticky Note',
    icon: <span className="i-bi:sticky" un-text='xl!' />,
    onClick: () => editor.update(() => {
      const root = $getRoot();
      const stickyNode = $createStickyNode(0, 0);
      root.append(stickyNode);
    })
  },
  {
    key: 'image',
    label: 'Random Image',
    icon: <span className='i-mdi:image-outline' un-text='xl!' />,
    onClick: () => editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: 'https://picsum.photos/200/300',
      altText: 'random image',
    })
  },
  {
    key: 'excali-draw',
    label: 'Excalidraw',
    icon: <span className="i-ph:graph" un-text='xl!' />,
    onClick: () => editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined)
  },
  {
    key: 'comment',
    label: 'Comment',
    icon: <span className="i-material-symbols-light:comment" un-text='xl!' />,
    onClick: () => editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)
  },
] as MenuProps['items'];

export const InsertDropDown = () => {
  const activeEditor = useAtomValue(activeEditorAtom);
  const insertItems = useMemo(() => activeEditor ? getInsertItems(activeEditor) : [], [activeEditor]);

  return <Dropdown menu={{ items: insertItems }} trigger={['click']} >
    <Button un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='0.25' un-px='1' un-text='sm gray-6'>
      <span className="i-mdi:plus" un-text='lg' /> Insert <span className="i-ph:caret-down" un-text='lg' />
    </Button>
  </Dropdown>;
};