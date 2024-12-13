import { addClassNamesToElement } from '@lexical/utils';
import { $applyNodeReplacement, EditorConfig, LexicalNode, NodeKey, SerializedTextNode, TextNode } from 'lexical';

export class SpecialTextNode extends TextNode {
  static getType(): string {
    return 'specialText';
  }

  static clone(node: SpecialTextNode): SpecialTextNode {
    return new SpecialTextNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    addClassNamesToElement(dom, config.theme.specialText);
    dom.textContent = this.getTextContent();
    return dom;
  }

  updateDOM(prevNode: TextNode, dom: HTMLElement, config: EditorConfig): boolean {
    // if (prevNode.__text.startsWith('[') && prevNode.__text.endsWith(']')) {
    //   const strippedText = this.__text.substring(1, this.__text.length - 1); // Strip brackets again
    //   dom.textContent = strippedText; // Update the text content
    // }

    addClassNamesToElement(dom, config.theme.specialText);

    return false;
  }

  static importJSON(serializedNode: SerializedTextNode): SpecialTextNode {
    const node = $createSpecialTextNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setStyle(serializedNode.style);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'specialText',
    };
  }

  isTextEntity(): true {
    return true;
  }
  canInsertTextAfter(): boolean {
    return false; // Prevents appending text to this node
  }
}

/**
 * Creates a SpecialTextNode with the given text.
 * @param text - Text content for the SpecialTextNode.
 * @returns A new SpecialTextNode instance.
 */
export const $createSpecialTextNode = (text = '') => $applyNodeReplacement(new SpecialTextNode(text));

/**
 * Checks if a node is a SpecialTextNode.
 * @param node - Node to check.
 * @returns True if the node is a SpecialTextNode.
 */
export const $isSpecialTextNode = (node: LexicalNode | null | undefined): node is SpecialTextNode => node instanceof SpecialTextNode;