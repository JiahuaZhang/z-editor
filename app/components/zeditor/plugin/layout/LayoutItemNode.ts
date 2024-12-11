import { addClassNamesToElement } from '@lexical/utils';
import { DOMConversionMap, DOMConversionOutput, EditorConfig, ElementNode, LexicalNode, SerializedElementNode } from 'lexical';

export type SerializedLayoutItemNode = SerializedElementNode;

const $convertLayoutItemElement = (): DOMConversionOutput | null => ({ node: $createLayoutItemNode() });

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

  static importJSON(): LayoutItemNode {
    return $createLayoutItemNode();
  }

  isShadowRoot(): boolean {
    return true;
  }

  exportJSON(): SerializedLayoutItemNode {
    return {
      ...super.exportJSON(),
      type: 'layout-item',
      version: 1,
    };
  }
}

export const $createLayoutItemNode = () => new LayoutItemNode();

export const $isLayoutItemNode = (node: LexicalNode | null | undefined): node is LayoutItemNode => node instanceof LayoutItemNode;