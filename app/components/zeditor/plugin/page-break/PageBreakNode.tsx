import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { $getSelection, $isNodeSelection, CLICK_COMMAND, COMMAND_PRIORITY_HIGH, COMMAND_PRIORITY_LOW, DecoratorNode, DOMConversionMap, DOMConversionOutput, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, LexicalNode, NodeKey, SerializedLexicalNode } from 'lexical';
import { useCallback, useEffect } from 'react';

export type SerializedPageBreakNode = SerializedLexicalNode;

const PageBreakComponent = ({ nodeKey }: { nodeKey: NodeKey; }) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  const $onDelete = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        editor.update(() => {
          deleteSelection.getNodes().forEach((node) => {
            if ($isPageBreakNode(node)) {
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
          const pbElem = editor.getElementByKey(nodeKey);

          if (event.target === pbElem) {
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

  return <div un-select='none' un-position='relative' un-my='4' un-mx='0' >
    <div un-border={`1 dashed ${isSelected ? 'blue-400' : 'gray-400'}`} />
    <div un-position='absolute' un-top='-1.75' un-left='3' className="i-ph:scissors"></div>
    <div un-position='absolute' un-top='-3.25' un-left='[calc(50%-50px)]' un-border='rounded 2 solid gray-400' un-px='1' un-bg='white' >
      PAGE BREAK
    </div>
  </div>;
};

export class PageBreakNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'page-break';
  }

  static clone(node: PageBreakNode): PageBreakNode {
    return new PageBreakNode(node.__key);
  }

  static importJSON(serializedNode: SerializedPageBreakNode): PageBreakNode {
    return $createPageBreakNode();
  }

  static importDOM(): DOMConversionMap | null {
    return {
      figure: (domNode: HTMLElement) => {
        const type = domNode.getAttribute('type');
        if (type !== this.getType()) {
          return null;
        }

        return {
          conversion: $convertPageBreakElement,
          priority: COMMAND_PRIORITY_HIGH,
        };
      },
    };
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: this.getType(),
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    // const el = document.createElement('figure');
    const el = document.createElement('div');
    el.style.pageBreakAfter = 'always';
    el.setAttribute('type', this.getType());
    return el;
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
    return <PageBreakComponent nodeKey={this.__key} />;
  }
}

function $convertPageBreakElement(): DOMConversionOutput {
  return { node: $createPageBreakNode() };
}

export const $createPageBreakNode = () => new PageBreakNode();

export const $isPageBreakNode = (node: LexicalNode | null | undefined): node is PageBreakNode => node instanceof PageBreakNode;
