import { INSERT_EMBED_COMMAND } from '@lexical/react/LexicalAutoEmbedPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, Dropdown, MenuProps } from 'antd';
import { $getRoot } from 'lexical';
import { lazy, Suspense, useMemo } from 'react';
import { useActiveEditorContext } from '../../context/ActiveEditor';
import { INSERT_COLLAPSIBLE_COMMAND } from '../collapsible/CollapsiblePlugin';
import { INSERT_INLINE_COMMAND } from '../comment/CommentPlugin';
import { TwitterEmbedConfig, YoutubeEmbedConfig } from '../embed/EmbedPlugin';
import { INSERT_EXCALIDRAW_COMMAND } from '../excalidraw/ExcalidrawPlugin';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '../horizontal-rule/HorizontalRuleNode';
import { INSERT_PAGE_BREAK } from '../page-break/PageBreakPlugin';
import { OPEN_COLUMN_LAYOUT_POPUP_COMMAND, OPEN_EQUATION_POPUP_COMMAND, OPEN_IMAGE_POPUP_COMMAND, OPEN_INLINE_IMAGE_POPUP_COMMAND, OPEN_TABLE_POPUP_COMMAND } from '../popup/PopupPlugin';
import { $createStickyNode } from '../sticky-note/StickNote';

const Divider = lazy(() => import('./ToolbarPlugin').then(module => ({ default: module.Divider })));

export const InsertDropDown = () => {
  const [editor] = useLexicalComposerContext();
  const activeEditor = useActiveEditorContext();
  const insertItems = useMemo(() => [
    {
      key: 'horizontal-rule',
      label: 'Horizontal Rule',
      icon: <span className="i-material-symbols-light:horizontal-rule" un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
    },
    {
      key: 'page-break',
      label: 'Page Break',
      icon: <span className="i-mdi:scissors" un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(INSERT_PAGE_BREAK, undefined)
    },
    {
      key: 'image',
      label: 'Image',
      icon: <span className='i-mdi:image-outline' un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(OPEN_IMAGE_POPUP_COMMAND, undefined),
    },
    {
      key: 'inline-image',
      label: 'Inline Image',
      icon: <span className='i-mdi:image-outline' un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(OPEN_INLINE_IMAGE_POPUP_COMMAND, undefined),
    },
    {
      key: 'excali-draw',
      label: 'Excalidraw',
      icon: <span className="i-ph:graph" un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined)
    },
    {
      key: 'comment',
      label: 'Comment',
      icon: <span className="i-material-symbols-light:comment" un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)
    },
    {
      key: 'table',
      label: 'Table',
      icon: <span className="i-material-symbols-light:table-outline" un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(OPEN_TABLE_POPUP_COMMAND, undefined)
    },
    {
      key: 'column-layout',
      label: 'Column Layout',
      icon: <span className="i-material-symbols-light:view-column-outline" un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(OPEN_COLUMN_LAYOUT_POPUP_COMMAND, undefined)
    },
    {
      key: 'equation',
      label: 'Equation',
      icon: <span className="i-ph:plus-minus" un-text='xl!' />,
      onClick: () => activeEditor.dispatchCommand(OPEN_EQUATION_POPUP_COMMAND, undefined)
    },
    {
      key: 'sticky-note',
      label: 'Sticky Note',
      icon: <span className="i-bi:sticky" un-text='xl!' />,
      onClick: () => activeEditor.update(() => {
        const root = $getRoot();
        const stickyNode = $createStickyNode(0, 0);
        root.append(stickyNode);
      })
    },
    {
      key: 'collapsable',
      label: 'Collapsable container',
      icon: <span className="i-mdi:triangle" un-text='xl!' un-rotate='90' />,
      onClick: () => activeEditor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)
    },
    {
      key: YoutubeEmbedConfig.type,
      label: YoutubeEmbedConfig.contentName,
      icon: YoutubeEmbedConfig.largeIcon,
      onClick: () => activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, YoutubeEmbedConfig.type)
    },
    {
      key: TwitterEmbedConfig.type,
      label: TwitterEmbedConfig.contentName,
      icon: TwitterEmbedConfig.largeIcon,
      onClick: () => activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, TwitterEmbedConfig.type)
    }
  ] as MenuProps['items'], [activeEditor]);

  return <Suspense>
    <Dropdown disabled={!editor.isEditable()} menu={{ items: insertItems }} trigger={['click']} >
      <Button un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='0.25' un-px='1' un-text='sm gray-600'>
        <span className="i-mdi:plus" un-text='lg' /> Insert <span className="i-ph:caret-down" un-text='lg' />
      </Button>
    </Dropdown>
    <Divider />
  </Suspense>;
};