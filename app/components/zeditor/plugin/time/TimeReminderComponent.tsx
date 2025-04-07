import { Checkbox, Collapse, Radio } from 'antd';
import dayjs from 'dayjs';
import { LexicalEditor } from 'lexical';
import { useState } from 'react';
import { ALL_WEEK_DAYS, Reminder, TimeNode, TimeNodeFormat, WeekDay } from './TimeNode';

const weekDayOptios = ALL_WEEK_DAYS.map(value => ({ label: value, value }));

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

const getQuarterMonths = (date: dayjs.Dayjs) => {
  const start = date.month() % 3;
  return [start, start + 3, start + 6, start + 9]
    .sort((a, b) => a - b)
    .map(index => `${dayjs().month(index).format('M')}/${date.date()}`)
    .join(', ');
};

const MontlyReminder = ({ date, create, reminders }: { date: dayjs.Dayjs; reminders: Reminder[]; create: (reminder: Reminder) => void; }) => {
  const [position, setPosition] = useState('');
  const info = getWeekdayPosition(date)!;

  return <div un-border='rounded solid 1 blue-5' un-p='1' un-bg='white' un-grid='~' >
    <Radio.Group className='grid grid-flow-col justify-center' value={position} onChange={event => setPosition(event.target.value)} >
      <Radio.Button value='this' disabled={reminders.some(r => r.type === 'monthly' && r.monthly === 'this')} >
        {date.format('MM/DD')}
      </Radio.Button>
      <Radio.Button value={info.description} disabled={reminders.some(r => r.type === 'monthly' && r.monthly === info.description)} >
        {info.description} {info.weekday}
      </Radio.Button>
      {
        info.isLast
        && <Radio.Button value='last' disabled={reminders.some(r => r.type === 'monthly' && r.monthly === 'last')} >
          Last {info.weekday}
        </Radio.Button>
      }
    </Radio.Group>
    {
      position !== '' && <>
        <blockquote un-m='2' un-text='gray-6' un-border='l-4 l-gray-4' un-pl='2'>
          {
            position === 'this' && `Every ${date.date()}${getDateOrdinalPostfix(date.date())} day of each month.`
          }
          {
            position === 'last' && `Last ${info.weekday} of each month.`
          }
          {
            position !== 'this' && position !== 'last' && `Every ${position} ${info.weekday} of each month.`
          }
        </blockquote>
        <button un-border='rounded 2 solid blue-5' un-p='1' un-px='2' un-text='hover:white' un-bg='hover:blue-5'
          un-justify-self='end'
          onClick={() => create({
            type: 'monthly',
            monthly: position as any,
          })}>
          Create
        </button>
      </>
    }
  </div>;
};

const ReminderItem = ({ reminder, remove, date, time, node }: { reminder: Reminder, remove?: () => void; date: dayjs.Dayjs, time: dayjs.Dayjs; node: TimeNode; }) => {
  let text = '';
  if (reminder.type === 'daily') {
    if (reminder.once) {
      text = `${date.format('MM/DD/YYYY')} @ ${time.format('h:mm a')} once.`;
    } else {
      text = `Daily @${time.format('h:mm a')}`;
    }
  } else if (reminder.type === 'weekly') {
    text = `Every ${reminder.weekly.map(day => day).join(', ')} @${time.format('h:mm a')}`;
  } else if (reminder.type === 'monthly') {
    if (reminder.monthly === 'this') {
      text = `Every ${date.date()}${getDateOrdinalPostfix(date.date())} of each month @${time.format('h:mm a')}`;
    } else if (reminder.monthly === 'last') {
      text = `Last ${date.format('dddd')} of each month @${time.format('h:mm a')}`;
    } else {
      text = `Every ${reminder.monthly} ${date.format('dddd')} of each month @${time.format('h:mm a')}`;
    }
  } else if (reminder.type === 'quarterly') {
    text = `@${time.format('h:mm a')} on ${getQuarterMonths(date)}`;
  } else if (reminder.type === 'annually') {
    text = `${date.format('MM/DD')} of each year @${time.format('h:mm a')}`;
  }

  return <div un-flex='~' un-bg='white even:blue-2' un-justify='between' un-text={`${!node.isReminderValid(reminder) && 'gray-5'}`} un-line={`${!node.isReminderValid(reminder) && 'through'}`} >
    {text}
    <button un-bg='hover:red-6' un-border='rounded' un-flex='~' un-items='center' onClick={remove} >
      <span className="i-material-symbols-light:delete" un-text='2xl red-6 hover:white' un-bg='hover:white' />
    </button>
  </div>;
};

export const TimeReminderComponent = ({ reminders, format, editor, date, time, node }: { reminders: Reminder[]; format: TimeNodeFormat; editor: LexicalEditor; date: dayjs.Dayjs, time: dayjs.Dayjs; node: TimeNode; }) => {
  const [reminderType, setReminderType] = useState('');
  const [weeklyDays, setWeeklyDays] = useState<WeekDay[]>([]);
  const [dailyOption, setDailyOption] = useState('');

  if (format === 'date') return <></>;

  return <div un-grid='~' un-gap='2' >
    {
      reminders.length > 0 && <Collapse items={[{
        key: 'list',
        label: <h1 un-grid='~' un-grid-flow='col' un-justify='center' un-items='center' un-gap='1' un-text='orange-7'>
          <span className="i-mdi:clock" un-text='lg' /> Show Reminders
        </h1>,
        children: <section>
          {
            reminders.map((reminder, index) => <ReminderItem key={index}
              reminder={reminder}
              remove={() => editor.update(() => node.removeReminder(index))}
              date={date}
              time={time}
              node={node}
            />)
          }
        </section>
      }]} />
    }

    <Collapse className='[&>div>div]:last:[&>div]:(!p-0)'
      items={[{
        key: 'create',
        label: <h1 un-grid='~' un-grid-flow='col' un-justify='center' un-items='center' un-gap='1' un-text='blue-6'> <span className="i-material-symbols-light:new-window" /> Create Reminder:</h1>,
        children: <>
          <Radio.Group className='justify-self-center grid grid-flow-col my-1'
            value={reminderType}
            onChange={value => setReminderType(value.target.value)} >
            <Radio.Button value='daily'>
              Daily
            </Radio.Button>
            <Radio.Button value='weekly' disabled={reminders.some(r => r.type === 'weekly' && r.weekly.length === 7)}  >
              Weekly
            </Radio.Button>
            {
              format === 'both' &&
              <>
                <Radio.Button value='monthly' >
                  Monthly
                </Radio.Button>
                <Radio.Button value='quarterly' disabled={reminders.some(r => r.type === 'quarterly')} >
                  Quarterly
                </Radio.Button>
                <Radio.Button value='annually' disabled={reminders.some(r => r.type === 'annually')} >
                  Annually
                </Radio.Button>
              </>
            }
          </Radio.Group>

          {
            reminderType === 'daily'
            && <div un-border='rounded solid 1 blue-5' un-p='1' un-bg='white' un-grid='~' >
              <Radio.Group className='grid grid-flow-col justify-center' value={dailyOption} >
                {
                  format === 'both' && <Radio.Button value='once' checked={dailyOption === 'once'}
                    disabled={reminders.some(r => r.type === 'daily' && r.once)}
                    onChange={() => setDailyOption('once')}>
                    Once
                  </Radio.Button>
                }
                <Radio.Button value='repeat' checked={dailyOption === 'repeat'}
                  disabled={reminders.some(r => r.type === 'daily' && !r.once)}
                  onChange={() => setDailyOption('repeat')}>
                  Repeat
                </Radio.Button>
              </Radio.Group>
              {
                dailyOption !== '' && <>
                  <blockquote un-m='2' un-text='gray-6' un-border='l-4 l-gray-4' un-pl='2'>
                    {
                      dailyOption === 'once' && `Remind ${date.format('DD/MM/YYYY')} @${time.format('h:mm a')} once.`
                    }
                    {
                      dailyOption === 'repeat' && `@${time.format('h:mm a')} every day.`
                    }
                  </blockquote>
                  <button un-border='rounded 2 solid blue-5' un-p='1' un-px='2' un-text='hover:white' un-bg='hover:blue-5' un-justify-self='end'
                    onClick={() => {
                      editor.update(() => node.addReminder({ type: 'daily', once: dailyOption === 'once' }));
                      setDailyOption('');
                      setReminderType('');
                    }}
                  >
                    Create
                  </button>
                </>
              }
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
                    Every {weeklyDays.map(day => day).join(', ')} @{time.format('h:mm a')}
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
                {`@${time.format('h:mm a')} on ${getQuarterMonths(date)}`}
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
                  `${date.format('MM/DD')} @${time.format('h:mm a')} every year.`
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
      }]}
    />
  </div>;
};