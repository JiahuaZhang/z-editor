import { DecoratorNode, DOMConversionMap, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { format } from 'prettier';
import { lazy } from 'react';

const TimeComponent = lazy(() => import('./TimeComponent').then(module => ({ default: module.TimeComponent })));

export type TimeNodeFormat = 'date' | 'time' | 'both';
export const ALL_WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type WeekDay = typeof ALL_WEEK_DAYS[number];
export type Reminder = { type: 'daily'; once: boolean; }
  | { type: 'weekly'; weekly: WeekDay[]; }
  | { type: 'monthly'; monthly: 'this' | '1st' | '2nd' | '3rd' | '4th' | '5th' | 'last'; }
  | { type: 'quarterly'; }
  | { type: 'annually'; };

export type SerializedTimeNode = Spread<{ date: string, time: string, format: TimeNodeFormat; reminder: Reminder[]; }, SerializedLexicalNode>;

const $convertTimeNodeElement = (domNode: HTMLSpanElement) => {
  if (domNode.getAttribute('lexical-special') === 'time') {
    const date = domNode.getAttribute('lexical-data-date') || '';
    const time = domNode.getAttribute('lexical-data-time') || '';
    const format = domNode.getAttribute('lexical-data-format') || 'time';
    const reminders = domNode.getAttribute('lexical-data-reminder') || '[]';
    const node = $createTimeNode(date, time, format as TimeNodeFormat, JSON.parse(reminders));
    return { node };
  }
  return null;
};

export class TimeNode extends DecoratorNode<JSX.Element> {
  __date: string;
  __time: string;
  __format: TimeNodeFormat;
  __reminders: Reminder[];

  constructor(date: string, time: string, __format: TimeNodeFormat = 'time', __reminders: Reminder[] = [], key?: NodeKey) {
    super(key);
    this.__date = date;
    this.__time = time;
    this.__format = __format;
    this.__reminders = __reminders;
  }

  static getType() {
    return 'time';
  }

  static clone(node: TimeNode) {
    return new TimeNode(node.__date, node.__time, node.__format, node.__reminders, node.getKey());
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
    element.setAttribute('lexical-data-reminder', JSON.stringify(this.__reminders));
    return { element };
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig) {
    return false;
  }

  decorate() {
    return <TimeComponent date={this.__date}
      time={this.__time}
      format={this.__format}
      reminders={this.__reminders}
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

  setReminders(reminders: Reminder[]) {
    const self = this.getWritable();
    self.__reminders = reminders;
  }

  getReminders() {
    return this.__reminders;
  }

  addReminder(reminder: Reminder) {
    const self = this.getWritable();

    if (reminder.type === 'weekly') {
      const existingReminder = self.__reminders.find(r => r.type === 'weekly');
      if (existingReminder) {
        existingReminder.weekly = [...new Set([...reminder.weekly, ...existingReminder.weekly])];
        return;
      }
    } else if (reminder.type === 'monthly') {
      if (self.__reminders.find(r => r.type === 'monthly' && r.monthly === reminder.monthly)) return;
    }

    self.__reminders.push(reminder);
  }

  removeReminder(index: number) {
    const self = this.getWritable();
    self.__reminders.splice(index, 1);
  }

  isReminderValid(reminder: Reminder) {
    if (this.__format === 'date') return false;

    if (this.__format === 'time') {
      if (reminder.type === 'daily' && reminder.once) return false;

      return !(reminder.type === 'monthly'
        || reminder.type === 'quarterly'
        || reminder.type === 'annually');
    }

    return true;
  }

  static importJSON(serializedNode: SerializedTimeNode) {
    return $createTimeNode(serializedNode.date, serializedNode.time, serializedNode.format, serializedNode.reminder);
  }

  exportJSON() {
    return {
      type: 'time',
      date: this.__date,
      time: this.__time,
      format: this.__format,
      reminders: this.__reminders,
      version: 1,
    };
  }
}

export const $createTimeNode = (date: string, time: string, format: TimeNodeFormat, reminder: Reminder[] = []) => new TimeNode(date, time, format, reminder);

export const $isTimeNode = (node: LexicalNode | null | undefined): node is TimeNode => node instanceof TimeNode;