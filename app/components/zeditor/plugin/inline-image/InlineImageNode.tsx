import { $applyNodeReplacement, DecoratorNode, DOMConversionMap, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { lazy, Suspense } from 'react';

const InlineImageComponent = lazy(() => import('./InlineImageComponent').then(module => ({ default: module.InlineImageComponent })));

export type Position = 'left' | 'right' | 'full' | undefined;

export type InlineImagePayload = {
  altText: string;
  height?: number;
  width?: number;
  key?: NodeKey;
  showCaption?: boolean;
  src: string;
  position?: Position;
};

export type UpdateInlineImagePayload = {
  altText?: string;
  showCaption?: boolean;
  position?: Position;
};

const $convertInlineImageElement = (domNode: Node) => {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createInlineImageNode({ altText, height, src, width });
    return { node };
  }
  return null;
};

export type SerializedInlineImageNode = Spread<
  {
    altText: string;
    height?: number;
    showCaption: boolean;
    src: string;
    width?: number;
    position?: Position;
  },
  SerializedLexicalNode
>;

export class InlineImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number;
  __height: number;
  __showCaption: boolean;
  __position: Position;

  static getType(): string {
    return 'inline-image';
  }

  static clone(node: InlineImageNode): InlineImageNode {
    return new InlineImageNode(
      node.__src,
      node.__altText,
      node.__position,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedInlineImageNode): InlineImageNode {
    const { altText, height, width, src, showCaption, position } = serializedNode;
    return $createInlineImageNode({ altText, height, position, showCaption, src, width, });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: $convertInlineImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    position: Position,
    width?: number,
    height?: number,
    showCaption?: boolean,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width ?? 0;
    this.__height = height ?? 0;
    this.__showCaption = showCaption || false;
    this.__position = position;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
    return { element };
  }

  exportJSON(): SerializedInlineImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height ?? 0,
      position: this.__position,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: 'inline-image',
      version: 1,
      width: this.__width ?? 0,
    };
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  getShowCaption(): boolean {
    return this.__showCaption;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  getPosition(): Position {
    return this.__position;
  }

  setPosition(position: Position): void {
    const writable = this.getWritable();
    writable.__position = position;
  }

  update(payload: UpdateInlineImagePayload): void {
    const writable = this.getWritable();
    const { altText, showCaption, position } = payload;
    if (altText !== undefined) {
      writable.__altText = altText;
    }
    if (showCaption !== undefined) {
      writable.__showCaption = showCaption;
    }
    if (position !== undefined) {
      writable.__position = position;
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    let positionClass = '';
    if (this.__position === 'left') {
      positionClass = `float-left w-1/2`;
    } else if (this.__position === 'right') {
      positionClass = `float-right w-1/2`;
    }
    span.className = `${config.theme.inlineImage} ${positionClass}`;
    return span;
  }

  updateDOM(prevNode: InlineImageNode, dom: HTMLElement, config: EditorConfig): false {
    const position = this.__position;
    if (position !== prevNode.__position) {
      let positionClass = '';
      if (this.__position === 'left') {
        positionClass = `float-left w-1/2`;
      } else if (this.__position === 'right') {
        positionClass = `float-right w-1/2`;
      }
      dom.className = `${config.theme.inlineImage} ${positionClass}`;
    }
    return false;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <InlineImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          nodeKey={this.getKey()}
          showCaption={this.__showCaption}
          position={this.__position}
        />
      </Suspense>
    );
  }
}

export const $createInlineImageNode = ({ altText, position, height, src, width, showCaption, key,
}: InlineImagePayload): InlineImageNode =>
  $applyNodeReplacement(new InlineImageNode(src, altText, position, width, height, showCaption, key),);


export const $isInlineImageNode = (node: LexicalNode | null | undefined): node is InlineImageNode => node instanceof InlineImageNode;
