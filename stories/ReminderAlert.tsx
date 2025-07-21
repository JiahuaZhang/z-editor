import dayjs, { Dayjs } from 'dayjs';
import { Reminder, TimeNodeFormat } from '~/components/zeditor/plugin/time/TimeNode';

export const ReminderAlert = ({ reminder, date, time, format }: {
  reminder: Reminder;
  date: Dayjs;
  time: Dayjs;
  format: TimeNodeFormat;
}) => {
  const now = dayjs();

  const getReminderDisplay = () => {
    switch (reminder.type) {
      case 'daily':
        if (reminder.once) {
          const reminderDateTime = date.hour(time.hour()).minute(time.minute()).second(time.second());
          const isExpired = reminderDateTime.isBefore(now);
          const isToday = reminderDateTime.isSame(now, 'day');

          return (
            <div un-flex="~ items-center" un-gap="2" >
              {
                isToday && <>
                  {
                    isExpired
                      ? <span className="i-mdi:bell-alert" un-text="sm orange-2" />
                      : <span className="i-mdi:bell-alert" un-text="sm orange-6" />
                  }
                </>
              }
              <span className="i-mdi:calendar-today" un-text={`sm ${isExpired ? 'gray-4' : 'green-6'}`} />
              <span un-text={`sm ${isExpired ? 'gray-4' : 'green-6'}`} un-font="medium">
                {reminderDateTime.format('MMM DD, YYYY hh:mm:ss A')}
              </span>
            </div>
          );
        } else {
          const todayReminderTime = now.hour(time.hour()).minute(time.minute()).second(time.second());
          const isExpired = todayReminderTime.isBefore(now);

          return (
            <div un-flex="~ items-center" un-gap="2">
              {isExpired
                ? <span className="i-mdi:bell-ring" un-text="sm orange-2" />
                : <span className="i-mdi:bell-ring" un-text="sm orange-6" />
              }
              <span className="i-mdi:calendar-today" un-text={`sm ${isExpired ? 'gray-4' : 'green-6'}`} />
              <span un-text={`sm ${isExpired ? 'gray-4' : 'green-6'}`} un-font="medium">Daily</span>
            </div>
          );
        }

      case 'weekly':
        return (
          <div un-flex="~ col" un-gap="2">
            <div un-flex="~ items-center" un-gap="2">
              <span className="i-mdi:calendar-week" un-text="sm blue-6" />
              <span un-text="sm blue-7" un-font="medium">Weekly</span>
            </div>
            <div un-flex="~ wrap" un-gap="1" un-ml="6">
              {reminder.weekly.map(day => (
                <span key={day}
                  un-px="2"
                  un-py="1"
                  un-bg="blue-1"
                  un-text="xs blue-8"
                  un-border="rounded"
                  un-font="medium"
                >
                  {day === 'Thursday' ? 'Thurs' : day.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        );

      case 'monthly':
        return (
          <div un-flex="~ items-center" un-gap="2">
            <span className="i-mdi:calendar-month" un-text="sm purple-6" />
            <span un-text="sm purple-7" un-font="medium">Monthly</span>
            <span un-px="2" un-py="1" un-bg="purple-1" un-text="xs purple-8" un-border="rounded" un-font="medium">
              {reminder.monthly === 'this' ? 'This day' : `${reminder.monthly} week`}
            </span>
          </div>
        );

      case 'quarterly':
        return (
          <div un-flex="~ items-center" un-gap="2">
            <span className="i-mdi:calendar-range" un-text="sm orange-6" />
            <span un-text="sm orange-7" un-font="medium">Quarterly</span>
          </div>
        );

      case 'annually':
        return (
          <div un-flex="~ items-center" un-gap="2">
            <span className="i-mdi:calendar-star" un-text="sm red-6" />
            <span un-text="sm red-7" un-font="medium">Annually</span>
          </div>
        );

      default:
        return null;
    }
  };

  return getReminderDisplay();
};