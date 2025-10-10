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

export const SingleDailyAlert: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(30, 'minute').format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with a single daily recurring alert. Shows date and time badges with one alert.',
      },
    },
  },
};

export const MultipleDailyAlerts: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(1, 'hour').format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with multiple daily alerts - one "once" and one recurring. Badge shows count of 2.',
      },
    },
  },
};

export const WeeklyAlertsCollection: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().hour(9).minute(0).format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with multiple weekly alerts covering different days. Badge shows count of 3.',
      },
    },
  },
};

export const MonthlyAlertsVariety: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-03-15').format(),
      time: dayjs('2024-03-15').hour(14).minute(30).format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with various monthly alerts - this day, 1st week, 2nd week, and last week. Badge shows count of 4.',
      },
    },
  },
};

export const QuarterlyAlerts: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-08-03').format(),
      time: dayjs('2024-08-03').hour(10).minute(0).format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with multiple quarterly alerts. Shows Q1-Q4 badges for each alert.',
      },
    },
  },
};

export const AnnualAlerts: Story = {
  args: {
    timeNode: {
      date: dayjs('2024-06-15').format(),
      time: dayjs('2024-06-15').hour(10).minute(0).format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with multiple annual alerts. Shows calendar star icons with date badges.',
      },
    },
  },
};

export const MixedAlertTypes: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(2, 'hour').format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with all alert types mixed together. Badge shows count of 5 with diverse alerts.',
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
      alert: [
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
        story: 'TimeAlert with time-only format. Only shows time badge without date, with 2 alerts.',
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
      alert: [
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
        story: 'TimeAlert with date-only format. Only shows date badge without time, with 2 alerts.',
      },
    },
  },
};

export const ExpiredAlertsToday: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().subtract(30, 'minute').format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with multiple expired alerts for today. All alerts show dimmed bell icons and gray text.',
      },
    },
  },
};

export const UpcomingAlertsToday: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(15, 'minute').format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with multiple upcoming alerts for today. All alerts show active bell icons with colored text.',
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
      alert: [
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
        story: 'TimeAlert with leap year date (Feb 29). Shows how quarterly and annual alerts handle leap year adjustments.',
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
      alert: [
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

export const WeekendOnlyAlerts: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().hour(9).minute(0).format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert focused on weekend alerts. Shows weekly weekend-only and monthly last week alerts.',
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
      alert: [
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
        story: 'TimeAlert with business days focus. Shows weekday-only weekly alert plus first and second week monthly alerts.',
      },
    },
  },
};

export const SingleAlertEachType: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(1, 'hour').format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert with just one daily "once" alert. Minimal case showing single alert behavior.',
      },
    },
  },
};

export const MaxAlertsStress: Story = {
  args: {
    timeNode: {
      date: dayjs().format(),
      time: dayjs().add(30, 'minute').format(),
      format: 'both',
      alert: [
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
        story: 'TimeAlert stress test with maximum alerts (15 total). Tests UI performance and layout with many alerts.',
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
      alert: [
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
        story: 'TimeAlert with early morning time (6:00 AM). Shows business day alerts for early schedule.',
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
      alert: [
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
        story: 'TimeAlert with late night time (11:30 PM). Shows end-of-day alerts.',
      },
    },
  },
};