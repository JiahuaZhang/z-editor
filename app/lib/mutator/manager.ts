import _ from 'lodash';
import { RichData } from './type';

export class DataNode {
  data?: RichData;
  prev?: DataNode;
  next?: DataNode;
  parent?: DataNode;
  child?: DataNode;

  constructor(data: RichData, map: Map<string, DataNode>) {
    this.data = data;
    this.data = data;

    const children = data.children?.map(child => new DataNode(child, map));

    if (children && children.length > 0) {
      this.child = children[0];
      this.child.parent = this;

      for (let i = 1; i < children.length; i++) {
        children[i - 1].next = children[i];
        children[i].prev = children[i - 1];
      }
    }

    data.id = _.uniqueId('data-');
    map.set(data.id, this);
  }

  prepend(node: DataNode) {
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

  append(node: DataNode) {
    if (this.next) {
      this.next.prev = node;
      node.next = this.next;
    }

    this.next = node;
    node.prev = this;
  }

  addChild(node: DataNode) {
    this.child = node;
    node.parent = this;
  }

  removeChild(node: DataNode) {
    if (this.child === node) {
      this.child = undefined;
      node.parent = undefined;
    }
  }

  remove(map: Map<string, DataNode>) {
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
    map.delete(this.data?.id!);
  }

  toData() {
    let data = this.data;
    const children: RichData[] = [];
    let node = this.child;
    while (node) {
      children.push(node.toData()!);
      node = node.next;
    }
    data!.children = children;
    return data;
  }

  children() {
    let node = this.child;
    const children: DataNode[] = [];
    while (node) {
      children.push(node);
      node = node.next;
    }
    return children;
  }

}

export class DataManager {
  head?: DataNode;
  tail?: DataNode;
  map = new Map<string, DataNode>();

  constructor(data: RichData[]) {
    if (data.length === 0) {
      return this;
    }

    const nodes = data.map(d => new DataNode(d, this.map));

    nodes.reduce<DataNode | null>((prev, node) => {
      prev?.append(node);
      return node;
    }, null);

    this.head = nodes[0];
    if (nodes.length > 1) {
      this.tail = nodes[nodes.length - 1];
    }
  }

  list() {
    const list: RichData[] = [];
    let node = this.head;
    while (node) {
      list.push(node.toData()!);
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
    const children: DataNode[] = [];
    let node = this.head;
    while (node) {
      children.push(node);
      node = node.next;
    }
    return children;
  }

}