import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import {
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $isTableCellNode,
  $isTableSelection,
  getTableElement,
  getTableObserverFromTableElement,
  TableCellNode,
  TableObserver
} from '@lexical/table';
import { mergeRegister } from '@lexical/utils';
import { useAtomValue } from 'jotai';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  getDOMSelection,
  SELECTION_CHANGE_COMMAND
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { floatingAnchorAtom } from '../../context/floatingAnchor';
import { invariant } from '../../util/invariant';
import { TableActionMenu } from './TableActionMenu';

const TableCellActionMenuContainer = ({ anchorElem, cellMerge, }: {
  anchorElem: HTMLElement;
  cellMerge: boolean;
}) => {
  const [editor] = useLexicalComposerContext();
  const menuButtonRef = useRef<HTMLDivElement | null>(null);
  const menuRootRef = useRef<HTMLButtonElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(null);

  const $moveMenu = useCallback(() => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = getDOMSelection(editor._window);
    const activeElement = document.activeElement;
    const disable = () => {
      if (menu) {
        // menu.classList.remove('pointer-events-auto', 'opacity-100');
        menu.classList.add('pointer-events-none', 'opacity-0');
      }
      setTableMenuCellNode(null);
    }

    if (selection == null || menu == null) {
      return disable();
    }

    const rootElement = editor.getRootElement();
    let tableObserver: TableObserver | null = null;
    let tableCellParentNodeDOM: HTMLElement | null = null;

    if (
      $isRangeSelection(selection)
      && rootElement !== null
      && nativeSelection !== null
      && rootElement.contains(nativeSelection.anchorNode)
    ) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());

      if (tableCellNodeFromSelection == null) {
        return disable();
      }

      tableCellParentNodeDOM = editor.getElementByKey(tableCellNodeFromSelection.getKey());

      if (tableCellParentNodeDOM == null || !tableCellNodeFromSelection.isAttached()) {
        return disable();
      }

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNodeFromSelection);
      const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));

      invariant(tableElement !== null, 'TableActionMenu: Expected to find tableElement in DOM');

      tableObserver = getTableObserverFromTableElement(tableElement);
      setTableMenuCellNode(tableCellNodeFromSelection);
    } else if ($isTableSelection(selection)) {
      const anchorNode = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
      invariant($isTableCellNode(anchorNode), 'TableSelection anchorNode must be a TableCellNode');
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(anchorNode);
      const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));
      invariant(tableElement !== null, 'TableActionMenu: Expected to find tableElement in DOM');
      tableObserver = getTableObserverFromTableElement(tableElement);
      tableCellParentNodeDOM = editor.getElementByKey(anchorNode.getKey());
    } else if (!activeElement) {
      return disable();
    }
    if (tableObserver === null || tableCellParentNodeDOM === null) {
      return disable();
    }
    const enabled = !tableObserver || !tableObserver.isSelecting;
    menu.classList.toggle('pointer-events-none', !enabled,);
    menu.classList.toggle('opacity-0', !enabled,);
    if (enabled) {
      const tableCellRect = tableCellParentNodeDOM.getBoundingClientRect();
      const anchorRect = anchorElem.getBoundingClientRect();
      const top = tableCellRect.top - anchorRect.top + (tableCellRect.height - menuRootRef.current?.clientHeight!) / 2;
      const left = tableCellRect.right - anchorRect.left - menuRootRef?.current?.clientWidth! - 4;
      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    // We call the $moveMenu callback every time the selection changes,
    // once up front, and once after each mouseUp
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
    const callback = () => {
      timeoutId = undefined;
      editor.getEditorState().read($moveMenu);
    };
    const delayedCallback = () => {
      if (timeoutId === undefined) {
        timeoutId = setTimeout(callback, 0);
      }
      return false;
    };
    return mergeRegister(
      editor.registerUpdateListener(delayedCallback),
      editor.registerCommand(SELECTION_CHANGE_COMMAND, delayedCallback, COMMAND_PRIORITY_CRITICAL),
      editor.registerRootListener((rootElement, prevRootElement) => {
        if (prevRootElement) {
          prevRootElement.removeEventListener('mouseup', delayedCallback);
        }
        if (rootElement) {
          rootElement.addEventListener('mouseup', delayedCallback);
          delayedCallback();
        }
      }),
      () => clearTimeout(timeoutId),
    );
  });

  const prevTableCellDOM = useRef(tableCellNode);

  useEffect(() => {
    if (prevTableCellDOM.current?.getKey() !== tableCellNode?.getKey() && prevTableCellDOM.current !== tableCellNode) {
      setIsMenuOpen(false);
    }

    prevTableCellDOM.current = tableCellNode;
  }, [prevTableCellDOM, tableCellNode]);

  return (
    <div un-z='5' un-position='absolute' ref={menuButtonRef}>
      {tableCellNode != null && (
        <>
          <button un-border='rounded-lg' un-bg='gray-2' un-w='6' un-h='5' un-flex='~' un-items='center' un-justify='center'
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            ref={menuRootRef}>
            <span className="i-mdi:chevron-down" un-text='xl' />
          </button>
          {isMenuOpen && (
            <TableActionMenu
              contextRef={menuRootRef}
              setIsMenuOpen={setIsMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              tableCellNode={tableCellNode}
              cellMerge={cellMerge}
            />
          )}
        </>
      )}
    </div>
  );
}

export const TableActionMenuPlugin = ({ cellMerge = true }: { cellMerge?: boolean; }) => {
  const isEditable = useLexicalEditable();
  const anchor = useAtomValue(floatingAnchorAtom);

  return isEditable && anchor && createPortal(<TableCellActionMenuContainer anchorElem={anchor} cellMerge={cellMerge} />, anchor);
}
