import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { Checkbox, Popover, Radio, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { $getNodeByKey, COMMAND_PRIORITY_LOW, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, KEY_SPACE_COMMAND, NodeKey } from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ALL_WEEK_DAYS, Reminder, TimeNode, TimeNodeFormat, type WeekDay } from './TimeNode';

const weekDayOptios = ALL_WEEK_DAYS.map(value => ({ label: value, value }));

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

const getWeekdayPosition = (date: dayjs.Dayjs) => {
  const year = date.year();
  const month = date.month(); // 0-based (January = 0)
  let dateNumber = date.date() % 7;
  let current = dayjs().year(year).month(month).date(dateNumber > 0 ? dateNumber : 7);

  const occurrences = [];
  while (current.month() === month) {
    occurrences.push(current);
    current = current.add(7, 'days');
  }

  const index = occurrences.findIndex((occurrence) => occurrence.date() === date.date());
  let description = '';
  switch (index) {
    case 0:
      description = '1st';
      break;
    case 1:
      description = '2nd';
      break;
    case 2:
      description = '3rd';
      break;
    case 3:
      description = '4th';
      break;
    case 4:
      description = '5th';
      break;
    default:
      description = 'Error';
  }

  const isLast = index === (occurrences.length - 1);
  return {
    description,
    isLast: isLast,
    weekday: date.format('dddd'), // e.g., "Sunday"
  };
};

const getDateOrdinalPostfix = (index: number) => {
  if (index === 11 || index === 12) {
    return 'th';
  }

  if (index % 10 === 1) {
    return 'st';
  } else if (index % 10 === 2) {
    return 'nd';
  } else if (index % 10 === 3) {
    return 'rd';
  } else {
    return 'th';
  }
};

const getQuarterMonths = (month: number) => {
  const startMonth = month % 3;
  return [startMonth + 1, startMonth + 4, startMonth + 7];
};

const MontlyReminder = ({ date, create, reminders }: { date: string; reminders: Reminder[]; create: (reminder: Reminder) => void; }) => {
  const [position, setPosition] = useState('');
  const d = dayjs(date);
  const info = getWeekdayPosition(d)!;

  return <div un-border='rounded solid 1 blue-5' un-p='1' un-bg='white' un-grid='~' >
    <Radio.Group className='grid grid-flow-col justify-center' value={position} onChange={event => setPosition(event.target.value)} >
      <Radio.Button value='this' disabled={reminders.some(r => r.type === 'monthly' && r.monthly.position === 'this')} >
        {d.format('MM/DD')}
      </Radio.Button>
      <Radio.Button value={info.description} disabled={reminders.some(r => r.type === 'monthly' && r.monthly.position === info.description)} >
        {info.description} {info.weekday}
      </Radio.Button>
      {
        info.isLast
        && <Radio.Button value='last' disabled={reminders.some(r => r.type === 'monthly' && r.monthly.position === 'last')} >
          Last {info.weekday}
        </Radio.Button>
      }
    </Radio.Group>
    {
      position !== '' && <>
        <blockquote un-m='2' un-text='gray-6' un-border='l-4 l-gray-4' un-pl='2'>
          {
            position === 'this' && `Every ${d.date()}${getDateOrdinalPostfix(d.date())} day of every month.`
          }
          {
            position === 'last' && `Last ${info.weekday} of every month.`
          }
          {
            position !== 'this' && position !== 'last' && `Every ${position} ${info.weekday} of every month.`
          }
        </blockquote>
        <button un-border='rounded 2 solid blue-5' un-p='1' un-px='2' un-text='hover:white' un-bg='hover:blue-5'
          un-justify-self='end'
          onClick={() => create({
            type: 'monthly',
            monthly: {
              position: position as any,
              day: info.weekday as WeekDay,
            },
          })}>
          Create
        </button>
      </>
    }
  </div>;
};

export const TimeComponent = ({ date, time, format, reminders = [], nodeKey }: { date: string, time: string, format: TimeNodeFormat; nodeKey?: NodeKey; reminders?: Reminder[]; }) => {
  const [editor] = useLexicalComposerContext();
  const node = editor.getEditorState().read(() => $getNodeByKey(nodeKey ?? '') as TimeNode);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [reminderType, setReminderType] = useState('');
  const [weeklyDays, setWeeklyDays] = useState<WeekDay[]>([]);

  if (!time) {
    time = dayjs().toLocaleString();
  }
  if (!date) {
    date = dayjs().toLocaleString();
  }
  const dateObj = dayjs(date);
  const timeObj = dayjs(time);

  console.log({ reminders });

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
  ), [editor, $onEnter]);

  const content = <div un-border='rounded' un-w='100' un-grid='~' un-gap='2' un-bg='gray-50' >
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
      && <div un-grid='~' un-grid-flow='col' un-justify='center' >
        <Calendar calendarType='gregory'
          value={new Date(date)}
          onChange={(value, event) => editor.update(() => node.setDate(value?.toLocaleString() ?? ''))}
        />
      </div>
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

    {/* list current reminder if any */}
    {/* collapsable reminder (reminder generator) */}
    {
      format !== 'date' && <>
        <h1>Create Reminder:</h1>
        <Radio.Group className='justify-self-center'
          value={reminderType}
          onChange={value => setReminderType(value.target.value)} >
          <Radio.Button value='daily' disabled={reminders.some(reminder => reminder.type === 'daily')} >
            Daily
          </Radio.Button>
          <Radio.Button value='weekly' disabled={reminders.some(r => r.type === 'weekly' && r.weekly.length === 7)}  >
            Weekly
          </Radio.Button>
          <Radio.Button value='monthly' >
            Monthly
          </Radio.Button>
          <Radio.Button value='quarterly' disabled={reminders.some(r => r.type === 'quarterly')} >
            Quarterly
          </Radio.Button>
          <Radio.Button value='annually' disabled={reminders.some(r => r.type === 'annually')} >
            Annually
          </Radio.Button>
        </Radio.Group>

        {
          reminderType === 'daily'
          && <div un-border='rounded solid 1 blue-5' un-p='1' un-bg='white' un-grid='~' >
            <blockquote un-m='2' un-text='gray-6' un-border='l-4 l-gray-4' un-pl='2'>
              Daily @{timeObj.format('h:mm a')}
            </blockquote>
            <button un-border='rounded 2 solid blue-5' un-p='1' un-px='2' un-text='hover:white' un-bg='hover:blue-5' un-justify-self='end'
              onClick={() => {
                editor.update(() => node.addReminder({ type: 'daily' }));
                setReminderType('');
              }}
            >
              Create
            </button>
          </div>
        }

        {
          reminderType === 'weekly'
          && <div un-border='rounded solid 1 blue-5' un-p='1' un-bg='white' un-grid='~' >
            <Checkbox.Group options={weekDayOptios} value={weeklyDays} onChange={setWeeklyDays} />
            {
              weeklyDays.length > 0
              && <>
                <blockquote un-m='2' un-text='gray-6' un-border='l-4 l-gray-4' un-pl='2'>
                  Every {weeklyDays.map(day => day).join(', ')} @{timeObj.format('h:mm a')}
                </blockquote>
                <button un-border='rounded 2 solid blue-5' un-p='1' un-px='2' un-text='hover:white' un-bg='hover:blue-5'
                  un-justify-self='end'
                  onClick={() => {
                    editor.update(() => node.addReminder({ type: 'weekly', weekly: weeklyDays }));
                    setReminderType('');
                  }}
                >
                  Create
                </button>
                <div>
                </div>
              </>
            }
          </div>
        }

        {
          reminderType === 'monthly'
          && <MontlyReminder reminders={reminders} date={date} create={reminders => {
            editor.update(() => node.addReminder(reminders));
            setReminderType('');
          }} />
        }

        {
          reminderType === 'quarterly'
          && <div un-border='rounded solid 1 blue-5' un-p='1' un-bg='white' un-grid='~' >
            <blockquote un-m='2' un-text='gray-6' un-border='l-4 l-gray-4' un-pl='2'>
              {
                `${dateObj.date()}${getDateOrdinalPostfix(dateObj.date())} @${timeObj.format('h:mm a')} on ${getQuarterMonths(dateObj.month()).join(', ')} months`
              }
            </blockquote>
            <button un-border='rounded 2 solid blue-5' un-p='1' un-px='2' un-text='hover:white' un-bg='hover:blue-5' un-justify-self='end'
              onClick={() => {
                editor.update(() => node.addReminder({ type: 'quarterly' }));
                setReminderType('');
              }}
            >
              Create
            </button>
          </div>
        }

        {
          reminderType === 'annually'
          && <div un-border='rounded solid 1 blue-5' un-p='1' un-bg='white' un-grid='~' >
            <blockquote un-m='2' un-text='gray-6' un-border='l-4 l-gray-4' un-pl='2'>
              {
                `${dateObj.format('MM/DD')} @${timeObj.format('h:mm a')} every year.`
              }
            </blockquote>
            <button un-border='rounded 2 solid blue-5' un-p='1' un-px='2' un-text='hover:white' un-bg='hover:blue-5' un-justify-self='end'
              onClick={() => {
                editor.update(() => node.addReminder({ type: 'annually' }));
                setReminderType('');
              }}
            >
              Create
            </button>
          </div>
        }
      </>
    }
  </div>;

  return <Popover content={content} trigger='click' open={isOpen}
    onOpenChange={status => {
      setIsOpen(status);
      if (status) {
        setTimeout(() => setSelected(true), 0);
      }
    }} >
    <span un-bg='zinc-1' un-px='2' un-py='1' un-border={`rounded solid blue-4 ${isSelected && '2'}`} un-cursor='pointer' un-mx='1'>
      {getReadableTime(format, date, time)}
    </span>
  </Popover>;
};