import { addClassNamesToElement } from '@lexical/utils';
import { $isParagraphNode, DOMConversionMap, DOMConversionOutput, EditorConfig, ElementNode, LexicalNode, SerializedElementNode } from 'lexical';

export type SerializedLayoutItemNode = SerializedElementNode;

const $convertLayoutItemElement = (): DOMConversionOutput | null => ({ node: $createLayoutItemNode() });

export const $isEmptyLayoutItemNode = (node: LexicalNode): boolean => {
  if (!$isLayoutItemNode(node) || node.getChildrenSize() !== 1) {
    return false;
  }
  const firstChild = node.getFirstChild();
  return $isParagraphNode(firstChild) && firstChild.isEmpty();
};

export class LayoutItemNode extends ElementNode {
  static getType(): string {
    return 'layout-item';
  }

  static clone(node: LayoutItemNode): LayoutItemNode {
    return new LayoutItemNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    dom.setAttribute('data-lexical-layout-item', 'true');
    if (typeof config.theme.layoutItem === 'string') {
      addClassNamesToElement(dom, config.theme.layoutItem);
    }
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  collapseAtStart(): boolean {
    const parent = this.getParentOrThrow();
    if (this.is(parent.getFirstChild()) && parent.getChildren().every($isEmptyLayoutItemNode)) {
      parent.remove();
      return true;
    }
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-layout-item')) {
          return null;
        }
        return {
          conversion: $convertLayoutItemElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(serializedNode: SerializedLayoutItemNode): LayoutItemNode {
    return $createLayoutItemNode().updateFromJSON(serializedNode);
  }

  isShadowRoot(): boolean {
    return true;
  }

  exportJSON(): SerializedLayoutItemNode {
    return {
      ...super.exportJSON(),
    };
  }
}

export const $createLayoutItemNode = () => new LayoutItemNode();

export const $isLayoutItemNode = (node: LexicalNode | null | undefined): node is LayoutItemNode => node instanceof LayoutItemNode;