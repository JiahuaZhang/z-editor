import type { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { WeekDay } from '~/components/zeditor/plugin/time/TimeNode';
import { ReminderAlert } from '~/routes/z-editor.alert';

const meta: Meta<typeof ReminderAlert> = {
  title: 'Components/ReminderAlert',
  component: ReminderAlert,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#333333' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OnceExpiredToday: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: true,
    },
    date: dayjs().subtract(30, 'minute'),
    time: dayjs().subtract(30, 'minute'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A daily reminder that was set for today but has already expired (30 mins ago). Shows orange bell alert and gray text.',
      },
    },
  },
};

export const OnceNotExpiredToday: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: true,
    },
    date: dayjs().add(30, 'minute'),
    time: dayjs().add(30, 'minute'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A daily reminder that is set for today but has not expired yet (30 mins from now). Shows active orange bell and green text.',
      },
    },
  },
};

export const OnceExpiredWeeksAgo: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: true,
    },
    date: dayjs().subtract(2, 'weeks'),
    time: dayjs().subtract(2, 'weeks').hour(10).minute(30),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A daily reminder that was set for 2 weeks ago and has long expired. No bell icon since it\'s not today, shows gray text.',
      },
    },
  },
};

export const DailyBefore30Minutes: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: false,
    },
    date: dayjs().add(30, 'minute'),
    time: dayjs().add(30, 'minute'),
    format: 'time',
  },
  parameters: {
    docs: {
      description: {
        story: 'A recurring daily reminder that will trigger in 30 minutes. Shows active bell ring icon and green text.',
      },
    },
  },
};

export const DailyAfter30Minutes: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: false,
    },
    date: dayjs().subtract(30, 'minute'),
    time: dayjs().subtract(30, 'minute'),
    format: 'time',
  },
  parameters: {
    docs: {
      description: {
        story: 'A recurring daily reminder that was supposed to trigger 30 minutes ago. Shows dimmed bell ring icon and gray text.',
      },
    },
  },
};

export const WeeklyReminder1: Story = {
  args: {
    reminder: {
      type: 'weekly',
      weekly: ['Monday', 'Wednesday', 'Friday'],
    },
    date: dayjs(),
    time: dayjs().hour(9).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A weekly reminder that repeats on Monday, Wednesday, and Friday. Shows different UI with day badges.',
      },
    },
  },
};

export const WeeklyReminder2: Story = {
  args: {
    reminder: {
      type: 'weekly',
      weekly: ['Tuesday', 'Thursday',],
    },
    date: dayjs(),
    time: dayjs().hour(9).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A weekly reminder that repeats on Monday, Wednesday, and Friday. Shows different UI with day badges.',
      },
    },
  },
};

export const WeeklyReminder3: Story = {
  args: {
    reminder: {
      type: 'weekly',
      weekly: ['Saturday', 'Sunday',],
    },
    date: dayjs(),
    time: dayjs().hour(9).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A weekly reminder that repeats on Monday, Wednesday, and Friday. Shows different UI with day badges.',
      },
    },
  },
};

export const TodayExpiredAlert: Story = {
  args: {
    reminder: {
      type: 'weekly',
      weekly: [dayjs().format('dddd') as WeekDay],
    },
    date: dayjs(),
    time: dayjs().subtract(30, 'minute'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A weekly reminder for today that has already expired (30 min ago). Shows dimmed bell icon and gray text indicating it has passed.',
      },
    },
  },
};

export const Today30MinsBefore: Story = {
  args: {
    reminder: {
      type: 'weekly',
      weekly: [dayjs().format('dddd') as WeekDay],
    },
    date: dayjs(),
    time: dayjs().add(30, 'minute'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A weekly reminder for today that will trigger in 30 minutes. Shows active bell ring icon and green text indicating upcoming alert.',
      },
    },
  },
};

export const MonthlyThisDay: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: 'this',
    },
    date: dayjs('2024-03-15'),
    time: dayjs('2024-03-15').hour(14).minute(30),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder set for "this day" (15th of each month). Shows monthly calendar icon with "This day" badge.',
      },
    },
  },
};

export const Monthly1stWeek: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: '1st',
    },
    date: dayjs('2024-07-08'),
    time: dayjs('2024-07-08').hour(9).minute(0),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder set for the 1st week of each month. Shows monthly calendar icon with "1st week" badge.',
      },
    },
  },
};

export const Monthly2ndWeek: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: '2nd',
    },
    date: dayjs('2024-11-12'),
    time: dayjs('2024-11-12').hour(16).minute(45),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder set for the 2nd week of each month. Shows monthly calendar icon with "2nd week" badge.',
      },
    },
  },
};

export const Monthly3rdWeek: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: '3rd',
    },
    date: dayjs('2024-05-20'),
    time: dayjs('2024-05-20').hour(11).minute(15),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder set for the 3rd week of each month. Shows monthly calendar icon with "3rd week" badge.',
      },
    },
  },
};

export const Monthly4thWeek: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: '4th',
    },
    date: dayjs('2024-09-25'),
    time: dayjs('2024-09-25').hour(13).minute(20),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder set for the 4th week of each month. Shows monthly calendar icon with "4th week" badge.',
      },
    },
  },
};

export const Monthly5thWeek: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: '5th',
    },
    date: dayjs('2024-01-31'),
    time: dayjs('2024-01-31').hour(18).minute(0),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder set for the 5th week of each month. Shows monthly calendar icon with "5th week" badge.',
      },
    },
  },
};

export const MonthlyLastWeek: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: 'last',
    },
    date: dayjs('2024-12-28'),
    time: dayjs('2024-12-28').hour(10).minute(30),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder set for the last week of each month. Shows monthly calendar icon with "last week" badge.',
      },
    },
  },
};

export const Monthly5thSaturdayUnavailable: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: '5th',
    },
    date: dayjs('2025-07-05'),
    time: dayjs('2025-07-05').hour(10).minute(0),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder set for the 5th Saturday, but July 2025 only has 4 Saturdays. Shows grayed-out "5th Sat" text without the date badge to indicate the reminder is not available this month.',
      },
    },
  },
};

export const MonthlyTodayExpired: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: 'this',
    },
    date: dayjs().subtract(5, 'minute'),
    time: dayjs().subtract(5, 'minute'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder for today that expired 5 minutes ago. Shows dimmed bell alert icon and gray text indicating the alert has passed.',
      },
    },
  },
};

export const MonthlyTodayUpcoming: Story = {
  args: {
    reminder: {
      type: 'monthly',
      monthly: 'this',
    },
    date: dayjs().add(3, 'minute'),
    time: dayjs().add(3, 'minute'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A monthly reminder for today that will trigger in 3 minutes. Shows active bell alert icon and purple text indicating upcoming alert.',
      },
    },
  },
};