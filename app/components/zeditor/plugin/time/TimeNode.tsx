import { DecoratorNode, DOMConversionMap, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { lazy } from 'react';

const TimeComponent = lazy(() => import('./TimeComponent').then(module => ({ default: module.TimeComponent })));

export type TimeNodeFormat = 'date' | 'time' | 'both';
export const ALL_WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type WeekDay = typeof ALL_WEEK_DAYS[number];
export type Alert = { type: 'daily'; once: boolean; }
  | { type: 'weekly'; weekly: WeekDay[]; }
  | { type: 'monthly'; monthly: 'this' | '1st' | '2nd' | '3rd' | '4th' | '5th' | 'last'; }
  | { type: 'quarterly'; }
  | { type: 'annually'; };

// Backward compatibility type alias
export type Reminder = Alert;

export type SerializedTimeNode = Spread<{
  date: string;
  time: string;
  format: TimeNodeFormat;
  alert: Alert[];
  version: number;
}, SerializedLexicalNode>;

export type SerializedTimeNodeV1 = Spread<{
  date: string;
  time: string;
  format: TimeNodeFormat;
  reminders: Alert[];
  version?: number;
}, SerializedLexicalNode>;

const $convertTimeNodeElement = (domNode: HTMLSpanElement) => {
  if (domNode.getAttribute('lexical-special') === 'time') {
    const date = domNode.getAttribute('lexical-data-date') || '';
    const time = domNode.getAttribute('lexical-data-time') || '';
    const format = domNode.getAttribute('lexical-data-format') || 'time';
    const alert = domNode.getAttribute('lexical-data-alert') || '[]';
    const node = $createTimeNode(date, time, format as TimeNodeFormat, JSON.parse(alert));
    return { node };
  }
  return null;
};

export class TimeNode extends DecoratorNode<JSX.Element> {
  __date: string;
  __time: string;
  __format: TimeNodeFormat;
  __alert: Alert[];

  constructor(date: string, time: string, __format: TimeNodeFormat = 'time', __alert: Alert[] = [], key?: NodeKey) {
    super(key);
    this.__date = date;
    this.__time = time;
    this.__format = __format;
    this.__alert = __alert;
  }

  static getType() {
    return 'time';
  }

  static clone(node: TimeNode) {
    return new TimeNode(node.__date, node.__time, node.__format, node.__alert, node.getKey());
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
    element.setAttribute('lexical-data-date', this.__date);
    element.setAttribute('lexical-data-time', this.__time);
    element.setAttribute('lexical-data-format', this.__format);
    element.setAttribute('lexical-data-alert', JSON.stringify(this.__alert));
    return { element };
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig) {
    return false;
  }

  decorate() {
    return <TimeComponent date={this.__date}
      time={this.__time}
      format={this.__format}
      alert={this.__alert}
      nodeKey={this.getKey()} />;
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

  setAlert(alert: Alert[]) {
    const self = this.getWritable();
    self.__alert = alert;
  }

  getAlert() {
    return this.__alert;
  }

  addAlert(alert: Alert) {
    const self = this.getWritable();

    if (alert.type === 'weekly') {
      const existingAlert = self.__alert.find(r => r.type === 'weekly');
      if (existingAlert) {
        existingAlert.weekly = [...new Set([...alert.weekly, ...existingAlert.weekly])];
        return;
      }
    } else if (alert.type === 'monthly') {
      if (self.__alert.find(r => r.type === 'monthly' && r.monthly === alert.monthly)) return;
    }

    self.__alert.push(alert);
  }

  removeAlert(index: number) {
    const self = this.getWritable();
    self.__alert.splice(index, 1);
  }

  /**
   * @deprecated
   */
  setReminders(reminders: Alert[]) {
    this.setAlert(reminders);
  }

  /**
   * @deprecated
   */
  getReminders() {
    return this.getAlert();
  }

  /**
   * @deprecated
   */
  addReminder(reminder: Alert) {
    this.addAlert(reminder);
  }

  /**
   * @deprecated
   */
  removeReminder(index: number) {
    this.removeAlert(index);
  }

  isAlertValid(alert: Alert) {
    if (this.__format === 'date') return false;

    if (this.__format === 'time') {
      if (alert.type === 'daily' && alert.once) return false;

      return !(alert.type === 'monthly'
        || alert.type === 'quarterly'
        || alert.type === 'annually');
    }

    return true;
  }

  getValidAlert() {
    return this.__alert.filter(r => this.isAlertValid(r));
  }

  /**
   * @deprecated
   */
  isReminderValid(reminder: Alert) {
    return this.isAlertValid(reminder);
  }

  /**
   * @deprecated
   */
  getValidReminders() {
    return this.getValidAlert();
  }

  static importJSON(serializedNode: SerializedLexicalNode) {
    const timeNode = serializedNode as SerializedTimeNode | SerializedTimeNodeV1;

    // Handle backward compatibility for version 1
    if (!timeNode.version || timeNode.version === 1) {
      const v1Node = timeNode as SerializedTimeNodeV1;
      return $createTimeNode(v1Node.date, v1Node.time, v1Node.format, v1Node.reminders || []);
    }

    // Handle version 2 and future versions
    const v2Node = timeNode as SerializedTimeNode;
    return $createTimeNode(v2Node.date, v2Node.time, v2Node.format, v2Node.alert || []);
  }

  exportJSON() {
    return {
      type: 'time',
      date: this.__date,
      time: this.__time,
      format: this.__format,
      alert: this.__alert,
      version: 2,
    };
  }
}

export const $createTimeNode = (date: string, time: string, format: TimeNodeFormat, alert: Alert[] = []) => new TimeNode(date, time, format, alert);

export const $isTimeNode = (node: LexicalNode | null | undefined): node is TimeNode => node instanceof TimeNode;