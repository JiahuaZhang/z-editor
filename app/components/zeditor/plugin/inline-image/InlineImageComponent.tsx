import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { Checkbox, Form, Input, Modal, Radio } from 'antd';
import { useAtomValue } from 'jotai';
import { $getNodeByKey, $getSelection, $isNodeSelection, $setSelection, BaseSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, DRAGSTART_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, NodeKey } from 'lexical';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { activeEditorAtom } from '../../context/activeEditor';
import { $isInlineImageNode, InlineImageNode, Position } from './InlineImageNode';

const imageCache = new Set();

const useSuspenseImage = (src: string) => {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
};

const LazyImage = ({ altText, className, imageRef, src, width, height, position, ...rest }: {
  altText: string;
  className?: string;
  height: 'inherit' | number;
  imageRef: { current: null | HTMLImageElement; };
  src: string;
  width: 'inherit' | number;
  position: Position;
}) => {
  useSuspenseImage(src);
  return (
    <img un-block='~'
      className={className || undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      data-position={position}
      style={{ height: height !== 0 ? height : 'inherit', width: width !== 0 ? width : 'inherit' }}
      draggable="false"
      {...rest}
    />
  );
};

const InlineModal = ({ nodeKey, isModalOpen, setIsModalOpen }: {
  nodeKey: NodeKey;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const activeEditor = useAtomValue(activeEditorAtom);
  const [altText, setAltText] = useState('');
  const [position, setPosition] = useState<Position>('left');
  const [showCaption, setShowCaption] = useState(false);

  useEffect(() => {
    if (!activeEditor) return;

    const node = activeEditor.getEditorState().read(() => $getNodeByKey(nodeKey)) as InlineImageNode;
    setAltText(node.getAltText());
    setPosition(node.getPosition());
    setShowCaption(node.getShowCaption());
  }, [activeEditor]);

  return <Modal open={isModalOpen}
    title="Update Inline Image"
    footer={[
      <button un-bg='gray-2 hover:blue-5 focus:blue-5'
        un-text='hover:white focus:white'
        un-p='2'
        un-py='1'
        un-border='rounded'
        un-outline='none'
        key='confirm-footer'
        onClick={() => {
          if (!activeEditor) return;

          const node = activeEditor.getEditorState().read(() => $getNodeByKey(nodeKey)) as InlineImageNode;
          if (!node) return;

          const payload = { altText, position, showCaption };

          activeEditor.update(() => node.update(payload));
          setIsModalOpen(false);
        }}>Confirm</button>
    ]}
    onCancel={() => setIsModalOpen(false)}
  >
    <Form labelCol={{ span: 6 }} >
      <Form.Item label="Position">
        <Radio.Group optionType='button' block value={position} onChange={e => setPosition(e.target.value as Position)} >
          <Radio value='left'>Left</Radio>
          <Radio value='full'>Full Width</Radio>
          <Radio value='right'>Right</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Caption (Alt Text)">
        <Input placeholder="Image Caption" value={altText} onChange={e => setAltText(e.target.value)} />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6 }} >
        <Checkbox checked={showCaption} onChange={e => setShowCaption(e.target.checked)}  >Show Caption</Checkbox>
      </Form.Item>
    </Form>
  </Modal>;
};

export const InlineImageComponent = ({ src, altText, nodeKey, width, height, showCaption, position }: {
  altText: string;
  height: 'inherit' | number;
  nodeKey: NodeKey;
  showCaption: boolean;
  src: string;
  width: 'inherit' | number;
  position: Position;
}) => {
  const imageRef = useRef<null | HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const $onDelete = useCallback(
    (payload: KeyboardEvent) => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        payload.preventDefault();
        editor.update(() => {
          deleteSelection.getNodes().forEach((node) => {
            if ($isInlineImageNode(node)) {
              node.remove();
            }
          });
        });
      }
      return false;
    },
    [editor, isSelected],
  );

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        isSelected
        && $isNodeSelection(latestSelection)
        && latestSelection.getNodes().length === 1
        && buttonElem !== null
        && buttonElem !== document.activeElement
      ) {
        event.preventDefault();
        buttonElem.focus();
        return true;
      }
      return false;
    },
    [altText, isSelected, showCaption],
  );

  const $onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (buttonRef.current === event.target) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [editor, setSelected],
  );

  useEffect(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read($getSelection));
        }
      }),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;
          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW,),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW,),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW,),
    );
    return () => {
      isMounted = false;
      unregister();
    };
  }, [clearSelection, editor, isSelected, nodeKey, $onDelete, $onEnter, $onEscape, setSelected]);

  const draggable = isSelected && $isNodeSelection(selection);
  const isFocused = isSelected;
  return (
    <Suspense fallback={null}>
      <span un-grid='~'
        un-justify={`${position === 'left' ? 'end' : position === 'right' ? 'start' : 'around'}`}
        draggable={draggable}>
        <div un-position='relative' >
          <LazyImage un-border={`${isFocused ? '2 solid blue-4 rounded-t' : '0'}`}
            un-cursor={`${(isFocused && $isNodeSelection(selection)) ? 'grab' : ''}`}
            un-block='~'
            src={src}
            altText={altText}
            imageRef={imageRef}
            width={width}
            height={height}
            position={position}
          />
          {
            isFocused &&
            <button un-position='absolute'
              un-top='2'
              un-right='2'
              un-border='rounded 1px solid gray-2'
              un-bg='gray-4 hover:blue-5 focus:blue-5'
              un-outline='none'
              un-text='white'
              un-px='2.5'
              un-py='1'
              ref={buttonRef}
              onClick={() => setIsModalOpen(true)}>
              Edit
            </button>
          }
        </div>
        {
          showCaption &&
          <div un-bg='blue-4' un-text='center white' un-border='rounded-b' un-py='1' >
            {altText}
          </div>
        }
      </span>
      <InlineModal nodeKey={nodeKey} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </Suspense>
  );
};