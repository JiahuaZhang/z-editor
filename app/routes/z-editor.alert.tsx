import { PostgrestError } from '@supabase/supabase-js';
import { Badge, Tooltip } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { LoaderFunction, useLoaderData } from "react-router";
import { Reminder, SerializedTimeNode, TimeNodeFormat, WeekDay } from '~/components/zeditor/plugin/time/TimeNode';
import { createSupabaseServerClient } from '~/util/supabase.server';

type LoaderData = {
  data: {
    id: any;
    reminder: SerializedTimeNode[];
  }[] | null;
  error: PostgrestError | null;
};

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
  const { supabase } = createSupabaseServerClient(request);
  const { data, error } = await supabase.from('editor_documents')
    .select('id, reminder')
    .gt('reminder->0', 'null');
  return { data, error };
};

export const _StupidUno = <div un-bg="red-4" />;

export const ReminderAlert = ({ reminder, date, time, format }: { reminder: Reminder; date: Dayjs; time: Dayjs; format: TimeNodeFormat; }) => {
  // todo, performance trick?
  // make now under this context, and it would shared among all alerts
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);

    return () => clearInterval(interval);
  }, []);

  switch (reminder.type) {
    case 'daily':
      if (reminder.once) {
        const reminderDateTime = date.hour(time.hour()).minute(time.minute()).second(time.second());
        const isExpired = reminderDateTime.isBefore(now);

        return (
          <div un-flex="~" un-items='center' un-gap="2" >
            {
              isExpired
                ? <span className="i-mdi:bell-alert" un-text="sm orange-2" />
                : <span className="i-mdi:bell-alert" un-text="sm orange-6" un-animate='ping' />
            }
            <span className="i-mdi:calendar-today" un-text={`sm ${isExpired ? 'gray-4' : 'emerald-5'}`} />
            <span un-text={`sm ${isExpired ? 'gray-4' : 'white'}`} un-font="medium" un-bg={`${!isExpired && 'emerald-5'}`} un-py='1' un-px={`${!isExpired && '2'}`} un-border='rounded' >
              {reminderDateTime.format('MMM DD, YYYY hh:mm:ss A')}
            </span>
          </div>
        );
      } else {
        const todayReminderTime = now.hour(time.hour()).minute(time.minute()).second(time.second());
        const isExpired = todayReminderTime.isBefore(now);

        return (
          <div un-flex="~" un-items='center' un-gap="2">
            {isExpired
              ? <span className="i-mdi:bell-ring" un-text="sm orange-2" />
              : <span className="i-mdi:bell-ring" un-text="sm orange-6" un-animate='ping' />
            }
            <span className="i-mdi:calendar-today" un-text={`sm ${isExpired ? 'gray-4' : 'emerald-5'}`} />
            <span un-text={`sm ${isExpired ? 'gray-4' : 'white'}`} un-font="medium" un-bg={`${!isExpired && 'emerald-5'}`} un-py='1' un-px={`${!isExpired && '2'}`} un-border='rounded' >Daily</span>
          </div>
        );
      }

    case 'weekly': {
      const currentDayName = now.format('dddd');
      const isToday = reminder.weekly.includes(currentDayName as WeekDay);
      const todayReminderTime = now.hour(time.hour()).minute(time.minute()).second(time.second());
      const isExpired = isToday && todayReminderTime.isBefore(now);

      return (
        <div un-flex="~ col" un-gap="2">
          <div un-flex="~ items-center" un-gap="2">
            {isToday && <span className={`i-mdi:bell-alert ${!isExpired && 'animate-ping'}`} un-text={`sm ${isExpired ? "gray-4" : "orange-6"}`} />}
            <span className="i-mdi:calendar-week" un-text={`sm ${isExpired ? "gray-4" : "blue-6"}`} />
            {reminder.weekly.map(day => {
              const isCurrentDay = day === currentDayName;
              return (
                <span key={day}
                  un-px="2"
                  un-py="1"
                  un-bg={isExpired ? "gray-2" : (isCurrentDay ? "blue-5" : "blue-1")}
                  un-text={`xs ${isExpired ? "gray-5" : (isCurrentDay ? "white" : "blue-8")}`}
                  un-border="rounded"
                  un-font={isExpired ? "medium" : (isCurrentDay ? "bold" : "medium")}
                  un-shadow={isExpired ? "none" : (isCurrentDay ? "md" : "none")}
                >
                  {day === 'Thursday' ? 'Thurs' : day.slice(0, 3)}
                </span>
              );
            })}
            {/* <span
              un-text={`sm ${isExpired ? "gray-4" : (isToday ? "white" : "blue-7")}`}
              un-font={isExpired ? "medium" : (isToday ? "bold" : "medium")}
              un-bg={isExpired ? "gray-2" : (isToday ? "blue-5" : "transparent")}
              un-px={isExpired || isToday ? "2" : "0"}
              un-py={isExpired || isToday ? "1" : "0"}
              un-border={isExpired || isToday ? "rounded" : "none"}
              un-shadow={isExpired ? "none" : (isToday ? "sm" : "none")}
            >
              {time.format('hh:mm:ss A')}
            </span> */}
          </div>
        </div>
      );
    }

    case 'monthly': {
      let alertDate = date;
      let isDateAvailable = true;

      if (reminder.monthly === 'last') {
        const lastDayOfMonth = now.endOf('month');
        const daysFromEnd = (lastDayOfMonth.day() - now.day() + 7) % 7;
        alertDate = lastDayOfMonth.subtract(daysFromEnd, 'day');
      } else if (reminder.monthly !== 'this') {
        const weekNumber = parseInt(reminder.monthly.replace(/\D/g, ''));
        const firstDayOfMonth = now.startOf('month');
        const firstOccurrence = firstDayOfMonth.day(alertDate.day());

        if (firstOccurrence.isBefore(firstDayOfMonth)) {
          alertDate = firstOccurrence.add(weekNumber, 'week');
        } else {
          alertDate = firstOccurrence.add(weekNumber - 1, 'week');
        }
        isDateAvailable = alertDate.month() === now.month();
      }

      const isToday = isDateAvailable && alertDate.isSame(now, 'day');
      const todayReminderTime = now.hour(time.hour()).minute(time.minute()).second(time.second());
      const isExpired = isToday && todayReminderTime.isBefore(now);

      return (
        <div un-flex="~ items-center" un-gap="2">
          {isToday && <span className={`i-mdi:bell-alert ${!isExpired && 'animate-ping'}`} un-text={`sm ${isExpired ? "gray-4" : "orange-6"}`} />}
          <span className="i-mdi:calendar-month" un-text={`sm ${isExpired ? "gray-4" : "purple-6"}`} />
          <div un-flex="~ items-center" >
            {isDateAvailable && (
              <span
                un-px="2"
                un-py="1"
                un-bg={isExpired ? "gray-2" : "purple-5"}
                un-text={`xs ${isExpired ? "gray-5" : "white"}`}
                un-border="rounded"
                un-font="medium"
              >
                {alertDate.format('MMM DD')}
              </span>
            )}
            {reminder.monthly !== 'this' && (
              <span
                un-px="2"
                un-py="1"
                un-bg={isExpired ? "gray-1" : (isDateAvailable ? "white" : "gray-1")}
                un-text={`xs ${isExpired ? "gray-4" : (isDateAvailable ? "purple-7" : "gray-4")}`}
                un-border="rounded"
                un-font="medium"
              >
                {reminder.monthly === 'last' ? 'last' : reminder.monthly} {date.format('ddd')}
              </span>
            )}
          </div>
        </div>
      );
    };

    case 'quarterly': {
      const quarterlyDates = [0, 1, 2, 3].map(index => {
        let quarterDate = dayjs().year(now.year()).month((date.month() + (index * 3)) % 12);
        let isAdjusted = false;
        const originalDay = date.date();
        const daysInMonth = quarterDate.daysInMonth();

        if (originalDay > daysInMonth) {
          quarterDate = quarterDate.endOf('month');
          isAdjusted = true;
          console.log('adjust for this one', quarterDate.toString());
        } else {
          quarterDate = quarterDate.date(originalDay);
        }

        return {
          date: quarterDate,
          isAdjusted,
          isToday: quarterDate.isSame(now, 'day')
        };
      });

      quarterlyDates.sort((a, b) => a.date.month() - b.date.month());

      const hasToday = quarterlyDates.some(q => q.isToday);
      const todayReminderTime = now.hour(time.hour()).minute(time.minute()).second(time.second());
      const isExpired = hasToday && todayReminderTime.isBefore(now);

      return (
        <div un-flex="~ items-center" un-gap="2">
          {hasToday && <span className={`i-mdi:bell-alert ${!isExpired && 'animate-ping'}`} un-text={`sm ${isExpired ? "gray-4" : "orange-6"}`} />}
          <span className="i-mdi:calendar-range" un-text={`sm ${isExpired ? "gray-4" : "orange-6"}`} />
          {quarterlyDates.map((quarter, index) => (
            <span
              key={index}
              un-px="2"
              un-py="1"
              un-bg={quarter.isToday ? (isExpired ? "gray-2" : "orange-5") : "orange-1"}
              un-text={`xs ${quarter.isToday ? (isExpired ? "gray-4" : "white") : "orange-7"}`}
              un-border="rounded"
              un-font='medium'
              un-position="relative"
            >
              {quarter.date.format('MMM DD')}
              {quarter.isAdjusted && (<Tooltip title={`${quarter.date.subtract(1, 'month').format('MMM')} ${date.format('DD')} is an invalid date`} >
                <span un-cursor='pointer'
                  un-position="absolute"
                  un-top="-1"
                  un-right="-1"
                  un-w="2"
                  un-h="2"
                  un-bg="red-4"
                  un-border="rounded-full"
                />
              </Tooltip>
              )}
            </span>
          ))}
        </div>
      );
    }

    case 'annually': {
      const annualDate = date.year(now.year());
      const isAdjusted = annualDate.date() !== date.date();
      const isToday = annualDate.isSame(now, 'day');
      const todayReminderTime = now.hour(time.hour()).minute(time.minute()).second(time.second());
      const isExpired = isToday && todayReminderTime.isBefore(now);

      return (
        <div un-flex="~ items-center" un-gap="2">
          {isToday && <span className={`i-mdi:bell-alert ${!isExpired && 'animate-ping'}`} un-text={`sm ${isExpired ? "gray-4" : "orange-6"}`} />}
          <span className="i-mdi:calendar-star" un-text={`sm ${isExpired ? "gray-4" : "red-6"}`} />
          <span
            un-px="2"
            un-py="1"
            un-bg={isToday ? (isExpired ? "gray-2" : "red-5") : "red-1"}
            un-text={`xs ${isToday ? (isExpired ? "gray-5" : "white") : "red-7"}`}
            un-border="rounded"
            un-font="medium"
            un-position="relative"
          >
            {annualDate.format('MMM DD')}
            {isAdjusted && (
              <Tooltip title={`Feb 29 is not valid in ${now.year()}`}>
                <span
                  un-cursor="pointer"
                  un-position="absolute"
                  un-top="-1"
                  un-right="-1"
                  un-w="2"
                  un-h="2"
                  un-bg="orange-4"
                  un-border="rounded-full"
                />
              </Tooltip>
            )}
          </span>
        </div>
      );
    }

    default:
      return null;
  }
};

export const TimeAlert = ({ timeNode }: { timeNode: SerializedTimeNode; }) => {
  const { date, time, format, reminders } = timeNode;
  const dateObj = dayjs(date);
  const timeObj = dayjs(time);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div un-border="2 solid slate-3 rounded-lg hover:slate-5"
      un-p='3'
      un-shadow="sm hover:2xl"
      un-transition="all duration-200"
      un-bg="white"
      un-flex='~ col'
      un-gap='2'
    >
      <div
        un-flex="~ items-center justify-between"
        un-gap='2'
        un-cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div un-flex="~ items-center" un-gap="3">
          {format === 'both' && (
            <div un-flex="~ items-center"
              un-gap="1"
              un-px="2"
              un-py="1"
              un-border='rounded'
              un-bg="gradient-to-br"
              un-from='purple-4'
              un-to='purple-6'
            >
              <span className="i-mdi:calendar-month"
                un-text="2xl white"
                aria-label="Date"
                role="img"
              />
              <span un-text="white" un-font="semibold">{dateObj.format('MMM DD,YYYY')}</span>
            </div>
          )}

          <div un-flex="~ items-center"
            un-gap="1"
            un-border='rounded'
            un-px="2"
            un-py="1"
            un-bg="gradient-to-br"
            un-from='blue-4'
            un-to='blue-6'
          >
            <span className="i-material-symbols-light:schedule"
              un-text="2xl white"
              aria-label="Time"
              role="img"
            />
            <span un-text="white">{timeObj.format('hh:mm:ss A')}</span>
          </div>

          <Badge count={reminders.length} size='small' color='#00a6f4' >
            <div className="i-mdi:bell" un-text="lg amber-5" />
          </Badge>
        </div>

        <span
          className={isOpen ? "i-mdi:chevron-up" : "i-mdi:chevron-down"}
          un-text="xl slate-5 hover:slate-9"
        />
      </div>

      {isOpen && (
        <div un-border="2 solid blue-4 rounded" un-px='2' un-py='1' >
          <div un-flex="~ col" un-gap="2">
            {reminders.map((reminder, index) => <ReminderAlert key={index} reminder={reminder} date={dateObj} time={timeObj} format={format} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const Alert = () => {
  const { data, error } = useLoaderData<LoaderData>();

  if (error) {
    return <div>Postgrest Error: {error.message} - {error.code}</div>;
  }

  if (!data) {
    return <div>No alert</div>;
  }

  return (
    <div un-m="6">
      {data.map(d => <div key={d.id}
        un-flex="~"
        un-gap="4"
        un-items="start"
      >
        {d.reminder.map((r: SerializedTimeNode, i: number) => (
          <TimeAlert key={i} timeNode={r} />
        ))}
      </div>)}
    </div>
  );
};

export default Alert;