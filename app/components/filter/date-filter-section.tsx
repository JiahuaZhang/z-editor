import { Calendar } from '../ui/calendar';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { DateFilterState, useCreatedDateFilter, useUpdatedDateFilter } from './date-filter-context';
import { NaturalLanguageDateInput } from './natural-language-date-input';

type DateFilterSectionProps = {
  type: 'created' | 'updated';
  useContext: () => DateFilterState;
};

export const DateFilterSection = ({ type, useContext }: DateFilterSectionProps) => {
  const { enabled, setEnabled, mode, setMode, date, setDate, rangeSelection, setRangeSelection } = useContext();

  return (
    <div un-border="1 gray-200 rounded" un-p="2" un-space-y='2' >
      <div un-flex="~ items-center justify-between gap-2" un-p="2" un-rounded="~" un-bg="hover:gray-50" un-transition="colors">
        <div un-flex="~ items-center gap-2">
          <Label un-text="lg"
            un-font="semibold"
            un-cursor="pointer"
            htmlFor={`${type}-switch`}
          >
            {type}
          </Label>
          {enabled && (
            <span un-text="xs green-600" un-bg="green-100" un-px="2" un-py="1" un-rounded="full">
              Active
            </span>
          )}
        </div>
        <Switch id={`${type}-switch`}
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>

      {enabled && (
        <div un-space="y-2">
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'before' | 'after' | 'range')} >
            <TabsList>
              <TabsTrigger value="before">
                <span className="i-mdi:arrow-back" />
                Before
              </TabsTrigger>
              <TabsTrigger value="range">
                <span className="i-mdi:date-range" />
                Range
              </TabsTrigger>
              <TabsTrigger value="after">
                After
                <span className="i-mdi:arrow-forward" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === 'range'
            ? <Calendar className='p-1 border-2 border-solid border-blue-300! border-rounded'
              mode="range" selected={rangeSelection} onSelect={setRangeSelection} />
            : <NaturalLanguageDateInput
              date={date}
              onDateChange={setDate}
            />}
        </div>
      )}
    </div>);
};

export const ExtraDateFilter = ({ onApply, ...rest }: { onApply: () => void; }) => {
  return <div un-flex='~ justify-end' {...rest} >
    <div un-border='rounded 2 solid blue-200' un-w='fit' un-p='2' un-grid='~ justify-end gap-2' >
      <h1 un-text='right' >Filter Document by date</h1>
      <div un-flex='~ gap-2'>
        <DateFilterSection type="created" useContext={useCreatedDateFilter} />
        <DateFilterSection type="updated" useContext={useUpdatedDateFilter} />
      </div>
      <button un-bg='blue-400 hover:white' un-text='white hover:blue-400 sm' un-p='1' un-px='2' un-border='rounded solid blue-400 2'
        un-cursor='pointer' un-shadow='sm' un-ml='auto'
        type="submit"
        onClick={onApply}
      >
        Apply
      </button>
    </div>
  </div>;
};
