import { CAN_USE_DOM } from '@lexical/utils';
import { $isTextNode, LexicalEditor, LexicalNode } from 'lexical';
import _ from 'lodash';
import { useMemo, useRef } from 'react';

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