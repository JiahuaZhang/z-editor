import type { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { AlertComponent } from '~/components/alert/alert';
import { WeekDay } from '~/components/zeditor/plugin/time/TimeNode';

const meta: Meta<typeof AlertComponent> = {
  title: 'Components/AlertComponent',
  component: AlertComponent,
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
    alert: {
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
        story: 'A daily alert that was set for today but has already expired (30 mins ago). Shows orange bell alert and gray text.',
      },
    },
  },
};

export const OnceNotExpiredToday: Story = {
  args: {
    alert: {
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
        story: 'A daily alert that is set for today but has not expired yet (30 mins from now). Shows active orange bell and green text.',
      },
    },
  },
};

export const OnceExpiredWeeksAgo: Story = {
  args: {
    alert: {
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
        story: 'A daily alert that was set for 2 weeks ago and has long expired. No bell icon since it\'s not today, shows gray text.',
      },
    },
  },
};

export const DailyBefore30Minutes: Story = {
  args: {
    alert: {
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
        story: 'A recurring daily alert that will trigger in 30 minutes. Shows active bell ring icon and green text.',
      },
    },
  },
};

export const DailyAfter30Minutes: Story = {
  args: {
    alert: {
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
        story: 'A recurring daily alert that was supposed to trigger 30 minutes ago. Shows dimmed bell ring icon and gray text.',
      },
    },
  },
};

export const WeeklyAlert1: Story = {
  args: {
    alert: {
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
        story: 'A weekly alert that repeats on Monday, Wednesday, and Friday. Shows different UI with day badges.',
      },
    },
  },
};

export const WeeklyAlert2: Story = {
  args: {
    alert: {
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
        story: 'A weekly alert that repeats on Tuesday and Thursday. Shows different UI with day badges.',
      },
    },
  },
};

export const WeeklyAlert3: Story = {
  args: {
    alert: {
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
        story: 'A weekly alert that repeats on Saturday and Sunday. Shows different UI with day badges.',
      },
    },
  },
};

export const TodayExpiredAlert: Story = {
  args: {
    alert: {
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
        story: 'A weekly alert for today that has already expired (30 min ago). Shows dimmed bell icon and gray text indicating it has passed.',
      },
    },
  },
};

export const Today30MinsBefore: Story = {
  args: {
    alert: {
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
        story: 'A weekly alert for today that will trigger in 30 minutes. Shows active bell ring icon and green text indicating upcoming alert.',
      },
    },
  },
};

export const MonthlyThisDay: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert set for "this day" (15th of each month). Shows monthly calendar icon with "This day" badge.',
      },
    },
  },
};

export const Monthly1stWeek: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert set for the 1st week of each month. Shows monthly calendar icon with "1st week" badge.',
      },
    },
  },
};

export const Monthly2ndWeek: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert set for the 2nd week of each month. Shows monthly calendar icon with "2nd week" badge.',
      },
    },
  },
};

export const Monthly3rdWeek: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert set for the 3rd week of each month. Shows monthly calendar icon with "3rd week" badge.',
      },
    },
  },
};

export const Monthly4thWeek: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert set for the 4th week of each month. Shows monthly calendar icon with "4th week" badge.',
      },
    },
  },
};

export const Monthly5thWeek: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert set for the 5th week of each month. Shows monthly calendar icon with "5th week" badge.',
      },
    },
  },
};

export const MonthlyLastWeek: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert set for the last week of each month. Shows monthly calendar icon with "last week" badge.',
      },
    },
  },
};

export const Monthly5thSaturdayUnavailable: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert set for the 5th Saturday, but July 2025 only has 4 Saturdays. Shows grayed-out "5th Sat" text without the date badge to indicate the alert is not available this month.',
      },
    },
  },
};

export const MonthlyTodayExpired: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert for today that expired 5 minutes ago. Shows dimmed bell alert icon and gray text indicating the alert has passed.',
      },
    },
  },
};

export const MonthlyTodayUpcoming: Story = {
  args: {
    alert: {
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
        story: 'A monthly alert for today that will trigger in 3 minutes. Shows active bell alert icon and purple text indicating upcoming alert.',
      },
    },
  },
};

export const QuarterlyQ1: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-08-03'),
    time: dayjs('2024-08-03').hour(10).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Q1 (January 15th). Shows quarterly calendar icon with date in MMM DD format and Q1 badge.',
      },
    },
  },
};

export const QuarterlyQ2: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-04-20'),
    time: dayjs('2024-04-20').hour(14).minute(30),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Q2 (April 20th). Shows quarterly calendar icon with date in MMM DD format and Q2 badge.',
      },
    },
  },
};

export const QuarterlyQ3: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-07-10'),
    time: dayjs('2024-07-10').hour(9).minute(15),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Q3 (July 10th). Shows quarterly calendar icon with date in MMM DD format and Q3 badge.',
      },
    },
  },
};

export const QuarterlyQ4: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-10-25'),
    time: dayjs('2024-10-25').hour(16).minute(45),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Q4 (October 25th). Shows quarterly calendar icon with date in MMM DD format and Q4 badge.',
      },
    },
  },
};

export const QuarterlyTodayExpired: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs().subtract(2, 'minute'),
    time: dayjs().subtract(2, 'minute'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert for today that expired 2 minutes ago. Shows dimmed bell alert icon and gray text indicating the alert has passed.',
      },
    },
  },
};

export const QuarterlyTodayUpcoming: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs().add(1, 'hour'),
    time: dayjs().add(1, 'hour'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert for today that will trigger in 1 hour. Shows active bell alert icon and orange text indicating upcoming alert.',
      },
    },
  },
};

export const QuarterlyFeb29LeapYear: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-02-29'), // Leap year Feb 29
    time: dayjs('2024-02-29').hour(10).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Feb 29th (leap year). Shows all 4 quarterly dates: Feb 28 or 29th, May 29th, Aug 29th, Nov 29th. Feb 29th will be adjusted in non-leap years with red indicator.',
      },
    },
  },
};

export const QuarterlyFeb30Invalid: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-05-30'),
    time: dayjs('2024-05-30').hour(14).minute(30),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Feb 30th (invalid date). Shows adjusted dates: Feb 28/29 (with red indicator), May 30th, Aug 30th, Nov 30th.',
      },
    },
  },
};

export const QuarterlyFeb31Invalid: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-05-31'), // Force Feb 31 (invalid)
    time: dayjs('2024-05-31').hour(9).minute(15),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Feb 31st (invalid date). Shows adjusted dates: Feb 28/29 (with red indicator), May 31st, Aug 31st, Nov 30th (adjusted as well).',
      },
    },
  },
};

export const QuarterlyApr31Invalid: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-01-31'),
    time: dayjs('2024-01-31').hour(16).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Apr 30 (invalid - April has 30 days). Shows adjusted dates: Jan 31st, Apr 30 (with red indicator), Jul 31st, Oct 31st.',
      },
    },
  },
};

export const QuarterlySep31Invalid: Story = {
  args: {
    alert: {
      type: 'quarterly',
    },
    date: dayjs('2024-03-31'),
    time: dayjs('2024-03-31').hour(11).minute(45),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A quarterly alert set for Sep 31st (invalid - September has 30 days). Shows adjusted dates: Mar 31st, Jun 30, Sep 30 (with red indicator), Dec 31st',
      },
    },
  },
};

export const AnnuallyRegularDate: Story = {
  args: {
    alert: {
      type: 'annually',
    },
    date: dayjs('2024-06-15'),
    time: dayjs('2024-06-15').hour(10).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'A regular annual alert set for June 15th. Shows calendar star icon with "Jun 15" badge in red theme.',
      },
    },
  },
};

export const AnnuallyTodayUpcoming: Story = {
  args: {
    alert: {
      type: 'annually',
    },
    date: dayjs().add(2, 'hour'),
    time: dayjs().add(2, 'hour'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'An annual alert for today that will trigger in 2 hours. Shows active bell alert icon and red background indicating upcoming alert.',
      },
    },
  },
};

export const AnnuallyTodayExpired: Story = {
  args: {
    alert: {
      type: 'annually',
    },
    date: dayjs(),
    time: dayjs().subtract(1, 'minute'),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'An annual alert for today that expired 1 minute ago. Shows dimmed bell alert icon and gray text indicating the alert has passed.',
      },
    },
  },
};

export const AnnuallyFeb29LeapYear: Story = {
  args: {
    alert: {
      type: 'annually',
    },
    date: dayjs('2024-02-29'),
    time: dayjs('2024-02-29').hour(14).minute(30),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'An annual alert set for Feb 29th (leap year). In non-leap years, it will be adjusted to Feb 28th with an orange indicator dot.',
      },
    },
  },
};

export const AnnuallyNewYearsDay: Story = {
  args: {
    alert: {
      type: 'annually',
    },
    date: dayjs('2024-01-01'),
    time: dayjs('2024-01-01').hour(0).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'An annual alert for New Year\'s Day (Jan 01). Shows calendar star icon with "Jan 01" badge.',
      },
    },
  },
};

export const AnnuallyChristmas: Story = {
  args: {
    alert: {
      type: 'annually',
    },
    date: dayjs('2024-12-25'),
    time: dayjs('2024-12-25').hour(8).minute(0),
    format: 'both',
  },
  parameters: {
    docs: {
      description: {
        story: 'An annual alert for Christmas Day (Dec 25). Shows calendar star icon with "Dec 25" badge.',
      },
    },
  },
};

export const AnnuallyBirthday: Story = {
  args: {
    alert: {
      type: 'annually',
    },
    date: dayjs('2024-03-22'),
    time: dayjs('2024-03-22').hour(12).minute(0),
    format: 'date',
  },
  parameters: {
    docs: {
      description: {
        story: 'An annual alert for a birthday (Mar 22). Shows calendar star icon with "Mar 22" badge in date-only format.',
      },
    },
  },
};
