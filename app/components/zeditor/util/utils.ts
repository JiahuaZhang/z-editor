import { $createCodeNode } from '@lexical/code';
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode, HeadingTagType } from '@lexical/rich-text';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { $isTableSelection } from '@lexical/table';
import { $getNearestBlockElementAncestorOrThrow, CAN_USE_DOM } from '@lexical/utils';
import { $createParagraphNode, $getSelection, $isRangeSelection, $isTextNode, LexicalEditor, LexicalNode } from 'lexical';
import _ from 'lodash';
import { useMemo, useRef } from 'react';
import { DEFAULT_FONT_SIZE, MAX_ALLOWED_FONT_SIZE, MIN_ALLOWED_FONT_SIZE } from '../context/ToolbarContext';

export enum UpdateFontSizeType {
  increment = 1,
  decrement,
}

export const useDebounce = <T extends (...args: never[]) => void>(fn: T, ms: number, maxWait: number) => {
  const funcRef = useRef<T | null>(null);
  funcRef.current = fn;

  return useMemo(
    () => _.debounce(
      (...args: Parameters<T>) => {
        if (funcRef.current) { funcRef.current(...args); }
      },
      ms,
      { maxWait },
    ),
    [ms, maxWait],
  );
};

const getDOMTextNode = (element: Node | null): Text | null => {
  let node = element;

  while (node != null) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    }

    node = node.firstChild;
  }

  return null;
};

const getDOMIndexWithinParent = (node: ChildNode): [ParentNode, number] => {
  const parent = node.parentNode;

  if (parent == null) {
    throw new Error('Should never happen');
  }

  return [parent, Array.from(parent.childNodes).indexOf(node)];
};

export const createDOMRange = (editor: LexicalEditor, anchorNode: LexicalNode, _anchorOffset: number, focusNode: LexicalNode, _focusOffset: number): Range | null => {
  const anchorKey = anchorNode.getKey();
  const focusKey = focusNode.getKey();
  const range = document.createRange();
  let anchorDOM: Node | Text | null = editor.getElementByKey(anchorKey);
  let focusDOM: Node | Text | null = editor.getElementByKey(focusKey);
  let anchorOffset = _anchorOffset;
  let focusOffset = _focusOffset;

  if ($isTextNode(anchorNode)) {
    anchorDOM = getDOMTextNode(anchorDOM);
  }

  if ($isTextNode(focusNode)) {
    focusDOM = getDOMTextNode(focusDOM);
  }

  if (anchorNode === undefined || focusNode === undefined || anchorDOM === null || focusDOM === null) {
    return null;
  }

  if (anchorDOM.nodeName === 'BR') {
    [anchorDOM, anchorOffset] = getDOMIndexWithinParent(anchorDOM as ChildNode);
  }

  if (focusDOM.nodeName === 'BR') {
    [focusDOM, focusOffset] = getDOMIndexWithinParent(focusDOM as ChildNode);
  }

  const firstChild = anchorDOM.firstChild;

  if (
    anchorDOM === focusDOM
    && firstChild != null
    && firstChild.nodeName === 'BR'
    && anchorOffset === 0
    && focusOffset === 0
  ) {
    focusOffset = 1;
  }

  try {
    range.setStart(anchorDOM, anchorOffset);
    range.setEnd(focusDOM, focusOffset);
  } catch (e) {
    return null;
  }

  if (range.collapsed && (anchorOffset !== focusOffset || anchorKey !== focusKey)) {
    // Range is backwards, we need to reverse it
    range.setStart(focusDOM, focusOffset);
    range.setEnd(anchorDOM, anchorOffset);
  }

  return range;
};

export const createRectsFromDOMRange = (editor: LexicalEditor, range: Range) => {
  const rootElement = editor.getRootElement();
  if (rootElement === null) return [];

  const rootRect = rootElement.getBoundingClientRect();
  const computedStyle = getComputedStyle(rootElement);
  const rootPadding = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  const selectionRects = Array.from(range.getClientRects());
  let selectionRectsLength = selectionRects.length;
  //sort rects from top left to bottom right.
  selectionRects.sort((a, b) => {
    const top = a.top - b.top;
    // Some rects match position closely, but not perfectly,
    // so we give a 3px tolerance.
    if (Math.abs(top) <= 3) {
      return a.left - b.left;
    }
    return top;
  });
  let prevRect;
  for (let i = 0; i < selectionRectsLength; i++) {
    const selectionRect = selectionRects[i];
    // Exclude rects that overlap preceding Rects in the sorted list.
    const isOverlappingRect = prevRect
      && prevRect.top <= selectionRect.top
      && prevRect.top + prevRect.height > selectionRect.top
      && prevRect.left + prevRect.width > selectionRect.left;
    // Exclude selections that span the entire element
    const selectionSpansElement = selectionRect.width + rootPadding === rootRect.width;
    if (isOverlappingRect || selectionSpansElement) {
      selectionRects.splice(i--, 1);
      selectionRectsLength--;
      continue;
    }
    prevRect = selectionRect;
  }
  return selectionRects;
};

export const getDOMSelection = (targetWindow: null | Window): null | Selection => !CAN_USE_DOM ? null : (targetWindow || window).getSelection();

export const calculateNextFontSize = (currentFontSize: number, updateType: UpdateFontSizeType | null) => {
  if (!updateType) return currentFontSize;

  let updatedFontSize: number = currentFontSize;
  switch (updateType) {
    case UpdateFontSizeType.decrement:
      switch (true) {
        case currentFontSize > MAX_ALLOWED_FONT_SIZE:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE;
          break;
        case currentFontSize >= 48:
          updatedFontSize -= 12;
          break;
        case currentFontSize >= 24:
          updatedFontSize -= 4;
          break;
        case currentFontSize >= 14:
          updatedFontSize -= 2;
          break;
        case currentFontSize >= 9:
          updatedFontSize -= 1;
          break;
        default:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE;
          break;
      }
      break;

    case UpdateFontSizeType.increment:
      switch (true) {
        case currentFontSize < MIN_ALLOWED_FONT_SIZE:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE;
          break;
        case currentFontSize < 12:
          updatedFontSize += 1;
          break;
        case currentFontSize < 20:
          updatedFontSize += 2;
          break;
        case currentFontSize < 36:
          updatedFontSize += 4;
          break;
        case currentFontSize <= 60:
          updatedFontSize += 12;
          break;
        default:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE;
          break;
      }
      break;

    default:
      break;
  }
  return updatedFontSize;
};

export const updateFontSizeInSelection = (editor: LexicalEditor, newFontSize: string | null, updateType: UpdateFontSizeType | null) => {
  const getNextFontSize = () => `${calculateNextFontSize(DEFAULT_FONT_SIZE, updateType)}px`;

  editor.update(() => {
    if (editor.isEditable()) {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, { 'font-size': newFontSize || getNextFontSize });
      }
    }
  });
};

export const updateFontSize = (editor: LexicalEditor, updateType: UpdateFontSizeType, inputValue: string) => {
  if (inputValue !== '') {
    const nextFontSize = calculateNextFontSize(Number(inputValue), updateType);
    updateFontSizeInSelection(editor, String(nextFontSize) + 'px', null);
  } else {
    updateFontSizeInSelection(editor, null, updateType);
  }
};

export const formatParagraph = (editor: LexicalEditor) => editor.update(() => {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    $setBlocksType(selection, $createParagraphNode);
  }
});

export const formatHeading = (editor: LexicalEditor, blockType: string, headingSize: HeadingTagType) => {
  if (blockType !== headingSize) {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    });
  }
};

export const formatBulletList = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== 'bullet') {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  } else {
    formatParagraph(editor);
  }
};

export const formatCheckList = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== 'check') {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
  } else {
    formatParagraph(editor);
  }
};

export const formatNumberedList = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== 'number') {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  } else {
    formatParagraph(editor);
  }
};

export const formatQuote = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== 'quote') {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, $createQuoteNode);
    });
  }
};

export const formatCode = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== 'code') {
    editor.update(() => {
      let selection = $getSelection();

      if (selection !== null) {
        if (selection.isCollapsed()) {
          $setBlocksType(selection, $createCodeNode);
        } else {
          const textContent = selection.getTextContent();
          const codeNode = $createCodeNode();
          selection.insertNodes([codeNode]);
          selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertRawText(textContent);
          }
        }
      }
    });
  }
};

export const clearFormatting = (editor: LexicalEditor) => editor.update(() => {
  const selection = $getSelection();
  if ($isRangeSelection(selection) || $isTableSelection(selection)) {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const nodes = selection.getNodes();
    const extractedNodes = selection.extract();

    if (anchor.key === focus.key && anchor.offset === focus.offset) {
      return;
    }

    nodes.forEach((node, idx) => {
      // We split the first and last node by the selection
      // So that we don't format unselected text inside those nodes
      if ($isTextNode(node)) {
        // Use a separate variable to ensure TS does not lose the refinement
        let textNode = node;
        if (idx === 0 && anchor.offset !== 0) {
          textNode = textNode.splitText(anchor.offset)[1] || textNode;
        }
        if (idx === nodes.length - 1) {
          textNode = textNode.splitText(focus.offset)[0] || textNode;
        }
        /**
         * If the selected text has one format applied
         * selecting a portion of the text, could
         * clear the format to the wrong portion of the text.
         *
         * The cleared text is based on the length of the selected text.
         */
        // We need this in case the selected text only has one format
        const extractedTextNode = extractedNodes[0];
        if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
          textNode = extractedTextNode;
        }

        if (textNode.__style !== '') {
          textNode.setStyle('');
        }
        if (textNode.__format !== 0) {
          textNode.setFormat(0);
          $getNearestBlockElementAncestorOrThrow(textNode).setFormat('');
        }
        node = textNode;
      } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
        node.replace($createParagraphNode(), true);
      } else if ($isDecoratorBlockNode(node)) {
        node.setFormat('');
      }
    });
  }
});