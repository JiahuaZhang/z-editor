import { $isCodeNode, CODE_LANGUAGE_MAP } from '@lexical/code';
import { $isLinkNode } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import { $getSelectionStyleValueForProperty, $isParentElementRTL } from '@lexical/selection';
import { $isTableNode, $isTableSelection } from '@lexical/table';
import { $findMatchingParent, $getNearestNodeOfType, $isEditorIsNestedEditor, mergeRegister } from '@lexical/utils';
import { atom, useSetAtom } from 'jotai';
import { $getNodeByKey, $getSelection, $isElementNode, $isRangeSelection, $isRootOrShadowRoot, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_CRITICAL, ElementFormatType, LexicalNode, NodeKey } from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { getSelectedNode } from '../util/getSelectedNode';
import { useActiveEditorContext } from './activeEditor';

export const MIN_ALLOWED_FONT_SIZE = 8;
export const MAX_ALLOWED_FONT_SIZE = 72;
export const DEFAULT_FONT_SIZE = 15;

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

export const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

const INITIAL_TOOLBAR_STATE = {
  bgColor: '#fff',
  blockType: 'paragraph' as keyof typeof blockTypeToBlockName,
  canRedo: false,
  canUndo: false,
  codeLanguage: '',
  elementFormat: 'left' as ElementFormatType,
  fontColor: '#000',
  fontFamily: 'Arial',
  // Current font size in px
  fontSize: `${DEFAULT_FONT_SIZE}px`,
  // Font size input value - for controlled input
  fontSizeInputValue: `${DEFAULT_FONT_SIZE}`,
  isBold: false,
  isCode: false,
  isImageCaption: false,
  isItalic: false,
  isLink: false,
  isRTL: false,
  isStrikethrough: false,
  isSubscript: false,
  isSuperscript: false,
  isUnderline: false,
  rootType: 'root' as keyof typeof rootTypeToRootName,
};

export const toolbarContextAtom = atom<typeof INITIAL_TOOLBAR_STATE>(INITIAL_TOOLBAR_STATE);

export const useToolbarContext = () => {
  const [editor] = useLexicalComposerContext();
  const activeEditor = useActiveEditorContext();
  const setToolbarContext = useSetAtom(toolbarContextAtom);
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey>('');

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setToolbarContext(prev => ({ ...prev, isRTL: $isParentElementRTL(selection) }));

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      setToolbarContext(prev => ({ ...prev, isLink }));

      const tableNode = $findMatchingParent(node, $isTableNode);
      setToolbarContext(prev => ({ ...prev, rootType: $isTableNode(tableNode) ? 'table' : 'root' }));

      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement();
        const isImageCaption = rootElement?.role === 'lexical-image-caption';
        setToolbarContext(prev => ({ ...prev, isImageCaption }));
      } else {
        setToolbarContext(prev => ({ ...prev, isImageCaption: false }));
      }

      const anchorNode = selection.anchor.getNode();
      let element = anchorNode.getKey() === 'root'
        ? anchorNode
        : $findMatchingParent(anchorNode, (e) => {
          const parent = e.getParent();
          return parent !== null && $isRootOrShadowRoot(parent);
        });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }
      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const blockType = parentList ? parentList.getListType() : element.getListType();
          setToolbarContext(prev => ({ ...prev, blockType }));
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setToolbarContext(prev => ({ ...prev, blockType: type as keyof typeof blockTypeToBlockName, }));
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setToolbarContext(prev => ({ ...prev, codeLanguage: language ? CODE_LANGUAGE_MAP[language] ?? language : '' }));
            return;
          }
        }
      }

      setToolbarContext(prev => ({ ...prev, fontColor: $getSelectionStyleValueForProperty(selection, 'color', '#000') }));
      setToolbarContext(prev => ({ ...prev, bgColor: $getSelectionStyleValueForProperty(selection, 'background-color', '#fff') }));
      setToolbarContext(prev => ({ ...prev, fontFamily: $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial') }));

      let matchingParent: LexicalNode | null;
      if ($isLinkNode(parent)) {
        matchingParent = $findMatchingParent(node, parentNode => $isElementNode(parentNode) && !parentNode.isInline());
      }
      setToolbarContext(prev => ({
        ...prev,
        elementFormat: $isElementNode(matchingParent)
          ? matchingParent.getFormatType() : $isElementNode(node)
            ? node.getFormatType() : parent?.getFormatType() || 'left'
      }));
    }

    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      setToolbarContext(prev => ({ ...prev, isBold: selection.hasFormat('bold') }));
      setToolbarContext(prev => ({ ...prev, isItalic: selection.hasFormat('italic') }));
      setToolbarContext(prev => ({ ...prev, isUnderline: selection.hasFormat('underline') }));
      setToolbarContext(prev => ({ ...prev, isStrikethrough: selection.hasFormat('strikethrough') }));
      setToolbarContext(prev => ({ ...prev, isSubscript: selection.hasFormat('subscript') }));
      setToolbarContext(prev => ({ ...prev, isSuperscript: selection.hasFormat('superscript') }));
      setToolbarContext(prev => ({ ...prev, isCode: selection.hasFormat('code') }));
      setToolbarContext(prev => ({ ...prev, fontSize: $getSelectionStyleValueForProperty(selection, 'font-size', '15px') }));
    }

  }, [editor, activeEditor, setToolbarContext]);

  useEffect(() => activeEditor.getEditorState().read($updateToolbar), [activeEditor, $updateToolbar]);

  useEffect(() => mergeRegister(
    activeEditor.registerUpdateListener(({ editorState }) => editorState.read($updateToolbar)),
    activeEditor.registerCommand(CAN_UNDO_COMMAND, canUndo => {
      setToolbarContext(prev => ({ ...prev, canUndo }));
      return false;
    }, COMMAND_PRIORITY_CRITICAL),
    activeEditor.registerCommand(CAN_REDO_COMMAND, canRedo => {
      setToolbarContext(prev => ({ ...prev, canRedo }));
      return false;
    }, COMMAND_PRIORITY_CRITICAL)
  ), [editor, activeEditor, $updateToolbar]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => activeEditor.update(() => {
      if (selectedElementKey === null) return;

      const node = $getNodeByKey(selectedElementKey);
      if ($isCodeNode(node)) {
        node.setLanguage(value);
      }
    }),
    [activeEditor, selectedElementKey]
  );

  return { onCodeLanguageSelect };
};