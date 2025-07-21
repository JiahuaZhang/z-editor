import type { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { ReminderAlert } from './ReminderAlert.standalone';

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

// Test case 1: 'once' type, that's expired in today
export const OnceExpiredToday: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: true,
    },
    date: dayjs(),
    time: dayjs().subtract(2, 'hours'), // 2 hours ago today
  },
  parameters: {
    docs: {
      description: {
        story: 'A daily reminder that was set for today but has already expired (2 hours ago). Shows orange bell alert and gray text.',
      },
    },
  },
};

// Test case 2: 'once' type, that's not expired in today
export const OnceNotExpiredToday: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: true,
    },
    date: dayjs(),
    time: dayjs().add(2, 'hours'), // 2 hours from now today
  },
  parameters: {
    docs: {
      description: {
        story: 'A daily reminder that is set for today but has not expired yet (2 hours from now). Shows active orange bell and green text.',
      },
    },
  },
};

// Test case 3: 'once' type, that's expired weeks ago
export const OnceExpiredWeeksAgo: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: true,
    },
    date: dayjs().subtract(2, 'weeks'),
    time: dayjs().subtract(2, 'weeks').hour(10).minute(30), // 2 weeks ago at 10:30 AM
  },
  parameters: {
    docs: {
      description: {
        story: 'A daily reminder that was set for 2 weeks ago and has long expired. No bell icon since it\'s not today, shows gray text.',
      },
    },
  },
};

// Test case 4: regular 'daily' type, and current time is 30 minutes before alert
export const DailyBefore30Minutes: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: false,
    },
    date: dayjs(),
    time: dayjs().add(30, 'minutes'), // 30 minutes from now
  },
  parameters: {
    docs: {
      description: {
        story: 'A recurring daily reminder that will trigger in 30 minutes. Shows active bell ring icon and green text.',
      },
    },
  },
};

// Test case 5: regular 'daily' type, and current time just 1 hour after alert
export const DailyAfter1Hour: Story = {
  args: {
    reminder: {
      type: 'daily',
      once: false,
    },
    date: dayjs(),
    time: dayjs().subtract(1, 'hour'), // 1 hour ago
  },
  parameters: {
    docs: {
      description: {
        story: 'A recurring daily reminder that was supposed to trigger 1 hour ago. Shows dimmed bell ring icon and gray text.',
      },
    },
  },
};

// Additional story for comparison - Weekly reminder
export const WeeklyReminder: Story = {
  args: {
    reminder: {
      type: 'weekly',
      weekly: ['Monday', 'Wednesday', 'Friday'],
    },
    date: dayjs(),
    time: dayjs().hour(9).minute(0),
  },
  parameters: {
    docs: {
      description: {
        story: 'A weekly reminder that repeats on Monday, Wednesday, and Friday. Shows different UI with day badges.',
      },
    },
  },
};