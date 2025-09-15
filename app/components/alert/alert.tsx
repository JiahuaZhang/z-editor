import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { Reminder, SerializedTimeNode, TimeNodeFormat, WeekDay } from '../zeditor/plugin/time/TimeNode';

let globalNow = dayjs();
let globalListeners: Set<(now: Dayjs) => void> = new Set();
let globalInterval: NodeJS.Timeout | null = null;

const startGlobalTimer = () => {
  if (!globalInterval) {
    globalInterval = setInterval(() => {
      globalNow = dayjs();
      globalListeners.forEach(listener => listener(globalNow));
    }, 1000);
  }
};

const stopGlobalTimer = () => {
  if (globalInterval && globalListeners.size === 0) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
};

const useSharedNow = () => {
  const [now, setNow] = useState(globalNow);

  useEffect(() => {
    const listener = (newNow: Dayjs) => setNow(newNow);
    globalListeners.add(listener);
    startGlobalTimer();

    return () => {
      globalListeners.delete(listener);
      stopGlobalTimer();
    };
  }, []);

  return now;
};

export const _StupidUno = <div un-bg="red-400" />;

export const ReminderAlert = ({ reminder, date, time, format }: { reminder: Reminder; date: Dayjs; time: Dayjs; format: TimeNodeFormat; }) => {
  const now = useSharedNow();

  switch (reminder.type) {
    case 'daily':
      if (reminder.once) {
        const reminderDateTime = date.hour(time.hour()).minute(time.minute()).second(time.second());
        const isExpired = reminderDateTime.isBefore(now);
        const isToday = reminderDateTime.isSame(now, 'day');

        return (
          <div un-flex="~" un-items='center' un-gap="2" >
            {
              isExpired
                ? <span className="i-mdi:bell-alert" un-text="sm orange-200" />
                : <span className="i-mdi:bell-alert" un-text="sm orange-600" un-animate={isToday ? 'ping' : ''} />
            }
            <span className="i-mdi:calendar-today" un-text={`sm ${isExpired ? 'gray-400' : 'emerald-500'}`} />
            <span un-text={`sm ${isExpired ? 'gray-400' : 'white'}`} un-font="medium" un-bg={`${!isExpired && 'emerald-500'}`} un-py='1' un-px={`${!isExpired && '2'}`} un-border='rounded' >
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
              ? <span className="i-mdi:bell-ring" un-text="sm orange-200" />
              : <span className="i-mdi:bell-ring" un-text="sm orange-600" un-animate='ping' />
            }
            <span className="i-mdi:calendar-today" un-text={`sm ${isExpired ? 'gray-400' : 'emerald-500'}`} />
            <span un-text={`sm ${isExpired ? 'gray-400' : 'white'}`} un-font="medium" un-bg={`${!isExpired && 'emerald-500'}`} un-py='1' un-px={`${!isExpired && '2'}`} un-border='rounded' >Daily</span>
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
            {isToday && <span className={`i-mdi:bell-alert ${!isExpired && 'animate-ping'}`} un-text={`sm ${isExpired ? "gray-400" : "orange-600"}`} />}
            <span className="i-mdi:calendar-week" un-text={`sm ${isExpired ? "gray-400" : "blue-600"}`} />
            {reminder.weekly.map(day => {
              const isCurrentDay = day === currentDayName;
              return (
                <span key={day}
                  un-px="2"
                  un-py="1"
                  un-bg={isExpired ? "gray-200" : (isCurrentDay ? "blue-500" : "blue-100")}
                  un-text={`xs ${isExpired ? "gray-500" : (isCurrentDay ? "white" : "blue-800")}`}
                  un-border="rounded"
                  un-font={isExpired ? "medium" : (isCurrentDay ? "bold" : "medium")}
                  un-shadow={isExpired ? "none" : (isCurrentDay ? "md" : "none")}
                >
                  {day === 'Thursday' ? 'Thurs' : day.slice(0, 3)}
                </span>
              );
            })}
            {/* <span
              un-text={`sm ${isExpired ? "gray-400" : (isToday ? "white" : "blue-7")}`}
              un-font={isExpired ? "medium" : (isToday ? "bold" : "medium")}
              un-bg={isExpired ? "gray-200" : (isToday ? "blue-500" : "transparent")}
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
          {isToday && <span className={`i-mdi:bell-alert ${!isExpired && 'animate-ping'}`} un-text={`sm ${isExpired ? "gray-400" : "orange-600"}`} />}
          <span className="i-mdi:calendar-month" un-text={`sm ${isExpired ? "gray-400" : "purple-600"}`} />
          <div un-flex="~ items-center" >
            {isDateAvailable && (
              <span
                un-px="2"
                un-py="1"
                un-bg={isExpired ? "gray-200" : "purple-500"}
                un-text={`xs ${isExpired ? "gray-500" : "white"}`}
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
                un-text={`xs ${isExpired ? "gray-400" : (isDateAvailable ? "purple-7" : "gray-400")}`}
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
          {hasToday && <span className={`i-mdi:bell-alert ${!isExpired && 'animate-ping'}`} un-text={`sm ${isExpired ? "gray-400" : "orange-600"}`} />}
          <span className="i-mdi:calendar-range" un-text={`sm ${isExpired ? "gray-400" : "orange-600"}`} />
          {quarterlyDates.map((quarter, index) => (
            <span
              key={index}
              un-px="2"
              un-py="1"
              un-bg={quarter.isToday ? (isExpired ? "gray-200" : "orange-500") : "orange-100"}
              un-text={`xs ${quarter.isToday ? (isExpired ? "gray-400" : "white") : "orange-7"}`}
              un-border="rounded"
              un-font='medium'
              un-position="relative"
            >
              {quarter.date.format('MMM DD')}
              {quarter.isAdjusted && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      un-cursor='pointer'
                      un-position="absolute"
                      un-top="-1"
                      un-right="-1"
                      un-w="2"
                      un-h="2"
                      un-bg="red-400"
                      un-border="rounded-full"
                    />
                  </TooltipTrigger>
                  <TooltipContent un-text='white' >
                    {`${quarter.date.subtract(1, 'month').format('MMM')} ${date.format('DD')} is an invalid date`}
                  </TooltipContent>
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
          {isToday && <span className={`i-mdi:bell-alert ${!isExpired && 'animate-ping'}`} un-text={`sm ${isExpired ? "gray-400" : "orange-600"}`} />}
          <span className="i-mdi:calendar-star" un-text={`sm ${isExpired ? "gray-400" : "red-600"}`} />
          <span
            un-px="2"
            un-py="1"
            un-bg={isToday ? (isExpired ? "gray-200" : "red-500") : "red-100"}
            un-text={`xs ${isToday ? (isExpired ? "gray-500" : "white") : "red-700"}`}
            un-border="rounded"
            un-font="medium"
            un-position="relative"
          >
            {annualDate.format('MMM DD')}
            {isAdjusted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    un-cursor="pointer"
                    un-position="absolute"
                    un-top="-1"
                    un-right="-1"
                    un-w="2"
                    un-h="2"
                    un-bg="orange-400"
                    un-border="rounded-full"
                  />
                </TooltipTrigger>
                <TooltipContent un-text='white' >
                  {`Feb 29 is not valid in ${now.year()}`}
                </TooltipContent>
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
  const [isOpen, setIsOpen] = useState(false); // todo, should be smartly auto open when there's an active reminder

  return (
    <div className={''}
      un-border={`2 solid rounded-lg ${isOpen ? 'purple-300 hover:purple-500' : 'slate-300 hover:slate-500'}`}
      un-p='2'
      un-px='3'
      un-shadow="sm hover:2xl"
      un-transition="all duration-200"
      un-flex='~ col'
      un-gap='2'
    >
      <div
        un-flex="~ items-center justify-between"
        un-gap='2'
        un-cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div un-flex="~" un-items='center' un-gap="3">
          {format === 'both' && (
            <div un-flex="~"
              un-gap="1"
              un-px="2"
              un-py="1"
              un-border='rounded'
              un-bg="linear-to-r"
              un-from='purple-500'
              un-to='purple-600'
            >
              <span className="i-mdi:calendar-month"
                un-text="2xl white"
                aria-label="Date"
                role="img"
              />
              <span un-text="white" >{dateObj.format('MMM DD,YYYY')}</span>
            </div>
          )}

          <div un-flex="~"
            un-gap="1"
            un-border='rounded'
            un-px="2"
            un-py="1"
            un-bg="linear-to-r"
            un-from='blue-400'
            un-to='blue-500'
          >
            <span className="i-material-symbols-light:schedule"
              un-text="2xl white"
              aria-label="Time"
              role="img"
            />
            <span un-text="white">{timeObj.format('hh:mm:ss A')}</span>
          </div>

          <div un-position="relative" un-inline-block="">
            <div className="i-mdi:bell" un-text="lg amber-500" />
            {reminders.length > 0 && (
              <span un-position='absolute'
                un-top='-2'
                un-right='-2'
                un-h='4'
                un-w='4'
                un-bg='red-400'
                un-flex='~'
                un-justify='center'
                un-text='xs white'
                un-border='rounded-full'
              >
                {reminders.length}
              </span>
            )}
          </div>
        </div>

        <span
          className={isOpen ? "i-mdi:chevron-up" : "i-mdi:chevron-down"}
          un-text="xl slate-500 hover:slate-900"
        />
      </div>

      {isOpen && (
        <div un-border="2 solid blue-200 rounded" un-px='2' un-py='1' un-flex="~ col" un-gap="2" >
          {reminders.map((reminder, index) => <ReminderAlert key={index} reminder={reminder} date={dateObj} time={timeObj} format={format} />)}
        </div>
      )}
    </div>
  );
};
