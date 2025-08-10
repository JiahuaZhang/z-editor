import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { IS_APPLE, mergeRegister } from '@lexical/utils';
import { Tooltip } from 'antd';
import { BLUR_COMMAND, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FOCUS_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { useEffect, useState } from 'react';
import { useActiveEditorContext } from '../../context/ActiveEditor';
import { useToolbarContext } from '../../context/ToolbarContext';
import { BlockFormatDropDown } from './BlockFormatDropDown';
import { CodeLanguageDropDown } from './CodeLanguageDropDown';
import { DocumentPersistence } from './DocumentPersistence';
import { ElementFormatDropDown } from './ElementFormatDropDown';
import { FontDropDown } from './FontDropDown';
import { FontFormat } from './FontFormat';
import { FontSize } from './FontSize';
import { InsertDropDown } from './InsertDropDown';
import { ReadOnlyMode } from './ReadOnlyMode';

export const Divider = () => <span un-bg='neutral' un-w='2px' un-h='60%' un-border='rounded-full' un-mx='1' />;

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const activeEditor = useActiveEditorContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const { toolbarContext, onCodeLanguageSelect } = useToolbarContext();

  useEffect(() => mergeRegister(
    activeEditor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    activeEditor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    activeEditor.registerCommand(
      FOCUS_COMMAND,
      (payload) => {
        setIsFocus(true);
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    activeEditor.registerCommand(
      BLUR_COMMAND,
      payload => {
        setIsFocus(false);
        return false;
      },
      COMMAND_PRIORITY_LOW
    )
  ), [activeEditor]);

  return <div un-position='sticky' un-w='full' un-top='0' un-border-b='1px solid gray-400' un-bg={`${isFocus ? 'gradient-to-r' : 'white'}`} un-z='10'
    un-from='blue-50' un-to='purple-50' un-text='2xl' un-grid='~' un-grid-flow='col' un-justify='start' un-items='center' un-gap='1'>
    <button un-hover='bg-blue-600 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' un-disabled='[&>span]:text-gray-400 hover:bg-transparent cursor-not-allowed' disabled={!canUndo || !editor.isEditable()}
      onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
    >
      <Tooltip title={`${IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}`} >
        <span className="i-material-symbols-light:undo" un-text='blue-600' ></span>
      </Tooltip>
    </button>
    <button un-hover='bg-blue-600 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' un-disabled='[&>span]:text-gray-400 hover:bg-transparent cursor-not-allowed' disabled={!canRedo || !editor.isEditable()}
      onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
    >
      <Tooltip title={IS_APPLE ? 'Redo (⇧⌘Z)' : 'Redo (Ctrl+Y)'} >
        <span className="i-material-symbols-light:redo" un-text='blue-600' ></span>
      </Tooltip>
    </button>
    <Divider />

    <BlockFormatDropDown blockType={toolbarContext.blockType} />
    {
      toolbarContext.blockType === 'code'
      && <CodeLanguageDropDown language={toolbarContext.codeLanguage} onChange={onCodeLanguageSelect} />
    }
    {
      toolbarContext.blockType !== 'code'
      && <>
        <FontDropDown font={toolbarContext.fontFamily} />
        <FontSize fontSize={toolbarContext.fontSize.slice(0, -2)} />
        <FontFormat />
      </>
    }

    <InsertDropDown />
    <ElementFormatDropDown elementFormat={toolbarContext.elementFormat} isRTL={toolbarContext.isRTL} />

    <ReadOnlyMode />
    <DocumentPersistence />
  </div>;
};