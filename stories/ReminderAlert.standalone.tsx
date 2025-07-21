import dayjs, { Dayjs } from 'dayjs';

// Standalone types for Storybook
export type TimeNodeFormat = 'date' | 'time' | 'both';
export const ALL_WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type WeekDay = typeof ALL_WEEK_DAYS[number];
export type Reminder = { type: 'daily'; once: boolean; }
  | { type: 'weekly'; weekly: WeekDay[]; }
  | { type: 'monthly'; monthly: 'this' | '1st' | '2nd' | '3rd' | '4th' | '5th' | 'last'; }
  | { type: 'quarterly'; }
  | { type: 'annually'; };

export const ReminderAlert = ({ reminder, date, time }: {
  reminder: Reminder;
  date: Dayjs;
  time: Dayjs;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isToday && (
                <span
                  style={{
                    fontSize: '14px',
                    color: isExpired ? '#fb923c' : '#ea580c'
                  }}
                >
                  🔔
                </span>
              )}
              <span
                style={{
                  fontSize: '14px',
                  color: isExpired ? '#9ca3af' : '#16a34a'
                }}
              >
                📅
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: isExpired ? '#9ca3af' : '#16a34a',
                  fontWeight: '500'
                }}
              >
                {reminderDateTime.format('MMM DD, YYYY hh:mm:ss A')}
              </span>
            </div>
          );
        } else {
          const todayReminderTime = now.hour(time.hour()).minute(time.minute()).second(time.second());
          const isExpired = todayReminderTime.isBefore(now);

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '14px',
                  color: isExpired ? '#fb923c' : '#ea580c'
                }}
              >
                🔔
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: isExpired ? '#9ca3af' : '#16a34a'
                }}
              >
                📅
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: isExpired ? '#9ca3af' : '#16a34a',
                  fontWeight: '500'
                }}
              >
                Daily
              </span>
            </div>
          );
        }

      case 'weekly':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#2563eb' }}>📅</span>
              <span style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: '500' }}>Weekly</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginLeft: '24px' }}>
              {reminder.weekly.map(day => (
                <span
                  key={day}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {day === 'Thursday' ? 'Thurs' : day.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        );

      case 'monthly':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#7c3aed' }}>📅</span>
            <span style={{ fontSize: '14px', color: '#6d28d9', fontWeight: '500' }}>Monthly</span>
            <span
              style={{
                padding: '4px 8px',
                backgroundColor: '#ede9fe',
                color: '#5b21b6',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {reminder.monthly === 'this' ? 'This day' : `${reminder.monthly} week`}
            </span>
          </div>
        );

      case 'quarterly':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#ea580c' }}>📅</span>
            <span style={{ fontSize: '14px', color: '#c2410c', fontWeight: '500' }}>Quarterly</span>
          </div>
        );

      case 'annually':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#dc2626' }}>⭐</span>
            <span style={{ fontSize: '14px', color: '#b91c1c', fontWeight: '500' }}>Annually</span>
          </div>
        );

      default:
        return null;
    }
  };

  return getReminderDisplay();
};