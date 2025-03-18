import { DecoratorNode, DOMConversionMap, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { lazy } from 'react';

const TimeComponent = lazy(() => import('./TimeComponent').then(module => ({ default: module.TimeComponent })));

export type TimeNodeFormat = 'date' | 'time' | 'both';
export type SerializedTimeNode = Spread<{ date: string, time: string, format: TimeNodeFormat; }, SerializedLexicalNode>;

const $convertTimeNodeElement = (domNode: HTMLSpanElement) => {
  if (domNode.getAttribute('lexical-special') === 'time') {
    const date = domNode.getAttribute('lexical-data-date') || '';
    const time = domNode.getAttribute('lexical-data-time') || '';
    const format = domNode.getAttribute('lexical-data-format') || 'time';
    const node = $createTimeNode(date, time, format as TimeNodeFormat);
    return { node };
  }
  return null;
};

export class TimeNode extends DecoratorNode<JSX.Element> {
  __date: string;
  __time: string;
  __format: TimeNodeFormat;

  constructor(date: string, time: string, __format: TimeNodeFormat = 'time', key?: NodeKey) {
    super(key);
    this.__date = date;
    this.__time = time;
    this.__format = __format;
  }

  static getType() {
    return 'time';
  }

  static clone(node: TimeNode) {
    return new TimeNode(node.__date, node.__time, node.__format, node.getKey());
  }

  static importDOM(): DOMConversionMap {
    return {
      span: (node: Node) => ({
        conversion: $convertTimeNodeElement,
        priority: 0,
      })
    };
  }

  createDOM(config: EditorConfig) {
    const span = document.createElement('span');
    span.className = config.theme.time;
    return span;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('lexical-special', 'time');
    element.setAttribute('lexical-data-time', this.__time);
    element.setAttribute('lexical-data-format', this.__format);
    return { element };
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig) {
    return false;
  }

  decorate() {
    return <TimeComponent date={this.__date} time={this.__time} format={this.__format} nodeKey={this.getKey()} />;
  }

  setDate(date: string) {
    const self = this.getWritable();
    self.__date = date;
  }

  getDate() {
    return this.__date;
  }

  setTime(time: string) {
    const self = this.getWritable();
    self.__time = time;
  }

  getTime() {
    return this.__time;
  }

  setFormat(format: TimeNodeFormat) {
    const self = this.getWritable();
    self.__format = format;
  }

  getFormat() {
    return this.__format;
  }

  static importJSON(serializedNode: SerializedTimeNode) {
    return $createTimeNode(serializedNode.date, serializedNode.time, serializedNode.format);
  }

  exportJSON() {
    return {
      type: 'time',
      time: this.__time,
      format: this.__format,
      version: 1,
    };
  }
}

export const $createTimeNode = (date: string, time: string, format: TimeNodeFormat) => new TimeNode(date, time, format);

export const $isTimeNode = (node: LexicalNode | null | undefined): node is TimeNode => node instanceof TimeNode;