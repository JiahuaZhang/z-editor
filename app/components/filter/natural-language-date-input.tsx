import { parseDate } from 'chrono-node';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type NaturalLanguageDateInputProps = {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
};

export const NaturalLanguageDateInput = ({ onDateChange, date }: NaturalLanguageDateInputProps) => {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onDateChange(parseDate(value));
  }, [value]);

  return (
    <div un-grid='~' un-gap='1' >
      <div un-flex="~ wrap" un-gap='1' un-mb="2">
        {['today', 'yesterday', 'last Friday', 'last Saturday'].map((example) => (
          <button
            un-px="2"
            un-py="1"
            un-text="xs white hover:gray-800"
            un-bg="blue-400 hover:gray-200"
            un-border="rounded"
            un-transition="colors"
            key={example}
            onClick={() => setValue(example)}
          >
            {example}
          </button>
        ))}
      </div>
      <div un-relative="~">
        <Input
          value={value}
          placeholder="e.g., 'last Friday', 'next Monday', 'in 2 weeks', '3 days ago'"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button un-absolute="~" un-top="0.5" un-right="1"
              variant="ghost"
              size="icon"
            >
              <span className="i-mdi:calendar-month" un-text="xl" />
              <span un-sr="only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent un-bg='white' un-w="auto" align="end" >
            <Calendar mode="single"
              selected={date || undefined}
              month={date || new Date()}
              onMonthChange={onDateChange}
              onSelect={(date) => {
                if (!date) return;

                setValue(date.toDateString());
                onDateChange(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {date && (
        <div un-text="sm gray-600" un-flex="~ items-center" un-gap="1">
          <span className="i-mdi:check-circle" un-text="green-500 lg" />
          {date.toLocaleDateString()}
        </div>
      )}
      {value && !date && (
        <div un-text="sm red-600" un-flex="~ items-center" un-gap="1">
          <span className="i-mdi:error" un-text='lg' />
          Invalid date
        </div>
      )}
    </div>
  );
};
