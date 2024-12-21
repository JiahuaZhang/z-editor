import { presetPrimaryColors } from '@ant-design/colors';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $patchStyleText } from '@lexical/selection';
import { ColorPicker, Tooltip } from 'antd';
import { useAtomValue, useSetAtom } from 'jotai';
import { $getSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { lazy, Suspense, useCallback } from 'react';
import { activeEditorAtom } from '../../context/activeEditor';
import { toolbarContextAtom } from '../../context/ToolbarContext';
import { isLinkEditModeAtom } from '../link/FloatingLinkEditorPlugin';
import { SHORTCUTS } from '../shortcut/shortcut';

const Divider = lazy(() => import('./ToolbarPlugin').then(module => ({ default: module.Divider })));

const preset = { colors: [...new Set(Object.values(presetPrimaryColors))], label: 'primary' };

export const FontFormat = ({}: {}) => {
  const editor = useAtomValue(activeEditorAtom);
  const toolbarContext = useAtomValue(toolbarContextAtom);
  const setIsLinkEditMode = useSetAtom(isLinkEditModeAtom);

  const applyStyleText = useCallback((styles: Record<string, string>) => {
    editor?.update(() => {
      const selection = $getSelection();
      if (selection === null) return;

      $patchStyleText(selection, styles);
    });
  }, [editor]);

  return <Suspense>
    <Tooltip title={`Bold (${SHORTCUTS.BOLD})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isBold && 'zinc-4'}`} un-p='1' un-border='rounded'
        onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <span className="i-tabler:bold" un-text={`${toolbarContext.isBold ? 'white' : 'gray-6'}`} />
      </button>
    </Tooltip>
    <Tooltip title={`Italic (${SHORTCUTS.ITALIC})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isItalic && 'zinc-4'}`} un-p='1' un-border='rounded'
        onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <span className="i-ci:italic" un-text={`${toolbarContext.isItalic ? 'white' : 'gray-6'}`} />
      </button>
    </Tooltip>
    <Tooltip title={`Underline (${SHORTCUTS.UNDERLINE})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isUnderline && 'zinc-4'}`} un-p='1' un-border='rounded'
        onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <span className="i-ci:underline" un-text={`${toolbarContext.isUnderline ? 'white' : 'gray-6'}`} />
      </button>
    </Tooltip>
    {
      !toolbarContext.isImageCaption && <Tooltip title={`Insert code block (${SHORTCUTS.CODE_BLOCK})`} >
        <button un-flex='~' un-bg={`${toolbarContext.isCode && 'zinc-4'}`} un-p='1' un-border='rounded'
          onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        >
          <span className="i-mdi:code" un-text={`${toolbarContext.isCode ? 'white' : 'gray-6'}`} />
        </button>
      </Tooltip>
    }
    <Tooltip title={`Insert link (${SHORTCUTS.INSERT_LINK})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isLink && 'zinc-4'}`} un-p='1' un-border='rounded'
        lexical-editor='float-link'
        onClick={() => {
          if (!toolbarContext.isLink) {
            setIsLinkEditMode(true);
            editor?.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
          } else {
            setIsLinkEditMode(false);
            editor?.dispatchCommand(TOGGLE_LINK_COMMAND, null);
          }
        }}
      >
        <span className="i-ci:link" un-text={`${toolbarContext.isLink ? 'white' : 'gray-6'}`} />
      </button>
    </Tooltip>

    <ColorPicker defaultValue={toolbarContext.fontColor} presets={[preset]}
      onChangeComplete={color => applyStyleText({ 'color': `#${color.toHex()}` })}
    >
      <Tooltip title='Text color' >
        <span un-cursor='pointer' className="i-flowbite:font-color-alt-solid" style={{ color: toolbarContext.fontColor }} />
      </Tooltip>
    </ColorPicker>

    <ColorPicker defaultValue={toolbarContext.bgColor} presets={[preset]}
      onChangeComplete={color => applyStyleText({ 'background-color': `#${color.toHex()}` })}
    >
      <Tooltip title='Background color' >
        <span un-cursor='pointer' className="i-icon-park-outline:background-color" un-text='gray-6' />
      </Tooltip>
    </ColorPicker>

    {/* other minor formats */}
    {/* lowercase, uppercase, capitalize, strikethrough, subscript, superscript, clear formats */}
    <Divider />
  </Suspense>;
};