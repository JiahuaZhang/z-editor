import { EditorConfig, LexicalEditor, NodeKey, SerializedTextNode, Spread, TextNode } from 'lexical';

export type SerializedEmojiNode = Spread<
  { unifiedID: string; },
  SerializedTextNode
>;

const BASE_EMOJI_URI = new URL('@emoji-datasource-facebook/', import.meta.url).href;

export class EmojiNode extends TextNode {
  __unifiedID: string;

  static getType(): string {
    return 'emoji';
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__unifiedID, node.__key);
  }

  constructor(unifiedID: string, key?: NodeKey) {
    const unicodeEmoji = String.fromCodePoint(
      ...unifiedID.split('-').map(v => parseInt(v, 16))
    );
    super(unicodeEmoji, key);

    this.__unifiedID = unifiedID.toLowerCase();
  }

  createDOM(_config: EditorConfig, editor?: LexicalEditor | undefined): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'emoji-node';
    dom.style.backgroundImage = `url('${BASE_EMOJI_URI}/${this.__unifiedID}.png)`;
    dom.innerText = this.__text;
    return dom;
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    return $createEmojiNode(serializedNode.unifiedID);
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      type: 'emoji',
      unifiedID: this.__unifiedID
    };
  }
}

export const $createEmojiNode = (unifiedID: string) => {
  const node = new EmojiNode(unifiedID)
    .setMode('token');

  return node;
};