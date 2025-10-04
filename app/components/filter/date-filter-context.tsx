import { createContext, ReactNode, useContext, useState } from 'react';
import { DateRange } from 'react-day-picker';

type DateFilterMode = 'before' | 'after' | 'range';

type DateFilterState = {
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  mode: DateFilterMode;
  setMode: React.Dispatch<React.SetStateAction<DateFilterMode>>;
  date: Date | null;
  setDate: React.Dispatch<React.SetStateAction<Date | null>>;
  rangeSelection: DateRange | undefined;
  setRangeSelection: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
};

const defaultDateFilterState: DateFilterState = {
  enabled: false,
  setEnabled: () => {},
  mode: 'after',
  setMode: () => {},
  date: new Date(),
  setDate: () => {},
  rangeSelection: undefined,
  setRangeSelection: () => {}
};

const DateFilterContext = createContext<DateFilterState>(defaultDateFilterState);

export const DateFilterProvider = ({ children }: { children: ReactNode; }) => {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<DateFilterMode>('after');
  const [date, setDate] = useState<Date | null>(new Date());
  const [rangeSelection, setRangeSelection] = useState<DateRange | undefined>({ from: new Date() });

  const value: DateFilterState = {
    enabled,
    setEnabled,
    mode,
    setMode,
    date,
    setDate,
    rangeSelection,
    setRangeSelection
  };

  return (
    <DateFilterContext.Provider value={value} >
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};
