import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { addClassNamesToElement, mergeRegister, removeClassNamesFromElement } from '@lexical/utils';
import { $applyNodeReplacement, $getSelection, $isNodeSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, createCommand, DecoratorNode, DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, LexicalCommand, LexicalNode, NodeKey, SerializedLexicalNode } from 'lexical';
import { useCallback, useEffect } from 'react';

export type SerializedHorizontalRuleNode = SerializedLexicalNode;

export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void> = createCommand('INSERT_HORIZONTAL_RULE_COMMAND');

function HorizontalRuleComponent({ nodeKey }: { nodeKey: NodeKey; }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  const $onDelete = useCallback(
    (event: KeyboardEvent) => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        event.preventDefault();
        editor.update(() => {
          deleteSelection.getNodes().forEach((node) => {
            if ($isHorizontalRuleNode(node)) {
              node.remove();
            }
          });
        });
      }
      return false;
    },
    [editor, isSelected],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const hrElem = editor.getElementByKey(nodeKey);

          if (event.target === hrElem) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
    );
  }, [clearSelection, editor, isSelected, nodeKey, $onDelete, setSelected]);

  useEffect(() => {
    const hrElem = editor.getElementByKey(nodeKey);
    const isSelectedClassName = 'border-t-blue-5';

    if (hrElem !== null) {
      if (isSelected) {
        addClassNamesToElement(hrElem, isSelectedClassName);
      } else {
        removeClassNamesFromElement(hrElem, isSelectedClassName);
      }
    }
  }, [editor, isSelected, nodeKey]);

  return null;
}

export class HorizontalRuleNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'horizontalrule';
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(serializedNode: SerializedHorizontalRuleNode,): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: $convertHorizontalRuleElement,
        priority: 0,
      }),
    };
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: 'horizontalrule',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement('hr') };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('hr');
    element.className = config.theme.hr ?? '';
    return element;
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): false {
    return false;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <HorizontalRuleComponent nodeKey={this.__key} />;
  }
}

const $convertHorizontalRuleElement = (): DOMConversionOutput => ({ node: $createHorizontalRuleNode() });

export const $createHorizontalRuleNode = () => $applyNodeReplacement(new HorizontalRuleNode());

export const $isHorizontalRuleNode = (node: LexicalNode | null | undefined) => node instanceof HorizontalRuleNode;