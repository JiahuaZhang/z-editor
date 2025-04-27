import { presetPrimaryColors } from '@ant-design/colors';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $patchStyleText } from '@lexical/selection';
import { Button, ColorPicker, Dropdown, Tooltip } from 'antd';
import { $getSelection, FORMAT_TEXT_COMMAND, LexicalEditor } from 'lexical';
import { lazy, Suspense, useCallback, useMemo } from 'react';
import { useActiveEditorContext } from '../../context/ActiveEditor';
import { useFloatContext } from '../../context/FloatContext';
import { useToolbarContext } from '../../context/ToolbarContext';
import { clearSelectionFormatting } from '../../util/utils';
import { SHORTCUTS } from '../shortcut/shortcut';

const Divider = lazy(() => import('./ToolbarPlugin').then(module => ({ default: module.Divider })));

export const ColorPreset = { colors: [...new Set(Object.values(presetPrimaryColors))], label: 'primary' };

const getFormatItems = (editor: LexicalEditor) => [
  {
    key: 'lowercase',
    label: 'Lowercase',
    icon: <span className="i-mdi:format-lowercase" un-text='xl!' />,
    extra: SHORTCUTS.LOWERCASE,
    onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase'),
  },
  {
    key: 'uppercase',
    label: 'Uppercase',
    icon: <span className="i-mdi:format-uppercase" un-text='xl!' />,
    extra: SHORTCUTS.UPPERCASE,
    onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase'),
  },
  {
    key: 'capitalize',
    label: 'Capitalize',
    icon: <span className="i-mdi:format-text" un-text='xl!' />,
    extra: SHORTCUTS.CAPITALIZE,
    onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize'),
  },
  {
    key: 'strikethrough',
    label: 'Strikethrough',
    icon: <span className="i-mdi:format-strikethrough" un-text='xl!' />,
    extra: SHORTCUTS.STRIKETHROUGH,
    onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'),
  },
  {
    key: 'subscript',
    label: 'Subscript',
    icon: <span className="i-mdi:format-subscript" un-text='xl!' />,
    extra: SHORTCUTS.SUBSCRIPT,
    onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript'),
  },
  {
    key: 'superscript',
    label: 'Superscript',
    icon: <span className="i-mdi:format-superscript" un-text='xl!' />,
    extra: SHORTCUTS.SUPERSCRIPT,
    onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript'),
  },
  {
    key: 'clear',
    label: 'Clear Formatting',
    icon: <span className="i-mdi:format-clear" un-text='xl!' />,
    extra: SHORTCUTS.CLEAR_FORMATTING,
    onClick: () => clearSelectionFormatting(editor),
  },
];

export const FontFormat = ({}: {}) => {
  const editor = useActiveEditorContext();
  const { toolbarContext } = useToolbarContext();
  const { setIsLinkEditMode } = useFloatContext();
  const formatItems = useMemo(() => editor ? getFormatItems(editor) : [], [editor]);

  const applyStyleText = useCallback((styles: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection === null) return;

      $patchStyleText(selection, styles);
    });
  }, [editor]);

  return <Suspense>
    <Tooltip title={`Bold (${SHORTCUTS.BOLD})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isBold && 'zinc-4'}`} un-p='1' un-border='rounded'
        un-cursor='disabled:not-allowed'
        disabled={!editor.isEditable()}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <span className="i-tabler:bold" un-text={`${toolbarContext.isBold ? 'white' : !editor.isEditable() ? 'gray-2' : 'gray-6'}`} />
      </button>
    </Tooltip>
    <Tooltip title={`Italic (${SHORTCUTS.ITALIC})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isItalic && 'zinc-4'}`} un-p='1' un-border='rounded'
        un-cursor='disabled:not-allowed'
        disabled={!editor.isEditable()}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <span className="i-ci:italic" un-text={`${toolbarContext.isItalic ? 'white' : !editor.isEditable() ? 'gray-2' : 'gray-6'}`} />
      </button>
    </Tooltip>
    <Tooltip title={`Underline (${SHORTCUTS.UNDERLINE})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isUnderline && 'zinc-4'}`} un-p='1' un-border='rounded'
        un-cursor='disabled:not-allowed'
        disabled={!editor.isEditable()}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <span className="i-ci:underline" un-text={`${toolbarContext.isUnderline ? 'white' : !editor.isEditable() ? 'gray-2' : 'gray-6'}`} />
      </button>
    </Tooltip>
    {
      !toolbarContext.isImageCaption && <Tooltip title={`Insert code block (${SHORTCUTS.CODE_BLOCK})`} >
        <button un-flex='~' un-bg={`${toolbarContext.isCode && 'zinc-4'}`} un-p='1' un-border='rounded'
          un-cursor='disabled:not-allowed'
          disabled={!editor.isEditable()}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        >
          <span className="i-mdi:code" un-text={`${toolbarContext.isCode ? 'white' : !editor.isEditable() ? 'gray-2' : 'gray-6'}`} />
        </button>
      </Tooltip>
    }
    <Tooltip title={`Insert link (${SHORTCUTS.INSERT_LINK})`} >
      <button un-flex='~' un-bg={`${toolbarContext.isLink && 'zinc-4'}`} un-p='1' un-border='rounded'
        lexical-editor='float-link'
        un-cursor='disabled:not-allowed'
        disabled={!editor.isEditable()}
        onClick={() => {
          if (!toolbarContext.isLink) {
            setIsLinkEditMode(true);
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
          } else {
            setIsLinkEditMode(false);
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
          }
        }}
      >
        <span className="i-ci:link" un-text={`${toolbarContext.isLink ? 'white' : !editor.isEditable() ? 'gray-2' : 'gray-6'}`} />
      </button>
    </Tooltip>

    <ColorPicker defaultValue={toolbarContext.fontColor} presets={[ColorPreset]}
      disabled={!editor.isEditable()}
      onChangeComplete={color => applyStyleText({ 'color': `#${color.toHex()}` })}
    >
      <Tooltip className='mx-0.5' title='Text color'>
        <span un-cursor={`${editor.isEditable() ? 'pointer' : 'not-allowed'}`} className="i-flowbite:font-color-alt-solid" style={{ color: editor.isEditable() ? toolbarContext.fontColor : '#e5e7eb' }} />
      </Tooltip>
    </ColorPicker>

    <ColorPicker defaultValue={toolbarContext.bgColor} presets={[ColorPreset]}
      disabled={!editor.isEditable()}
      onChangeComplete={color => applyStyleText({ 'background-color': `#${color.toHex()}` })}
    >
      <Tooltip className='mx-0.5' title='Background color' >
        <span un-cursor={`${editor.isEditable() ? 'pointer' : 'not-allowed'}`} className="i-icon-park-outline:background-color" un-text={`${editor.isEditable() ? 'gray-6' : 'gray-2'}`} />
      </Tooltip>
    </ColorPicker>

    <Dropdown menu={{ items: formatItems }} trigger={['click']} className='[&>div]:(border-2! border-blue-4! border-solid!)' overlayClassName='[&>ul>li]:(text-blue-4 text-base)'
      disabled={!editor.isEditable()}
    >
      <Button un-mx='0.5' un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='0' un-text='xl gray-6' un-px='1' un-pr='0' >
        <span className="i-ci:font" /> <span className="i-ph:caret-down" un-text='lg gray-4' />
      </Button>
    </Dropdown>
    <Divider />
  </Suspense>;
};