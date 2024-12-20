import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { Tooltip } from 'antd';
import { useAtomValue, useSetAtom } from 'jotai';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { lazy, Suspense } from 'react';
import { activeEditorAtom } from '../../context/activeEditor';
import { toolbarContextAtom } from '../../context/ToolbarContext';
import { sanitizeUrl } from '../../util/url';
import { isLinkEditModeAtom } from '../link/FloatingLinkEditorPlugin';
import { SHORTCUTS } from '../shortcut/shortcut';

const Divider = lazy(() => import('./ToolbarPlugin').then(module => ({ default: module.Divider })));

export const FontFormat = ({}: {}) => {
  const editor = useAtomValue(activeEditorAtom);
  const toolbarContext = useAtomValue(toolbarContextAtom);
  const setIsLinkEditMode = useSetAtom(isLinkEditModeAtom);

  return <Suspense>
    <Tooltip title={`Bold (${SHORTCUTS.BOLD})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isBold && 'zinc-4'}`} un-p='1' un-border='rounded'
        onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <span className="i-tabler:bold" un-text={`${toolbarContext.isBold && 'white'}`} />
      </button>
    </Tooltip>
    <Tooltip title={`Italic (${SHORTCUTS.ITALIC})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isItalic && 'zinc-4'}`} un-p='1' un-border='rounded'
        onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <span className="i-ci:italic" un-text={`${toolbarContext.isItalic && 'white'}`} />
      </button>
    </Tooltip>
    <Tooltip title={`Underline (${SHORTCUTS.UNDERLINE})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isUnderline && 'zinc-4'}`} un-p='1' un-border='rounded'
        onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <span className="i-ci:underline" un-text={`${toolbarContext.isUnderline && 'white'}`} />
      </button>
    </Tooltip>
    {
      !toolbarContext.isImageCaption && <Tooltip title={`Insert code block (${SHORTCUTS.CODE_BLOCK})`} >
        <button un-flex='~' un-bg={`${toolbarContext.isCode && 'zinc-4'}`} un-p='1' un-border='rounded'
          onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        >
          <span className="i-mdi:code" un-text={`${toolbarContext.isCode && 'white'}`} />
        </button>
      </Tooltip>
    }
    <Tooltip title={`Insert link (${SHORTCUTS.INSERT_LINK})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isLink && 'zinc-4'}`} un-p='1' un-border='rounded'
        onClick={() => {
          if (!toolbarContext.isLink) {
            setIsLinkEditMode(true);
            editor?.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
          } else {
            setIsLinkEditMode(false);
            editor?.dispatchCommand(TOGGLE_LINK_COMMAND, null);
          }
        }}
      >
        <span className="i-ci:link" un-text={`${toolbarContext.isLink && 'white'}`} />
      </button>
    </Tooltip>

    {/* text color dropdown */}

    {/* background color dropdown */}

    {/* other minor formats */}
    {/* lowercase, uppercase, capitalize, strikethrough, subscript, superscript, clear formats */}
    <Divider />
  </Suspense>;
};