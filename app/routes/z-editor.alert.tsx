import { PostgrestError } from '@supabase/supabase-js';
import { Badge } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { LoaderFunction, useLoaderData } from "react-router";
import { Reminder, SerializedTimeNode, TimeNodeFormat } from '~/components/zeditor/plugin/time/TimeNode';
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

const ReminderAlert = ({ reminder, date, time, format }: { reminder: Reminder; date: Dayjs; time: Dayjs; format: TimeNodeFormat; }) => {
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

  // return (
  //   <div un-p="2" un-border="1 solid slate-2 rounded" un-bg="slate-1">
  //     {getReminderDisplay()}
  //   </div>
  // );
  return getReminderDisplay();
};

const TimeAlert = ({ timeNode }: { timeNode: SerializedTimeNode; }) => {
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

          <Badge count={reminders.length} size='small' >
            <div className="i-mdi:bell" un-text="lg amber-5" />
          </Badge>
        </div>

        <span
          className={isOpen ? "i-mdi:chevron-up" : "i-mdi:chevron-down"}
          un-text="xl slate-5 hover:slate-9"
        />
      </div>

      {isOpen && (
        <div un-mt="4" un-pt="3" un-border="t-1 solid slate-2">
          {/* grid? dense layout? */}
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