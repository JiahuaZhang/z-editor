import { $createLinkNode, $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { useAtomValue } from 'jotai';
import { $getSelection, $isLineBreakNode, $isRangeSelection, BaseSelection, BLUR_COMMAND, CLICK_COMMAND, COMMAND_PRIORITY_CRITICAL, COMMAND_PRIORITY_HIGH, COMMAND_PRIORITY_LOW, KEY_ESCAPE_COMMAND, LexicalEditor, SELECTION_CHANGE_COMMAND } from 'lexical';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { activeEditorAtom } from '../../context/activeEditor';
import { getSelectedNode } from '../../util/getSelectedNode';
import { setFloatingElemPositionForLinkEditor } from '../../util/setFloatingElemPositionForLinkEditor';
import { sanitizeUrl } from '../../util/url';

const FloatingLinkEditor = ({ editor, isLink, setIsLink, anchorElem, isLinkEditMode, setIsLinkEditMode }: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  anchorElem: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [editedLinkUrl, setEditedLinkUrl] = useState('https://');
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(null);

  const $updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);

      if (linkParent) {
        setLinkUrl(linkParent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }
      if (isLinkEditMode) {
        setEditedLinkUrl(linkUrl);
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) return;

    const rootElement = editor.getRootElement();
    if (
      selection !== null
      && nativeSelection !== null
      && rootElement !== null
      && rootElement.contains(nativeSelection.anchorNode)
      && editor.isEditable()
    ) {
      const domRect: DOMRect | undefined = nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
      if (domRect) {
        domRect.y += 40;
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== 'lexical-float-link-input') {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setIsLinkEditMode(false);
      setLinkUrl('');
    }

    return true;
  }, [anchorElem, editor, setIsLinkEditMode, isLinkEditMode, linkUrl]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => { editor.getEditorState().read($updateLinkEditor); };

    window.addEventListener('resize', update);

    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);

      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [anchorElem.parentElement, editor, $updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => { editorState.read($updateLinkEditor); }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, $updateLinkEditor, setIsLink, isLink]);

  useEffect(() => { editor.getEditorState().read($updateLinkEditor); }, [editor, $updateLinkEditor]);

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinkEditMode, isLink]);

  const monitorInputInteraction = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection === null) return;
    if (linkUrl !== '') {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const parent = getSelectedNode(selection).getParent();
          if ($isAutoLinkNode(parent)) {
            const linkNode = $createLinkNode(parent.getURL(), {
              rel: parent.__rel,
              target: parent.__target,
              title: parent.__title,
            });
            parent.replace(linkNode, true);
          }
        }
      });
    }
    setEditedLinkUrl('https://');
    setIsLinkEditMode(false);
  };

  return <div ref={editorRef}
    un-position='absolute'
    un-top='0'
    un-left='0'
    un-bg='#fff'
    un-shadow={`${isLink ? '[0_0_4px_2px_#7dd3fc]' : ''}`}
    un-border='rounded'
    un-transition='opacity'
    un-duration='500'
  >
    {
      isLink && isLinkEditMode && <div un-grid='~ flow-col'
        un-grid-cols='[1fr_max-content_max-content]'
        un-items='center'
        un-gap='2'
        un-border='rounded'
        un-py='2'
        un-px='3'
        un-text='3.75 gray-7'>
        <input
          un-outline='none'
          un-bg='zinc-2'
          un-py='1'
          un-px='2'
          un-text='black'
          un-border='rounded'
          un-w='96'
          ref={inputRef}
          className="lexical-float-link-input"
          value={editedLinkUrl}
          onChange={(event) => setEditedLinkUrl(event.target.value)}
          onKeyDown={monitorInputInteraction}
        />
        <button
          un-hover='text-red-6'
          un-focus='text-red-6'
          un-scale='125'
          className="i-material-symbols-light:cancel"
          tabIndex={0}
          onClick={() => {
            setIsLinkEditMode(false);
            editor.focus();
          }}
        />
        <button
          un-hover='text-blue-5'
          un-focus='text-blue-5'
          un-scale='125'
          className="i-material-symbols-light:check"
          tabIndex={0}
          onClick={handleLinkSubmission}
        />
      </div>
    }

    {
      isLink && !isLinkEditMode && <div
        un-grid='~ flow-col'
        un-grid-cols='[1fr_max-content_max-content]'
        un-items='center'
        un-gap='2'
        un-border='rounded'
        un-py='2'
        un-px='3'
        un-text='3.75 gray-7'
        className="link-view">
        <a un-break='~ words' un-text='blue-6' un-max-w='150' un-overflow-y='auto'
          href={sanitizeUrl(linkUrl)}
          target="_blank"
          rel="noopener noreferrer"
          lexical-editor='float-link'
        >
          {linkUrl}
        </a>
        <button
          un-hover='text-blue-5'
          un-focus='text-blue-5'
          className="i-material-symbols-light:edit"
          un-w='4'
          un-h='4'
          tabIndex={0}
          onClick={() => {
            setEditedLinkUrl(linkUrl);
            setIsLinkEditMode(true);
          }}
        />
        <button un-w='4'
          un-h='4'
          un-hover='text-red-6'
          un-focus='text-red-6'
          className="i-mdi:trash link-trash"
          tabIndex={0}
          onClick={() => { editor.dispatchCommand(TOGGLE_LINK_COMMAND, null); }}
        />
      </div>
    }
  </div>;
};

const useFloatingLinkEditorToolbar = (editor: LexicalEditor, anchorElem: HTMLElement, isLinkEditMode: boolean, setIsLinkEditMode: Dispatch<boolean>) => {
  const activeEditor = useAtomValue(activeEditorAtom);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    const $updateToolbar = () => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const focusNode = getSelectedNode(selection);
      const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
      const focusAutoLinkNode = $findMatchingParent(focusNode, $isAutoLinkNode,);
      if (!(focusLinkNode || focusAutoLinkNode)) {
        setIsLink(false);
        return;
      }

      const badNode = selection
        .getNodes()
        .filter((node) => !$isLineBreakNode(node))
        .find((node) => {
          const linkNode = $findMatchingParent(node, $isLinkNode);
          const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
          return (
            (focusLinkNode && !focusLinkNode.is(linkNode))
            || (linkNode && !linkNode.is(focusLinkNode))
            || (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode))
            || (autoLinkNode && (!autoLinkNode.is(focusAutoLinkNode) || autoLinkNode.getIsUnlinked()))
          );
        });
      setIsLink(!badNode);
    };

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => editorState.read($updateToolbar)),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;

          const node = getSelectedNode(selection);
          const linkNode = $findMatchingParent(node, $isLinkNode);
          if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
            window.open(linkNode.getURL(), '_blank');
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        payload => {
          const relatedTarget = payload.relatedTarget as HTMLElement;

          if (relatedTarget instanceof HTMLAnchorElement && relatedTarget.getAttribute('lexical-editor') === 'float-link') {
            return false;
          }

          if (['i-mdi:trash link-trash', 'i-material-symbols-light:edit'].includes(relatedTarget?.className)) {
            return false;
          }

          setIsLink(false);
          setIsLinkEditMode(false);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      )
    );
  }, [editor]);

  return activeEditor && createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
      isLinkEditMode={isLinkEditMode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem,
  );
};

export const FloatingLinkEditorPlugin = (
  { anchorElem = document.body, isLinkEditMode, setIsLinkEditMode }: { anchorElem?: HTMLElement; isLinkEditMode: boolean, setIsLinkEditMode: Dispatch<boolean>; }
) => {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(editor, anchorElem, isLinkEditMode, setIsLinkEditMode);
};