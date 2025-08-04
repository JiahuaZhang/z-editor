import type { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { TimeAlert } from '~/components/alert/alert';
import { SerializedTimeNode, WeekDay } from '~/components/zeditor/plugin/time/TimeNode';

const meta: Meta<typeof TimeAlert> = {
  title: 'Components/TimeAlert',
  component: TimeAlert,
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
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleDailyReminder: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(30, 'minute').format(),
      format: 'both',
      reminders: [
        {
          type: 'daily',
          once: false,
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with a single daily recurring reminder. Shows date and time badges with one reminder alert.',
      },
    },
  },
};

export const MultipleDailyReminders: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(1, 'hour').format(),
      format: 'both',
      reminders: [
        {
          type: 'daily',
          once: true,
        },
        {
          type: 'daily',
          once: false,
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with multiple daily reminders - one "once" and one recurring. Badge shows count of 2.',
      },
    },
  },
};

export const WeeklyRemindersCollection: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().hour(9).minute(0).format(),
      format: 'both',
      reminders: [
        {
          type: 'weekly',
          weekly: ['Monday', 'Wednesday', 'Friday'],
        },
        {
          type: 'weekly',
          weekly: ['Tuesday', 'Thursday'],
        },
        {
          type: 'weekly',
          weekly: ['Saturday', 'Sunday'],
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with multiple weekly reminders covering different days. Badge shows count of 3.',
      },
    },
  },
};

export const MonthlyRemindersVariety: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-03-15').format(),
      time: dayjs('2024-03-15').hour(14).minute(30).format(),
      format: 'both',
      reminders: [
        {
          type: 'monthly',
          monthly: 'this',
        },
        {
          type: 'monthly',
          monthly: '1st',
        },
        {
          type: 'monthly',
          monthly: '2nd',
        },
        {
          type: 'monthly',
          monthly: 'last',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with various monthly reminders - this day, 1st week, 2nd week, and last week. Badge shows count of 4.',
      },
    },
  },
};

export const QuarterlyReminders: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-08-03').format(),
      time: dayjs('2024-08-03').hour(10).minute(0).format(),
      format: 'both',
      reminders: [
        {
          type: 'quarterly',
        },
        {
          type: 'quarterly',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with multiple quarterly reminders. Shows Q1-Q4 badges for each reminder.',
      },
    },
  },
};

export const AnnualReminders: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-06-15').format(),
      time: dayjs('2024-06-15').hour(10).minute(0).format(),
      format: 'both',
      reminders: [
        {
          type: 'annually',
        },
        {
          type: 'annually',
        },
        {
          type: 'annually',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with multiple annual reminders. Shows calendar star icons with date badges.',
      },
    },
  },
};

export const MixedReminderTypes: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(2, 'hour').format(),
      format: 'both',
      reminders: [
        {
          type: 'daily',
          once: false,
        },
        {
          type: 'weekly',
          weekly: ['Monday', 'Friday'],
        },
        {
          type: 'monthly',
          monthly: 'this',
        },
        {
          type: 'quarterly',
        },
        {
          type: 'annually',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with all reminder types mixed together. Badge shows count of 5 with diverse reminder alerts.',
      },
    },
  },
};

export const TimeOnlyFormat: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(30, 'minute').format(),
      format: 'time',
      reminders: [
        {
          type: 'daily',
          once: false,
        },
        {
          type: 'weekly',
          weekly: ['Monday', 'Wednesday'],
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with time-only format. Only shows time badge without date, with 2 reminders.',
      },
    },
  },
};

export const DateOnlyFormat: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-03-22').format(),
      time: dayjs('2024-03-22').hour(12).minute(0).format(),
      format: 'date',
      reminders: [
        {
          type: 'monthly',
          monthly: 'this',
        },
        {
          type: 'annually',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with date-only format. Only shows date badge without time, with 2 reminders.',
      },
    },
  },
};

export const ExpiredRemindersToday: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().subtract(30, 'minute').format(),
      format: 'both',
      reminders: [
        {
          type: 'daily',
          once: true,
        },
        {
          type: 'weekly',
          weekly: [dayjs().format('dddd') as WeekDay],
        },
        {
          type: 'monthly',
          monthly: 'this',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with multiple expired reminders for today. All reminders show dimmed bell icons and gray text.',
      },
    },
  },
};

export const UpcomingRemindersToday: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(15, 'minute').format(),
      format: 'both',
      reminders: [
        {
          type: 'daily',
          once: false,
        },
        {
          type: 'weekly',
          weekly: [dayjs().format('dddd') as WeekDay],
        },
        {
          type: 'annually',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with multiple upcoming reminders for today. All reminders show active bell icons with colored text.',
      },
    },
  },
};

export const LeapYearEdgeCases: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-02-29').format(),
      time: dayjs('2024-02-29').hour(10).minute(0).format(),
      format: 'both',
      reminders: [
        {
          type: 'quarterly',
        },
        {
          type: 'annually',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with leap year date (Feb 29). Shows how quarterly and annual reminders handle leap year adjustments.',
      },
    },
  },
};

export const InvalidDateAdjustments: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-05-31').format(),
      time: dayjs('2024-05-31').hour(14).minute(30).format(),
      format: 'both',
      reminders: [
        {
          type: 'quarterly',
        },
        {
          type: 'monthly',
          monthly: 'this',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with date that causes invalid dates in some months (31st). Shows date adjustments with red indicators.',
      },
    },
  },
};

export const WeekendOnlyReminders: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().hour(9).minute(0).format(),
      format: 'both',
      reminders: [
        {
          type: 'weekly',
          weekly: ['Saturday', 'Sunday'],
        },
        {
          type: 'monthly',
          monthly: 'last',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert focused on weekend reminders. Shows weekly weekend-only and monthly last week reminders.',
      },
    },
  },
};

export const BusinessDaysOnly: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().hour(9).minute(0).format(),
      format: 'both',
      reminders: [
        {
          type: 'weekly',
          weekly: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        },
        {
          type: 'monthly',
          monthly: '1st',
        },
        {
          type: 'monthly',
          monthly: '2nd',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with business days focus. Shows weekday-only weekly reminder plus first and second week monthly reminders.',
      },
    },
  },
};

export const SingleReminderEachType: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(1, 'hour').format(),
      format: 'both',
      reminders: [
        {
          type: 'daily',
          once: true,
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with just one daily "once" reminder. Minimal case showing single reminder behavior.',
      },
    },
  },
};

export const MaxRemindersStress: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(30, 'minute').format(),
      format: 'both',
      reminders: [
        { type: 'daily', once: true },
        { type: 'daily', once: false },
        { type: 'weekly', weekly: ['Monday', 'Wednesday', 'Friday'] },
        { type: 'weekly', weekly: ['Tuesday', 'Thursday'] },
        { type: 'weekly', weekly: ['Saturday', 'Sunday'] },
        { type: 'monthly', monthly: 'this' },
        { type: 'monthly', monthly: '1st' },
        { type: 'monthly', monthly: '2nd' },
        { type: 'monthly', monthly: '3rd' },
        { type: 'monthly', monthly: '4th' },
        { type: 'monthly', monthly: 'last' },
        { type: 'quarterly' },
        { type: 'quarterly' },
        { type: 'annually' },
        { type: 'annually' },
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert stress test with maximum reminders (15 total). Tests UI performance and layout with many reminder alerts.',
      },
    },
  },
};

export const EarlyMorningTime: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().hour(6).minute(0).format(),
      format: 'both',
      reminders: [
        {
          type: 'daily',
          once: false,
        },
        {
          type: 'weekly',
          weekly: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with early morning time (6:00 AM). Shows business day reminders for early schedule.',
      },
    },
  },
};

export const LateNightTime: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().hour(23).minute(30).format(),
      format: 'both',
      reminders: [
        {
          type: 'daily',
          once: true,
        },
        {
          type: 'monthly',
          monthly: 'last',
        }
      ],
    } as SerializedTimeNode,
  },
  parameters: {
    docs: {
      description: {
        story: 'TimeAlert with late night time (11:30 PM). Shows end-of-day reminders.',
      },
    },
  },
};