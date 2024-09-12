import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { Button, Dropdown, MenuProps, Tooltip } from 'antd';
import { $getRoot, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, LexicalEditor, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { useEffect, useMemo, useState } from 'react';
import { $createStickyNode } from '../sticky-note/StickNote';
import { BlockFormatDropDown } from './BlockFormatDropDown';

const getInsertItems = (editor: LexicalEditor) => [
  {
    key: 'sticky-note',
    label: 'Sticky Note',
    icon: <span className="i-bi:sticky" />,
    onClick: () => {
      editor.update(() => {
        const root = $getRoot();
        const stickyNode = $createStickyNode(0, 0);
        root.append(stickyNode);
      });
    }
  },
] as MenuProps['items'];

const Divider = () => <span un-bg='neutral' un-w='2px' un-h='70%' un-border='rounded-full' />;

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const insertItems = useMemo(() => getInsertItems(editor), [editor]);

  useEffect(() => {
    return editor.registerEditableListener((editable) => {
      setIsEditable(editable);
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return <div un-border='2px solid blue-4' un-text='2xl' un-grid='~' un-grid-flow='col' un-justify='start' un-items='center' un-gap='1'  >
    <button un-hover='bg-blue-6 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' un-disabled='[&>span]:text-gray-4 hover:bg-transparent cursor-not-allowed' disabled={!canUndo || !isEditable}
      onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
    >
      <Tooltip title="Undo" >
        <span className="i-material-symbols-light:undo" un-text='blue-6'  ></span>
      </Tooltip>
    </button>
    <button un-hover='bg-blue-6 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' un-disabled='[&>span]:text-gray-4 hover:bg-transparent cursor-not-allowed' disabled={!canRedo || !isEditable}
      onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
    >
      <Tooltip title="Redo" >
        <span className="i-material-symbols-light:redo" un-text='blue-6'  ></span>
      </Tooltip>
    </button>
    <Divider />

    <BlockFormatDropDown />
    <Divider />

    <Dropdown menu={{ items: insertItems }} trigger={['click']} >
      <Button un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='1' un-text='sm'>
        <span className="i-mdi:plus" />
        Insert
        <span className="i-ph:caret-down" />
      </Button>
    </Dropdown>

  </div>;
};