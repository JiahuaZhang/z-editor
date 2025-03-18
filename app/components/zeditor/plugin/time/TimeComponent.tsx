import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Form, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { $getNodeByKey, NodeKey } from 'lexical';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TimeNode, TimeNodeFormat } from './TimeNode';

export const TimeComponent = ({ date, time, format, nodeKey }: { date: string, time: string, format: TimeNodeFormat; nodeKey?: NodeKey; }) => {
  const [editor] = useLexicalComposerContext();
  const node = editor.getEditorState().read(() => $getNodeByKey(nodeKey ?? '') as TimeNode);

  return <span>
    <Form un-w='90' un-border='2 solid blue-4' >
      <Form.Item label='Format' >
        <Select defaultValue={format}
          onChange={value => editor.update(() => node.setFormat(value))}
          options={[
            { value: 'date', label: 'Date' },
            { value: 'time', label: 'Time' },
            { value: 'both', label: 'Date & Time' },
          ]}
        />
      </Form.Item>

      <h1>Calendar: </h1>
      <Calendar calendarType='gregory'
        value={new Date(date)}
        onChange={(value, event) => editor.update(() => node.setDate(value?.toLocaleString() ?? ''))}
      />

      <Form.Item label='time' >
        <TimePicker use12Hours popupClassName='[&_a]:text-blue-6 [&_button]:bg-blue-6'
          value={dayjs(time)}
          onChange={value => {
            if (value) {
              editor.update(() => node.setTime(value.toLocaleString()));
            }
          }}
        />
      </Form.Item>
    </Form>

    {/* for date, or date & time, show yesterday, tomorrow, next week, next month, last week, last month, last year, next year (more readable) */}
    {time}
  </span>;
};