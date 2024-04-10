import _ from 'lodash';
import { ComplexData, Content, PlainData } from './type';

export class ContentNode {
  content?: Content;
  prev?: ContentNode;
  next?: ContentNode;
  parent?: ContentNode;
  child?: ContentNode;

  constructor(content: Content, map: Map<string, ContentNode>) {
    this.content = content;
    const children = (content?.children ?? []).map(child => new ContentNode(child, map));

    if (children.length > 0) {
      this.child = children[0];
      this.child.parent = this;
    }
    for (let i = 1; i < children.length; i++) {
      children[i - 1].next = children[i];
      children[i].prev = children[i - 1];
    }

    content.id = _.uniqueId('content-');
    map.set(content.id, this);
  }

  prepend(node: ContentNode) {
    if (this.prev) {
      this.prev.next = node;
      node.prev = this.prev;
    }
    this.prev = node;
    node.next = this;

    if (this.parent) {
      this.parent.addChild(node);
    }
  }

  append(node: ContentNode) {
    if (this.next) {
      this.next.prev = node;
      node.next = this.next;
    }

    this.next = node;
    node.prev = this;
  }

  addChild(node: ContentNode) {
    this.child = node;
    node.parent = this;
  }

  removeChild(node: ContentNode) {
    if (this.child === node) {
      this.child = undefined;
      node.parent = undefined;
    }
  }

  remove(map: Map<string, ContentNode>) {
    if (this.prev) {
      this.prev.next = this.next;
    }
    if (this.next) {
      this.next.prev = this.prev;
    }
    if (this.parent) {
      this.parent.child = undefined;
    }
    let node = this.child;
    while (node) {
      node.remove(map);
      node = node.next;
    }
    map.delete(this.content?.id!);
  }

  toContent() {
    let content = this.content;
    const children: Content[] = [];
    let node = this.child;
    while (node) {
      children.push(node.toContent()!);
      node = node.next;
    }
    content!.children = children;
    return content;
  }

  children() {
    const children: ContentNode[] = [];
    let node = this.child;
    while (node) {
      children.push(node);
      node = node.next;
    }
    return children;
  }

  insertLetter(letter: string, offset: number) {
    if (this.content?.data?.text) {
      const data = this.content?.data as PlainData;
      data.text = `${data.text.slice(0, offset)}${letter}${data.text.slice(offset)}`;
    } else {
      const data = this.content?.data as ComplexData;
      data.value = `${data.value!.slice(0, offset)}${letter}${data.value!.slice(offset)}`;
    }
  }
}

export class LinkedList {
  head?: ContentNode;
  tail?: ContentNode;
  map: Map<string, ContentNode> = new Map();

  constructor(contents: Content[]) {
    if (contents.length === 0) {
      return this;
    }

    const nodes = contents.map(content => {
      const node = new ContentNode(content, this.map);
      return node;
    });

    nodes.reduce<ContentNode | null>((prev, node) => {
      prev?.append(node);
      return node;
    }, null);

    this.head = nodes[0];
    if (nodes.length > 1) {
      this.tail = nodes[nodes.length - 1];
    }
  }

  list() {
    const list: Content[] = [];
    let node = this.head;
    while (node) {
      list.push(node.toContent()!);
      node = node.next;
    }
    return list;
  }

  remove(id: string) {
    const node = this.map.get(id);
    if (node) {
      node.remove(this.map);
    }
  }

  toString(space = 2) {
    return JSON.stringify(this.list(), null, space);
  }

  children() {
    const children: ContentNode[] = [];
    let node = this.head;
    while (node) {
      children.push(node);
      node = node.next;
    }
    return children;
  }

  insertLetter(id: string, letter: string, offset: number) {
    this.map.get(id)!.insertLetter(letter, offset);
  }

}