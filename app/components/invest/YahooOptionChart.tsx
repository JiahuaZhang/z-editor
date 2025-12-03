import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type OptionContract = {
  contractSymbol: string;
  strike: number;
  currency: string;
  lastPrice: number;
  change: number;
  percentChange: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
  contractSize: string;
  expiration: number;
  lastTradeDate: number;
  impliedVolatility: number;
  inTheMoney: boolean;
};

export type YahooQuote = {
  language: string;
  region: string;
  quoteType: string;
  typeDisp: string;
  quoteSourceName: string;
  triggerable: boolean;
  customPriceAlertConfidence: string;
  currency: string;
  marketState: string;
  regularMarketChangePercent: number;
  regularMarketPrice: number;
  shortName: string;
  longName: string;
  corporateActions: any[];
  postMarketTime?: number;
  regularMarketTime: number;
  hasPrePostMarketData: boolean;
  firstTradeDateMilliseconds: number;
  priceHint: number;
  postMarketChangePercent?: number;
  postMarketPrice?: number;
  postMarketChange?: number;
  regularMarketChange: number;
  regularMarketDayHigh: number;
  regularMarketDayRange: string;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  fullExchangeName: string;
  financialCurrency: string;
  regularMarketOpen: number;
  averageDailyVolume3Month: number;
  averageDailyVolume10Day: number;
  fiftyTwoWeekLowChange: number;
  fiftyTwoWeekLowChangePercent: number;
  fiftyTwoWeekRange: string;
  fiftyTwoWeekHighChange: number;
  fiftyTwoWeekHighChangePercent: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekChangePercent: number;
  dividendDate?: number;
  earningsTimestamp?: number;
  earningsTimestampStart?: number;
  earningsTimestampEnd?: number;
  earningsCallTimestampStart?: number;
  earningsCallTimestampEnd?: number;
  isEarningsDateEstimate?: boolean;
  trailingAnnualDividendRate?: number;
  trailingPE?: number;
  dividendRate?: number;
  trailingAnnualDividendYield?: number;
  dividendYield?: number;
  epsTrailingTwelveMonths?: number;
  epsForward?: number;
  epsCurrentYear?: number;
  priceEpsCurrentYear?: number;
  sharesOutstanding?: number;
  bookValue?: number;
  fiftyDayAverage: number;
  fiftyDayAverageChange: number;
  fiftyDayAverageChangePercent: number;
  twoHundredDayAverage: number;
  twoHundredDayAverageChange: number;
  twoHundredDayAverageChangePercent: number;
  marketCap: number;
  forwardPE?: number;
  priceToBook?: number;
  sourceInterval: number;
  exchange: string;
  messageBoardId: string;
  exchangeTimezoneName: string;
  exchangeTimezoneShortName: string;
  gmtOffSetMilliseconds: number;
  market: string;
  esgPopulated: boolean;
  exchangeDataDelayedBy: number;
  averageAnalystRating?: string;
  tradeable: boolean;
  cryptoTradeable: boolean;
  displayName: string;
  symbol: string;
  [key: string]: any;
};

export type OptionChainResult = {
  underlyingSymbol: string;
  expirationDates: number[];
  strikes: number[];
  hasMiniOptions: boolean;
  quote: YahooQuote;
  options: Array<{
    expirationDate: number;
    hasMiniOptions: boolean;
    calls: OptionContract[];
    puts: OptionContract[];
  }>;
};

type YahooOptionChartProps = {
  data: OptionChainResult;
};


const formatExpiration = (timestamp: number) => {
  const date = dayjs.unix(timestamp);
  const now = dayjs();
  const diffDays = date.diff(now, 'day');

  if (diffDays < 7 && date.day() === 4) return `${date.format('MMM D, YYYY')} (This Friday)`;
  if (diffDays < 14 && diffDays >= 7 && date.day() === 4) return `${date.format('MMM D, YYYY')} (Next Friday)`;

  return date.format('MMM D, YYYY');
};

export function YahooOptionChart({ data }: YahooOptionChartProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [oiFilter, setOiFilter] = useState<'all' | 'call' | 'put'>('all');
  const [volFilter, setVolFilter] = useState<'all' | 'call' | 'put'>('all');

  const urlDate = searchParams.get('date');
  const selectedDate = urlDate ? parseInt(urlDate) : data.expirationDates[0];
  const currentChain = data.options.find(opt => opt.expirationDate === selectedDate);

  const chartData = useMemo(() => {
    if (!currentChain) return [];

    const strikeMap = new Map<number, { strike: number; callOI: number; putOI: number; callVol: number; putVol: number; }>();

    currentChain.calls.forEach(call => {
      if (!strikeMap.has(call.strike)) {
        strikeMap.set(call.strike, { strike: call.strike, callOI: 0, putOI: 0, callVol: 0, putVol: 0 });
      }
      const item = strikeMap.get(call.strike)!;
      item.callOI = call.openInterest;
      item.callVol = call.volume;
    });

    currentChain.puts.forEach(put => {
      if (!strikeMap.has(put.strike)) {
        strikeMap.set(put.strike, { strike: put.strike, callOI: 0, putOI: 0, callVol: 0, putVol: 0 });
      }
      const item = strikeMap.get(put.strike)!;
      item.putOI = put.openInterest;
      item.putVol = put.volume;
    });

    return Array.from(strikeMap.values()).sort((a, b) => a.strike - b.strike);
  }, [currentChain]);

  const handleDateClick = (date: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('date', date.toString());
    navigate(`?${params.toString()}`);
  };

  return (
    <div un-flex="~ col" un-gap="6" un-w="full">
      <div un-flex="~ col" un-gap="2">
        <div un-text="sm font-medium gray-700">Expiration Date</div>
        <div un-flex="~ wrap gap-2">
          {data.expirationDates.map(date => (
            <button
              key={date}
              onClick={() => handleDateClick(date)}
              un-p="x-3 y-1.5"
              un-rounded="full"
              un-border={`~ ${selectedDate === date ? 'blue-600' : 'gray-300'}`}
              un-bg={`${selectedDate === date ? 'blue-600' : 'white'}`}
              un-text={`sm ${selectedDate === date ? 'white' : 'gray-700'}`}
            >
              {formatExpiration(date)}
            </button>
          ))}
        </div>
      </div>

      {currentChain ? (
        <div un-flex="~ col" un-gap="2">
          <div un-flex="~ items-center">
            <h3 un-text="lg font-bold center" un-flex='1' >Open Interest</h3>
            <div un-flex="~ gap-2" un-bg="gray-100" un-p="1" un-rounded="lg">
              {(['all', 'call', 'put'] as const).map((type) => (
                <button
                  key={type}
                  un-p="x-3 y-1"
                  un-rounded="md"
                  un-text={`sm capitalize ${oiFilter === type ? 'blue-600' : 'gray-500 hover:gray-700'}`}
                  un-bg={`${oiFilter === type ? 'white' : 'transparent'}`}
                  un-shadow={`${oiFilter === type ? 'sm' : 'none'}`}
                  onClick={() => setOiFilter(type)}
                >
                  {type === 'all' ? 'All' : type + 's'}
                </button>
              ))}
            </div>
          </div>
          <div un-h="96" un-w="full" un-bg="white" un-p="4" un-rounded="lg" un-border="~ gray-200">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="strike"
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {(oiFilter === 'all' || oiFilter === 'call') && <Bar dataKey="callOI" name="Call OI" fill="#10b981" stackId="a" />}
                {(oiFilter === 'all' || oiFilter === 'put') && <Bar dataKey="putOI" name="Put OI" fill="#ef4444" stackId="a" />}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div un-flex="~ items-center">
            <h3 un-text="lg font-bold center" un-flex='1'>Volume</h3>
            <div un-flex="~ gap-2" un-bg="gray-100" un-p="1" un-rounded="lg">
              {(['all', 'call', 'put'] as const).map((type) => (
                <button
                  key={type}
                  un-p="x-3 y-1"
                  un-rounded="md"
                  un-text={`sm capitalize ${volFilter === type ? 'blue-600' : 'gray-500 hover:gray-700'}`}
                  un-bg={`${volFilter === type ? 'white' : 'transparent'}`}
                  un-shadow={`${volFilter === type ? 'sm' : 'none'}`}
                  onClick={() => setVolFilter(type)}
                >
                  {type === 'all' ? 'All' : type + 's'}
                </button>
              ))}
            </div>
          </div>
          <div un-h="96" un-w="full" un-bg="white" un-p="4" un-rounded="lg" un-border="~ gray-200">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="strike"
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {(volFilter === 'all' || volFilter === 'call') && <Bar dataKey="callVol" name="Call Vol" fill="#3b82f6" stackId="a" />}
                {(volFilter === 'all' || volFilter === 'put') && <Bar dataKey="putVol" name="Put Vol" fill="#f59e0b" stackId="a" />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div un-h="64" un-flex="~ center" un-text="gray-500">
          Select an expiration date to view chart
        </div>
      )}

      {currentChain && <LastTradeDateSection currentChain={currentChain} />}

      {currentChain && <OptionStatisticsSection currentChain={currentChain} />}

      {currentChain && <OptionFiscalAnalysisSection currentChain={currentChain} />}

      <div un-bg="gray-50" un-rounded="lg" un-p="x-4 y-2" un-border="~ gray-200">
        <h3 un-text="lg font-bold mb-4 gray-800">Quote Details</h3>
        <QuoteDisplay quote={data.quote} />
      </div>
    </div>
  );
}

const formatVal = (val: any, type?: 'date' | 'percent' | 'to-percent' | 'currency' | 'number' | 'bool' | 'large-number' | '') => {
  if (val === undefined || val === null) return '-';
  if (type === 'date') return dayjs.unix(val).format('MMM D, YYYY');
  if (type === 'percent') return `${val}%`;
  if (type === 'to-percent') return `${val * 100}%`;
  if (type === 'currency') return `$${val}`;
  if (type === 'number') return val.toLocaleString();
  if (type === 'bool') return val ? 'Yes' : 'No';
  if (type === 'large-number') return (val / 1e9).toFixed(2) + 'B';
  return val.toString();
};

const knownFields: { key: keyof YahooQuote; label: string; type: 'date' | 'percent' | 'to-percent' | 'currency' | 'number' | 'bool' | 'large-number' | ''; }[] = [
  { key: 'regularMarketPrice', label: 'Price', type: 'currency' },
  { key: 'regularMarketChange', label: 'Change', type: 'number' },
  { key: 'regularMarketChangePercent', label: 'Change %', type: 'percent' },
  { key: 'regularMarketOpen', label: 'Open', type: 'currency' },
  { key: 'regularMarketDayHigh', label: 'Day High', type: 'currency' },
  { key: 'regularMarketDayLow', label: 'Day Low', type: 'currency' },
  { key: 'regularMarketPreviousClose', label: 'Prev Close', type: 'currency' },
  { key: 'fiftyTwoWeekRange', label: '52W Range', type: '' },
  { key: 'fiftyTwoWeekHigh', label: '52W High', type: 'currency' },
  { key: 'fiftyTwoWeekHighChange', label: '52W High Change', type: 'number' },
  { key: 'fiftyTwoWeekHighChangePercent', label: '52W High Change %', type: 'to-percent' },
  { key: 'fiftyTwoWeekLow', label: '52W Low', type: 'currency' },
  { key: 'fiftyTwoWeekLowChange', label: '52W Low Change', type: 'number' },
  { key: 'fiftyTwoWeekLowChangePercent', label: '52W Low Change %', type: 'to-percent' },
  { key: 'fiftyTwoWeekChangePercent', label: '52W Change %', type: 'percent' },
  { key: 'regularMarketVolume', label: 'Volume', type: 'number' },
  { key: 'averageDailyVolume10Day', label: 'Avg Vol (10D)', type: 'number' },
  { key: 'averageDailyVolume3Month', label: 'Avg Vol (3M)', type: 'number' },
  { key: 'fiftyDayAverage', label: '50D Avg', type: 'currency' },
  { key: 'twoHundredDayAverage', label: '200D Avg', type: 'currency' },
  { key: 'marketCap', label: 'Market Cap', type: 'large-number' },
  { key: 'trailingPE', label: 'Trailing P/E', type: 'number' },
  { key: 'forwardPE', label: 'Forward P/E', type: 'number' },
  { key: 'epsTrailingTwelveMonths', label: 'EPS (Trailing 12M)', type: 'number' },
  { key: 'epsForward', label: 'EPS (Forward)', type: 'number' },
  { key: 'epsCurrentYear', label: 'EPS (Current Year)', type: 'number' },
  { key: 'priceEpsCurrentYear', label: 'Price-to-Earnings (Current Year)', type: 'number' },
  { key: 'bookValue', label: 'Book Value', type: 'number' },
  { key: 'priceToBook', label: 'Price/Book', type: 'number' },
  { key: 'dividendRate', label: 'Dividend Rate', type: 'percent' },
  { key: 'dividendYield', label: 'Dividend Yield', type: 'percent' },
  { key: 'dividendDate', label: 'Dividend Date', type: 'date' },
  { key: 'trailingAnnualDividendRate', label: 'Trailing Annual Dividend Rate', type: 'percent' },
  { key: 'trailingAnnualDividendYield', label: 'Trailing Annual Dividend Yield', type: 'percent' },
  { key: 'earningsTimestamp', label: 'Earnings Date', type: 'date' },
  { key: 'sharesOutstanding', label: 'Shares Outstanding', type: 'number' },
  { key: 'fiftyDayAverageChange', label: '50D Avg Change', type: 'number' },
  { key: 'fiftyDayAverageChangePercent', label: '50D Avg Change %', type: 'to-percent' },
  { key: 'twoHundredDayAverageChange', label: '200D Avg Change', type: 'number' },
  { key: 'twoHundredDayAverageChangePercent', label: '200D Avg Change %', type: 'to-percent' },
  { key: 'averageAnalystRating', label: 'Average Analyst Rating', type: '' },
];

function QuoteDisplay({ quote }: { quote: YahooQuote; }) {
  return (
    <div un-grid="~ cols-2 md:cols-4 lg:cols-5 xl:cols-6 gap-x-4 gap-y-4">
      {knownFields.map((field) => {
        if (quote[field.key] === undefined) return null;

        return (
          <div key={field.key} un-flex="~ col">
            <span un-text="sm gray-500 font-medium mb-1">{field.label}</span>
            <span un-text="lg font-bold gray-900 truncate" title={quote[field.key]}>
              {formatVal(quote[field.key], field.type)}
            </span>
          </div>
        );
      })}

      {
        quote.corporateActions && quote.corporateActions.length > 0 && (
          <div key="corporateActions" un-flex="~ col" un-col-span="full">
            <span un-text="sm gray-500 font-medium mb-1">Corporate Actions</span>
            <div un-flex="~ col gap-2">
              {quote.corporateActions.map((action, idx) => (
                <pre key={idx} un-text="xs gray-700" un-bg="gray-50" un-p="2" un-rounded="md" un-overflow="auto">
                  {typeof action === 'object' ? JSON.stringify(action, null, 2) : action}
                </pre>
              ))}
            </div>
          </div>
        )
      }
    </div>
  );
}

const format = (ts: number) => dayjs.unix(ts).format('YYYY-MM-DD');
function LastTradeDateSection({ currentChain }: { currentChain: { calls: OptionContract[]; puts: OptionContract[]; }; }) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [oiFilter, setOiFilter] = useState<'all' | 'call' | 'put'>('all');
  const [volFilter, setVolFilter] = useState<'all' | 'call' | 'put'>('all');

  const tradeDates = useMemo(() => {
    const dates = new Set<string>();

    currentChain.calls.forEach(c => dates.add(format(c.lastTradeDate)));
    currentChain.puts.forEach(c => dates.add(format(c.lastTradeDate)));

    return Array.from(dates).sort().reverse();
  }, [currentChain]);

  useMemo(() => {
    if (tradeDates.length > 0 && !tradeDates.includes(selectedDate)) {
      setSelectedDate(tradeDates[0]);
    }
  }, [tradeDates, selectedDate]);

  const chartData = useMemo(() => {
    if (!selectedDate) return [];

    const strikeMap = new Map<number, { strike: number; callOI: number; putOI: number; callVol: number; putVol: number; }>();

    const processContract = (c: OptionContract, type: 'call' | 'put') => {
      if (format(c.lastTradeDate) !== selectedDate) return;

      if (!strikeMap.has(c.strike)) {
        strikeMap.set(c.strike, { strike: c.strike, callOI: 0, putOI: 0, callVol: 0, putVol: 0 });
      }
      const item = strikeMap.get(c.strike)!;
      if (type === 'call') {
        item.callOI += c.openInterest;
        item.callVol += c.volume;
      } else {
        item.putOI += c.openInterest;
        item.putVol += c.volume;
      }
    };

    currentChain.calls.forEach(c => processContract(c, 'call'));
    currentChain.puts.forEach(c => processContract(c, 'put'));

    return Array.from(strikeMap.values()).sort((a, b) => a.strike - b.strike);
  }, [currentChain, selectedDate]);

  if (!selectedDate) return null;

  return (
    <div un-flex="~ col" un-gap="6" un-border="t gray-200" un-pt="6">
      <div un-flex="~ col" un-gap="2">
        <div un-text="sm font-medium gray-700">Last Trade Date</div>
        <div un-flex="~ wrap gap-2">
          {tradeDates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              un-p="x-3 y-1.5"
              un-rounded="full"
              un-border={`~ ${selectedDate === date ? 'blue-600' : 'gray-300'}`}
              un-bg={`${selectedDate === date ? 'blue-600' : 'white'}`}
              un-text={`sm ${selectedDate === date ? 'white' : 'gray-700'}`}
            >
              {date === dayjs().format('YYYY-MM-DD') ? 'Today' : date}
            </button>
          ))}
        </div>
      </div>

      <div un-flex="~ col" un-gap="2">
        <div un-flex="~ items-center">
          <h3 un-text="lg font-bold center" un-flex='1'>Open Interest (Traded on {selectedDate})</h3>
          <div un-flex="~ gap-2" un-bg="gray-100" un-p="1" un-rounded="lg">
            {(['all', 'call', 'put'] as const).map((type) => (
              <button
                key={type}
                un-p="x-3 y-1"
                un-rounded="md"
                un-text={`sm capitalize ${oiFilter === type ? 'blue-600' : 'gray-500 hover:gray-700'}`}
                un-bg={`${oiFilter === type ? 'white' : 'transparent'}`}
                un-shadow={`${oiFilter === type ? 'sm' : 'none'}`}
                onClick={() => setOiFilter(type)}
              >
                {type === 'all' ? 'All' : type + 's'}
              </button>
            ))}
          </div>
        </div>
        <div un-h="96" un-w="full" un-bg="white" un-p="4" un-rounded="lg" un-border="~ gray-200">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="strike" interval="preserveStartEnd" minTickGap={30} />
              <YAxis />
              <Tooltip />
              <Legend />
              {(oiFilter === 'all' || oiFilter === 'call') && <Bar dataKey="callOI" name="Call OI" fill="#10b981" stackId="a" />}
              {(oiFilter === 'all' || oiFilter === 'put') && <Bar dataKey="putOI" name="Put OI" fill="#ef4444" stackId="a" />}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div un-flex="~ items-center">
          <h3 un-text="lg font-bold center" un-flex='1'>Volume (Traded on {selectedDate})</h3>
          <div un-flex="~ gap-2" un-bg="gray-100" un-p="1" un-rounded="lg">
            {(['all', 'call', 'put'] as const).map((type) => (
              <button
                key={type}
                un-p="x-3 y-1"
                un-rounded="md"
                un-text={`sm capitalize ${volFilter === type ? 'blue-600' : 'gray-500 hover:gray-700'}`}
                un-bg={`${volFilter === type ? 'white' : 'transparent'}`}
                un-shadow={`${volFilter === type ? 'sm' : 'none'}`}
                onClick={() => setVolFilter(type)}
              >
                {type === 'all' ? 'All' : type + 's'}
              </button>
            ))}
          </div>
        </div>
        <div un-h="96" un-w="full" un-bg="white" un-p="4" un-rounded="lg" un-border="~ gray-200">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="strike" interval="preserveStartEnd" minTickGap={30} />
              <YAxis />
              <Tooltip />
              <Legend />
              {(volFilter === 'all' || volFilter === 'call') && <Bar dataKey="callVol" name="Call Vol" fill="#3b82f6" stackId="a" />}
              {(volFilter === 'all' || volFilter === 'put') && <Bar dataKey="putVol" name="Put Vol" fill="#f59e0b" stackId="a" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function OptionStatisticsSection({ currentChain }: { currentChain: { calls: OptionContract[]; puts: OptionContract[]; }; }) {
  const allContracts = useMemo(() => [...currentChain.calls, ...currentChain.puts], [currentChain]);

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
  const formatPercent = (val: number) => `${val.toFixed(2)}%`;
  const formatNumber = (val: number) => `${val}`;
  const formatVolatility = (val: number) => `${(val * 100).toFixed(2)}%`;

  return (
    <div un-flex="~ col" un-gap="2">
      <h3 un-text="lg font-bold gray-800">{dayjs.unix(allContracts[0].expiration).format('MM/DD')} Option Chain Statistics</h3>
      <div un-grid="~ cols-1 md:cols-2 xl:cols-3 gap-4">
        <StatTable title="Last Price" data={allContracts} metric="lastPrice" formatVal={formatCurrency} />
        <StatTable title="Change $" data={allContracts} metric="change" formatVal={formatCurrency} />
        <StatTable title="Change %" data={allContracts} metric="percentChange" formatVal={formatPercent} />
        <StatTable title="Volume" data={allContracts} metric="volume" formatVal={formatNumber} />
        <StatTable title="Open Interest" data={allContracts} metric="openInterest" formatVal={formatNumber} />
        <StatTable title="Implied Volatility" data={allContracts} metric="impliedVolatility" formatVal={formatVolatility} />
      </div>
    </div>
  );
}

const formatLargeCurrency = (val: number) => {
  // metric didn't * 100, adjust for it
  if (Math.abs(val) >= 1e7) return `$${(val / 1e7).toFixed(2)}B`;
  if (Math.abs(val) >= 1e4) return `$${(val / 1e4).toFixed(2)}M`;
  if (Math.abs(val) >= 1e1) return `$${(val / 1e1).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
};

function OptionFiscalAnalysisSection({ currentChain }: { currentChain: { calls: OptionContract[]; puts: OptionContract[]; }; }) {
  const allContracts = useMemo(() => [...currentChain.calls, ...currentChain.puts], [currentChain]);

  return (
    <div un-flex="~ col" un-gap="2">
      <h3 un-text="lg font-bold gray-800">Fiscal Analysis</h3>
      <div un-grid="~ cols-1 md:cols-2 gap-4">
        <StatTable
          title="Traded Value (Price * Vol)"
          data={allContracts}
          metric={(c) => c.lastPrice * (c.volume ?? 0)}
          formatVal={formatLargeCurrency}
        />
        <StatTable
          title="Position Value (Price * OI)"
          data={allContracts}
          metric={(c) => c.lastPrice * (c.openInterest ?? 0)}
          formatVal={formatLargeCurrency}
        />
        <StatTable
          title="Momentum Value (Change * Vol)"
          data={allContracts}
          metric={(c) => c.change * (c.volume ?? 0)}
          formatVal={formatLargeCurrency}
        />
        <StatTable
          title="Value Change (Change * OI)"
          data={allContracts}
          metric={(c) => c.change * (c.openInterest ?? 0)}
          formatVal={formatLargeCurrency}
        />
      </div>
    </div>
  );
}

function OptionContractPanel({ contract }: { contract: OptionContract; }) {
  return (
    <div un-text="xs font-medium gray-900 truncate">
      <div un-flex="~ items-center gap-4">
        ${contract.strike} {contract.contractSymbol.includes('C') ? 'Call' : 'Put'}
        <div un-text="xs gray-500">{contract.inTheMoney ? 'ITM' : 'OTM'}</div>
      </div>
      {contract.impliedVolatility > 0.01 && <div un-text="xs gray-500">Implied Volatility: {(contract.impliedVolatility * 100).toFixed(2)}%</div>}
      <div un-flex="~ items-center gap-2" un-text="xs gray-500">
        ${contract.lastPrice}
        {contract.openInterest > 0 && <div>OI: {contract.openInterest}</div>}
        {contract.volume > 0 && <div>Vol: {contract.volume}</div>}
      </div>
    </div>
  );
}

function StatTable({ title, data, metric, formatVal }: {
  title: string;
  data: OptionContract[];
  metric: keyof OptionContract | ((c: OptionContract) => number);
  formatVal: (val: any) => string;
}) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = Math.abs(typeof metric === 'function' ? metric(a) : (a[metric] ?? 0) as number);
      const valB = Math.abs(typeof metric === 'function' ? metric(b) : (b[metric] ?? 0) as number);
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [data, metric, sortOrder]);

  return (
    <div un-flex="~ col" un-bg="white" un-rounded="lg" un-border="~ gray-200" un-overflow="hidden" un-h="80">
      <div un-flex="~ justify-end gap-2"
        un-p="x-3 y-2" un-bg="gray-50" un-border="b gray-200">
        <div un-text="sm font-bold gray-700">{title}</div>
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          un-text="xl blue-500 hover:blue-600"
          un-flex='~'
        >
          <div className={sortOrder === 'asc' ? 'i-ph:sort-ascending-thin' : 'i-ph:sort-descending-thin'} />
        </button>
      </div>

      <div un-overflow="y-auto" un-flex="1">
        <table un-w="full" un-text="left sm">
          <tbody un-divide="y gray-100">
            {sortedData.map((contract) => (
              <tr key={contract.contractSymbol} un-hover="bg-gray-50">
                <td un-p="2">
                  <OptionContractPanel contract={contract} />
                </td>
                <td un-px="2" un-text="right font-bold gray-900 text-xs">
                  {formatVal(typeof metric === 'function' ? metric(contract) : contract[metric])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
