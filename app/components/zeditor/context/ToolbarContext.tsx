import { $isCodeNode, CODE_LANGUAGE_MAP } from '@lexical/code';
import { $isLinkNode } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import { $getSelectionStyleValueForProperty, $isParentElementRTL } from '@lexical/selection';
import { $isTableNode, $isTableSelection } from '@lexical/table';
import { $findMatchingParent, $getNearestNodeOfType, $isEditorIsNestedEditor, mergeRegister } from '@lexical/utils';
import { $getNodeByKey, $getSelection, $isElementNode, $isRangeSelection, $isRootOrShadowRoot, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_CRITICAL, ElementFormatType, LexicalNode, NodeKey } from 'lexical';
import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getSelectedNode } from '../util/getSelectedNode';
import { useActiveEditorContext } from './ActiveEditor';

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

type EditorToolbarContext = typeof INITIAL_TOOLBAR_STATE;

const context = createContext<{ toolbarContext: EditorToolbarContext, setToolbarContext: Dispatch<SetStateAction<EditorToolbarContext>>, onCodeLanguageSelect: (arg: string) => void; }>({
  toolbarContext: INITIAL_TOOLBAR_STATE,
  setToolbarContext: () => {},
  onCodeLanguageSelect: (arg: string) => {},
});

export const ToolbarContext = ({ children }: { children: JSX.Element; }) => {
  const [editor] = useLexicalComposerContext();
  const activeEditor = useActiveEditorContext();
  const [toolbarContext, setToolbarContext] = useState<EditorToolbarContext>(INITIAL_TOOLBAR_STATE);
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey>('');

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const isRTL = $isParentElementRTL(selection);
      setToolbarContext(prev => ({ ...prev, isRTL }));

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

      const fontColor = $getSelectionStyleValueForProperty(selection, 'color', '#000');
      const bgColor = $getSelectionStyleValueForProperty(selection, 'background-color', '#fff');
      const fontFamily = $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial');
      setToolbarContext(prev => ({ ...prev, fontColor, bgColor, fontFamily }));

      let matchingParent: LexicalNode | null = null;
      if ($isLinkNode(parent)) {
        matchingParent = $findMatchingParent(node, parentNode => $isElementNode(parentNode) && !parentNode.isInline());
      }

      const elementFormat = $isElementNode(matchingParent)
        ? matchingParent.getFormatType()
        : $isElementNode(node) ? node.getFormatType() : parent?.getFormatType() || 'left';
      setToolbarContext(prev => ({ ...prev, elementFormat }));
    }

    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const isBold = selection.hasFormat('bold');
      const isItalic = selection.hasFormat('italic');
      const isUnderline = selection.hasFormat('underline');
      const isStrikethrough = selection.hasFormat('strikethrough');
      const isSubscript = selection.hasFormat('subscript');
      const isSuperscript = selection.hasFormat('superscript');
      const isCode = selection.hasFormat('code');
      const fontSize = $getSelectionStyleValueForProperty(selection, 'font-size', '15px');
      setToolbarContext(prev => ({ ...prev, isBold, isItalic, isUnderline, isStrikethrough, isSubscript, isSuperscript, isCode, fontSize }));
    }

  }, [editor, activeEditor, setToolbarContext]);

  useEffect(() => activeEditor.read($updateToolbar), [activeEditor, $updateToolbar]);

  useEffect(() => mergeRegister(
    activeEditor.registerUpdateListener(() => activeEditor.read($updateToolbar)),
    activeEditor.registerCommand(CAN_UNDO_COMMAND, canUndo => {
      setToolbarContext(prev => ({ ...prev, canUndo }));
      return false;
    }, COMMAND_PRIORITY_CRITICAL),
    activeEditor.registerCommand(CAN_REDO_COMMAND, canRedo => {
      setToolbarContext(prev => ({ ...prev, canRedo }));
      return false;
    }, COMMAND_PRIORITY_CRITICAL)
  ), [activeEditor, $updateToolbar]);

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

  return <context.Provider value={{ toolbarContext, setToolbarContext, onCodeLanguageSelect }}>{children}</context.Provider>;
};

export const useToolbarContext = () => useContext(context);