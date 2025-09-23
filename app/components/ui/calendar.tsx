import * as React from 'react';
import { Calendar as ReactCalendar } from 'react-calendar';
import { clsx } from 'clsx';
import 'react-calendar/dist/Calendar.css';

export interface CalendarProps {
  mode?: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  captionLayout?: 'dropdown';
}

function Calendar({
  className,
  selected,
  onSelect,
  month,
  onMonthChange,
  ...props
}: CalendarProps) {
  return (
    <div className={clsx('p-3', className)}>
      <ReactCalendar
        onChange={(value) => onSelect?.(value as Date)}
        value={selected}
        activeStartDate={month}
        onActiveStartDateChange={({ activeStartDate }) =>
          onMonthChange?.(activeStartDate as Date)
        }
        className="react-calendar-custom"
        {...props}
      />
    </div>
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };