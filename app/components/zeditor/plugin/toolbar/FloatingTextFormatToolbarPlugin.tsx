import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { useSetAtom } from 'jotai';
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingAnchor } from '../../context/FloatingAnchor';
import { getDOMRangeRect } from '../../util/getDOMRangeRect';
import { getSelectedNode } from '../../util/getSelectedNode';
import { setFloatingElemPosition } from '../../util/setFloatingElemPosition';
import { INSERT_INLINE_COMMAND } from '../comment/CommentPlugin';
import { isLinkEditModeAtom } from '../link/FloatingLinkEditorPlugin';

const TextFormatFloatingToolbar = ({ editor, anchorElem, isLink, isBold, isItalic, isUnderline, isUppercase, isLowercase, isCapitalize, isCode, isStrikethrough, isSubscript, isSuperscript, setIsLinkEditMode }: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isUppercase: boolean;
  isLowercase: boolean;
  isCapitalize: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}) => {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  const insertComment = () => editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);

  const mouseMoveListener = (e: MouseEvent) => {
    if (
      popupCharStylesEditorRef?.current
      && (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'none') {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = 'none';
        }
      }
    }
  };

  const mouseUpListener = (e: MouseEvent) => {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'auto') {
        popupCharStylesEditorRef.current.style.pointerEvents = 'auto';
      }
    }
  };

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', mouseUpListener);

      return () => {
        document.removeEventListener('mousemove', mouseMoveListener);
        document.removeEventListener('mouseup', mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = getDOMSelection(editor._window);

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null
      && nativeSelection !== null
      && !nativeSelection.isCollapsed
      && rootElement !== null
      && rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem, isLink, 8);
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => editor.getEditorState().read($updateTextFormatFloatingToolbar);

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
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read($updateTextFormatFloatingToolbar);
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => editorState.read($updateTextFormatFloatingToolbar)),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateTextFormatFloatingToolbar]);

  return (
    <div ref={popupCharStylesEditorRef}
      un-position='absolute' un-top='0' un-flex='~' un-z='5' un-bg='white'
      un-border='rounded-xl' un-shadow='lg gray-4'
    >
      {editor.isEditable() && (
        <>
          <button un-flex='~' un-bg={`${isBold && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            title="Bold"
            aria-label="Format text as bold"
          >
            <span className="i-tabler:bold" un-text={`2xl ${isBold ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isItalic && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
            title="Italic"
            aria-label="Format text as italics"
          >
            <span className="i-ci:italic" un-text={`2xl ${isItalic ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isUnderline && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
            title="Underline"
            aria-label="Format text to underlined"
          >
            <span className="i-ci:underline" un-text={`2xl ${isUnderline ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isStrikethrough && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor!.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
            title="Strikethrough"
            aria-label="Format text with a strikethrough">
            <span className="i-mdi:format-strikethrough" un-text={`2xl ${isStrikethrough ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isSubscript && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
            title="Subscript"
            aria-label="Format Subscript">
            <span className="i-mdi:format-subscript" un-text={`2xl ${isSubscript ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isSuperscript && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
            title="Superscript"
            aria-label="Format Superscript">
            <span className="i-mdi:format-superscript" un-text={`2xl ${isSuperscript ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isUppercase && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase')}
            title="Uppercase"
            aria-label="Format text to uppercase">
            <span className="i-mdi:format-uppercase" un-text={`2xl ${isUppercase ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isLowercase && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase')}
            title="Lowercase"
            aria-label="Format text to lowercase">
            <span className="i-mdi:format-lowercase" un-text={`2xl ${isLowercase ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isCapitalize && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize')}
            title="Capitalize"
            aria-label="Format text to capitalize">
            <span className="i-mdi:format-text" un-text={`2xl ${isCapitalize ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isCode && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
            title="Code"
            aria-label="Insert code block">
            <span className="i-mdi:code" un-text={`2xl ${isCode ? 'white' : 'gray-6'}`} />
          </button>
          <button un-flex='~' un-bg={`${isLink && 'zinc-4'} hover:blue-2`} un-p='1' un-border='rounded'
            onClick={insertLink}
            title="Insert link"
            aria-label="Insert link">
            <span className="i-mdi:link" un-text={`2xl ${isLink ? 'white' : 'gray-6'}`} />
          </button>
        </>
      )}
      <button un-flex='~' un-bg={`hover:blue-2`} un-p='1' un-border='rounded'
        onClick={insertComment}
        title="Insert comment"
        aria-label="Insert comment">
        <span className="i-material-symbols-light:comment-outline" un-text='2xl' />
      </button>
    </div>
  );
};

export const FloatingTextFormatToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const anchor = useFloatingAnchor();
  const setIsLinkEditMode = useSetAtom(isLinkEditModeAtom);
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [isLowercase, setIsLowercase] = useState(false);
  const [isCapitalize, setIsCapitalize] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isShow, setIsShow] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = getDOMSelection(editor._window);
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null
        && (!$isRangeSelection(selection)
          || rootElement === null
          || !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsUppercase(selection.hasFormat('uppercase'));
      setIsLowercase(selection.hasFormat('lowercase'));
      setIsCapitalize(selection.hasFormat('capitalize'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode())
        && selection.getTextContent() !== ''
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '');
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener('selectionchange', updatePopup);
    return () => document.removeEventListener('selectionchange', updatePopup);
  }, [updatePopup]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isText) setIsShow(true);
    };

    window.addEventListener('contextmenu', handleClick);
    return () => window.removeEventListener('contextmenu', handleClick);
  }, [editor, isText]);

  useEffect(() => {
    if (!isText) setIsShow(false);
  }, [isText]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(updatePopup),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!isShow) return null;

  return anchor && createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchor}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isUppercase={isUppercase}
      isLowercase={isLowercase}
      isCapitalize={isCapitalize}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchor,
  );
};