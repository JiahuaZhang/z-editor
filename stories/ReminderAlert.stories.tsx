import type { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
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