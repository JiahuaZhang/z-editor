import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import {
  $getTableColumnIndexFromTableCellNode,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { $getNearestNodeFromDOMNode, $getRoot, NodeKey } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebounce } from '../../util/utils';

const BUTTON_WIDTH_PX = 20;

const getMouseInfo = ({ target }: MouseEvent) => {
  if (target && target instanceof HTMLElement) {
    const tableDOMNode = target.closest<HTMLElement>('td.zeditor-table-cell, th.zeditor-table-cell');
    const isOutside = !(
      tableDOMNode
      || target.closest<HTMLElement>('button.zeditor-table-add-row')
      || target.closest<HTMLElement>('button.zeditor-table-add-column')
      || target.closest<HTMLElement>('div.zeditor-tabel-cell-resizer')
    );
    return { isOutside, tableDOMNode };
  } else {
    return { isOutside: true, tableDOMNode: null };
  }
};

const TableHoverActionsContainer = ({ anchorElem }: { anchorElem: HTMLElement; }) => {
  const [editor] = useLexicalComposerContext();
  const [isShownRow, setShownRow] = useState<boolean>(false);
  const [isShownColumn, setShownColumn] = useState<boolean>(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] = useState<boolean>(false);
  const [rowPosition, setRowPosition] = useState({});
  const [columnPosition, setColumnPosition] = useState({});
  const codeSetRef = useRef<Set<NodeKey>>(new Set());
  const tableDOMNodeRef = useRef<HTMLElement | null>(null);

  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { isOutside, tableDOMNode } = getMouseInfo(event);
      if (isOutside) {
        setShownRow(false);
        setShownColumn(false);
        return;
      }

      if (!tableDOMNode) return;

      tableDOMNodeRef.current = tableDOMNode;
      let hoveredRowNode: TableCellNode | null = null;
      let hoveredColumnNode: TableCellNode | null = null;
      let tableDOMElement: HTMLElement | null = null;

      editor.update(() => {
        const maybeTableCell = $getNearestNodeFromDOMNode(tableDOMNode);

        if ($isTableCellNode(maybeTableCell)) {
          const table = $findMatchingParent(maybeTableCell, $isTableNode);
          if (!$isTableNode(table)) { return; }

          tableDOMElement = editor.getElementByKey(table?.getKey());
          if (tableDOMElement) {
            const rowCount = table.getChildrenSize();
            const colCount = ((table as TableNode).getChildAtIndex(0) as TableRowNode)?.getChildrenSize();

            const rowIndex = $getTableRowIndexFromTableCellNode(maybeTableCell);
            const colIndex = $getTableColumnIndexFromTableCellNode(maybeTableCell);

            if (rowIndex === rowCount - 1) {
              hoveredRowNode = maybeTableCell;
            }

            if (colIndex === colCount - 1) {
              hoveredColumnNode = maybeTableCell;
            }
          }
        }
      });

      if (tableDOMElement) {
        const {
          width: tableElemWidth,
          y: tableElemY,
          x: tableElemX,
          right: tableElemRight,
          bottom: tableElemBottom,
          height: tableElemHeight,
        } = (tableDOMElement as HTMLTableElement).getBoundingClientRect();

        const { y: editorElemY } = anchorElem.getBoundingClientRect();

        if (hoveredRowNode) {
          setShownRow(true);
          setRowPosition({
            height: BUTTON_WIDTH_PX,
            left: tableElemX,
            top: tableElemBottom - editorElemY,
            width: tableElemWidth,
          });
        } else {
          setShownRow(false);
        }

        if (hoveredColumnNode) {
          setShownColumn(true);
          setColumnPosition({
            height: tableElemHeight,
            left: tableElemRight,
            top: tableElemY - editorElemY,
            width: BUTTON_WIDTH_PX,
          });
        } else {
          setShownColumn(false);
        }
      }
    },
    50,
    250,
  );

  useEffect(() => {
    if (!shouldListenMouseMove) { return; }

    document.addEventListener('mousemove', debouncedOnMouseMove);

    return () => {
      setShownRow(false);
      setShownColumn(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener('mousemove', debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);

  useEffect(() => {
    return mergeRegister(
      editor.registerMutationListener(TableNode, (mutations) => {
        editor.getEditorState().read(() => {
          for (const [key, type] of mutations) {
            switch (type) {
              case 'created':
                codeSetRef.current.add(key);
                setShouldListenMouseMove(codeSetRef.current.size > 0);
                break;

              case 'destroyed':
                codeSetRef.current.delete(key);
                setShouldListenMouseMove(codeSetRef.current.size > 0);
                break;

              default:
                break;
            }
          }
        });
      }),
    );
  }, [editor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      for (const child of $getRoot().getChildren()) {
        if ($isTableNode(child)) {
          codeSetRef.current.add(child.getKey());
        }
      }
      setShouldListenMouseMove(codeSetRef.current.size > 0);
    });
  }, [editor]);

  const insert = (type: 'row' | 'column') => {
    editor.update(() => {
      if (!tableDOMNodeRef.current) return;

      const maybeTableNode = $getNearestNodeFromDOMNode(tableDOMNodeRef.current);
      maybeTableNode?.selectEnd();
      if (type === 'row') {
        $insertTableRow__EXPERIMENTAL();
      } else {
        $insertTableColumn__EXPERIMENTAL();
      }
      setShownRow(false);
      setShownColumn(false);
    });
  };

  console.log({ isShownRow, isShownColumn });

  return (
    <>
      {isShownRow && (
        <button un-z='5'
          className='zeditor-table-add-row'
          un-position='absolute'
          un-border='~ 2 solid blue-3 rounded-b'
          un-bg='zinc-1 hover:blue-2'
          un-grid='~'
          un-content='center'
          style={{ ...rowPosition }}
          onClick={() => insert('row')}
        >
          +
        </button>
      )}
      {isShownColumn && (
        <button un-z='5'
          className='zeditor-table-add-column'
          un-position='absolute'
          un-border='~ 2 solid blue-3 rounded-b'
          un-bg='zinc-1 hover:blue-2'
          un-grid='~'
          un-content='center'
          style={{ ...columnPosition }}
          onClick={() => insert('column')}
        >
          +
        </button>
      )}
    </>
  );
};

export const TableHoverActionsPlugin = ({ anchorElem }: { anchorElem?: HTMLElement; }) => {
  const isEditable = useLexicalEditable();
  anchorElem = anchorElem ?? document.body;
  return isEditable && createPortal(<TableHoverActionsContainer anchorElem={anchorElem} />, anchorElem);
};
