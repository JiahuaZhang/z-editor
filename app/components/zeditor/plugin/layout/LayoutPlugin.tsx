import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { $createParagraphNode, $getNodeByKey, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_LOW, createCommand, ElementNode, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_LEFT_COMMAND, KEY_ARROW_RIGHT_COMMAND, KEY_ARROW_UP_COMMAND, KEY_TAB_COMMAND, LexicalCommand, LexicalNode, NodeKey } from 'lexical';
import { useEffect } from 'react';
import { getSelectedNode } from '../../util/getSelectedNode';
import { $createLayoutContainerNode, $isLayoutContainerNode, LayoutContainerNode } from './LayoutContainerNode';
import { $createLayoutItemNode, $isLayoutItemNode, LayoutItemNode } from './LayoutItemNode';

export const INSERT_LAYOUT_COMMAND: LexicalCommand<string> = createCommand<string>();

export const UPDATE_LAYOUT_COMMAND: LexicalCommand<{ template: string; nodeKey: NodeKey; }> = createCommand<{ template: string; nodeKey: NodeKey; }>();

export const LayoutPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([LayoutContainerNode, LayoutItemNode]))
      throw new Error('LayoutPlugin: LayoutContainerNode, or LayoutItemNode not registered on editor');

    const $onEscape = (before: boolean) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

      const node = getSelectedNode(selection);
      if ((!before && node.getTextContentSize() === selection.anchor.offset) || (before && selection.anchor.offset === 0)) {
        const container = $findMatchingParent(selection.anchor.getNode(), $isLayoutContainerNode);

        if ($isLayoutContainerNode(container)) {
          const parent = container.getParent<ElementNode>();
          const child = parent && (before ? parent.getFirstChild<LexicalNode>() : parent?.getLastChild<LexicalNode>());
          const descendant = before ? container.getFirstDescendant<LexicalNode>()?.getKey() : container.getLastDescendant<LexicalNode>()?.getKey();
          if (parent !== null && child === container && selection.anchor.key === descendant) {
            if (before) {
              container.insertBefore($createParagraphNode());
            } else {
              container.insertAfter($createParagraphNode());
            }
          }
        }
      }
      return false;
    };

    const $fillLayoutItemIfEmpty = (node: LayoutItemNode) => {
      if (node.isEmpty()) {
        node.append($createParagraphNode());
      }
    };

    const $removeIsolatedLayoutItem = (node: LayoutItemNode): boolean => {
      const parent = node.getParent<ElementNode>();
      if (!$isLayoutContainerNode(parent)) {
        const children = node.getChildren<LexicalNode>();
        for (const child of children) {
          node.insertBefore(child);
        }
        node.remove();
        return true;
      }
      return false;
    };

    return mergeRegister(
      // When layout is the last child pressing down/right arrow will insert paragraph
      // below it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if trailing paragraph is accidentally deleted
      editor.registerCommand(KEY_ARROW_DOWN_COMMAND, () => $onEscape(false), COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, () => $onEscape(false), COMMAND_PRIORITY_LOW),
      // When layout is the first child pressing up/left arrow will insert paragraph
      // above it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if leading paragraph is accidentally deleted
      editor.registerCommand(KEY_ARROW_UP_COMMAND, () => $onEscape(true), COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ARROW_LEFT_COMMAND, () => $onEscape(true), COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        INSERT_LAYOUT_COMMAND,
        (template) => {
          editor.update(() => {
            const container = $createLayoutContainerNode(template);
            const itemsCount = getItemsCountFromTemplate(template);

            for (let i = 0; i < itemsCount; i++) {
              container.append($createLayoutItemNode().append($createParagraphNode()));
            }

            $insertNodeToNearestRoot(container);
            container.selectStart();
          });

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        UPDATE_LAYOUT_COMMAND,
        ({ template, nodeKey }) => {
          editor.update(() => {
            const container = $getNodeByKey<LexicalNode>(nodeKey);

            if (!$isLayoutContainerNode(container)) {
              return;
            }

            const itemsCount = getItemsCountFromTemplate(template);
            const prevItemsCount = getItemsCountFromTemplate(container.getTemplateColumns());

            // Add or remove extra columns if new template does not match existing one
            if (itemsCount > prevItemsCount) {
              for (let i = prevItemsCount; i < itemsCount; i++) {
                container.append($createLayoutItemNode().append($createParagraphNode()));
              }
            } else if (itemsCount < prevItemsCount) {
              for (let i = prevItemsCount - 1; i >= itemsCount; i--) {
                const layoutItem = container.getChildAtIndex<LexicalNode>(i);

                if ($isLayoutItemNode(layoutItem)) {
                  layoutItem.remove();
                }
              }
            }

            container.setTemplateColumns(template);
          });

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(KEY_TAB_COMMAND, (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const node = getSelectedNode(selection);
        const layoutItem = $findMatchingParent(node, $isLayoutItemNode);
        if (layoutItem === null) return false;

        event.preventDefault();
        if (event.shiftKey) {
          const prevSibling = layoutItem.getPreviousSibling();
          if (prevSibling !== null) {
            prevSibling.selectStart();
          } else {
            layoutItem.getParent<LayoutContainerNode>()?.getPreviousSibling()?.selectEnd();
          }
        } else {
          const nextSibling = layoutItem.getNextSibling();
          if (nextSibling !== null) {
            nextSibling.selectStart();
          } else {
            layoutItem.getParent<LayoutContainerNode>()?.getNextSibling()?.selectStart();
          }
        }
        return true;
      }, COMMAND_PRIORITY_LOW),
      editor.registerNodeTransform(LayoutItemNode, (node) => {
        // Structure enforcing transformers for each node type. In case nesting structure is not
        // "Container > Item" it'll unwrap nodes and convert it back
        // to regular content.
        const isRemoved = $removeIsolatedLayoutItem(node);

        if (!isRemoved) {
          // Layout item should always have a child. this function will listen
          // for any empty layout item and fill it with a paragraph node
          $fillLayoutItemIfEmpty(node);
        }
      }),
      editor.registerNodeTransform(LayoutContainerNode, (node) => {
        const children = node.getChildren<LexicalNode>();
        if (!children.every($isLayoutItemNode)) {
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      }),
    );
  }, [editor]);

  return null;
};

const getItemsCountFromTemplate = (template: string) => template.trim().split(/\s+/).length;
