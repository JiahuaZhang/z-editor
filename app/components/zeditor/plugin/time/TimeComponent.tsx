import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { Popover, Radio, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { $getNodeByKey, COMMAND_PRIORITY_LOW, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, KEY_SPACE_COMMAND, NodeKey } from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TimeNode, TimeNodeFormat } from './TimeNode';

export const getReadableTime = (format: TimeNodeFormat, date: string, time: string) => {
  if (format === 'time') {
    const timeObj = dayjs(time);
    return timeObj.format('h:mm a');
  }

  const dateObj = dayjs(date);
  const today = dayjs();
  if (format === 'date') {
    if (dateObj.isSame(today, 'day')) {
      return 'Today';
    } else if (dateObj.isSame(today.add(1, 'day'), 'day')) {
      return 'Tomorrow';
    } else if (dateObj.isSame(today.subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    } else if (dateObj.isBefore(today.add(1, 'week'), 'day') && dateObj.isAfter(today, 'day')) {
      return `Next ${dateObj.format('dddd')}`;
    } else if (dateObj.isAfter(today.subtract(1, 'week'), 'day') && dateObj.isBefore(today, 'day')) {
      return `Last ${dateObj.format('dddd')}`;
    } else if (dateObj.isSame(today.add(1, 'month'), 'day')) {
      return 'Next month';
    } else if (dateObj.isSame(today.subtract(1, 'month'), 'day')) {
      return 'Last month';
    }
    return dateObj.format('YYYY/MM/DD');
  }

  const timeObj = dayjs(time);
  if (format === 'both') {
    if (dateObj.isSame(today, 'day')) {
      return `Today @${timeObj.format('h:mm a')}`;
    } else if (dateObj.isSame(today.add(1, 'day'), 'day')) {
      return `Tomorrow @${timeObj.format('h:mm a')}`;
    } else if (dateObj.isSame(today.subtract(1, 'day'), 'day')) {
      return `Yesterday @${timeObj.format('h:mm a')}`;
    } else {
      return `${dateObj.format('YYYY/MM/DD')} @${timeObj.format('h:mm a')}`;
    }
  }
};

export const TimeComponent = ({ date, time, format, nodeKey }: { date: string, time: string, format: TimeNodeFormat; nodeKey?: NodeKey; }) => {
  const [editor] = useLexicalComposerContext();
  const node = editor.getEditorState().read(() => $getNodeByKey(nodeKey ?? '') as TimeNode);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey ?? '');
  const [isOpen, setIsOpen] = useState(false);

  if (!time) {
    time = dayjs().toLocaleString();
  }
  if (!date) {
    date = dayjs().toLocaleString();
  }

  useEffect(() => {
    if (!isSelected) {
      setIsOpen(false);
    }
  }, [isSelected, setIsOpen]);

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected) {
        setIsOpen(prev => !prev);
        return true;
      }
      return false;
    },
    [isSelected, setIsOpen],
  );

  const $onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected) {
        setIsOpen(false);
        return true;
      }
      return false;
    },
    [isSelected, setIsOpen],
  );

  useEffect(() => mergeRegister(
    editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
    editor.registerCommand(KEY_SPACE_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
    editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW),
  ), [$onEnter]);

  return <Popover content={<div un-border='rounded 2 solid gray-1' un-w='[354px]' un-grid='~' un-gap='2' un-bg='gray-50' un-py='2'>
    <Radio.Group value={format} className='justify-self-center' >
      <Radio.Button value='date' checked={format === 'date'}
        onChange={() => editor.update(() => node.setFormat('date'))}
      >Date</Radio.Button>
      <Radio.Button value='time' checked={format === 'time'}
        onChange={() => editor.update(() => node.setFormat('time'))}
      >Time</Radio.Button>
      <Radio.Button value='both' checked={format === 'both'}
        onChange={() => editor.update(() => node.setFormat('both'))}
      >Date & Time</Radio.Button>
    </Radio.Group>

    {
      format !== 'time'
      && <Calendar calendarType='gregory'
        value={new Date(date)}
        onChange={(value, event) => editor.update(() => node.setDate(value?.toLocaleString() ?? ''))}
      />
    }

    {
      format !== 'date'
      && <TimePicker use12Hours popupClassName='[&_a]:text-blue-6 [&_button]:bg-blue-6'
        className='justify-self-center'
        value={time !== '' ? dayjs(time) : dayjs()}
        onChange={value => {
          if (value) {
            editor.update(() => node.setTime(value.toLocaleString()));
          }
        }}
      />
    }
  </div>} trigger='click' open={isOpen} onOpenChange={status => {
    setIsOpen(status);
    if (status) {
      setTimeout(() => setSelected(true), 0);
    }
  }} >
    <span un-bg='zinc-1' un-p='2' un-py='1' un-border={`rounded solid blue-4 ${isSelected && '2'}`} un-cursor='pointer'
    >
      {getReadableTime(format, date, time)}
    </span>
  </Popover>;
};