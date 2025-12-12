import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import { Form, useNavigation, useSearchParams } from 'react-router';
import { AlphaVantageService } from '~/services/alphaVantage';
import type { Route } from './+types/invest.news';

dayjs.extend(relativeTime);

interface NewsTopic {
  topic: string;
  relevance_score: string;
}

interface TickerSentiment {
  ticker: string;
  relevance_score: string;
  ticker_sentiment_score: string;
  ticker_sentiment_label: string;
}

interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string | null;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: NewsTopic[];
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: TickerSentiment[];
}

interface LoaderData {
  feed: NewsItem[];
  error?: string | null;
}

interface LoaderArgs {
  request: Request;
}

async function fetchNewsData(topics: string | null, tickers: string | null, sort: string) {
  return AlphaVantageService.fetchNewsSentiment({ topics, tickers, sort, limit: '50' });
}

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const topics = url.searchParams.get('topics');
  const tickers = url.searchParams.get('tickers');
  const sort = url.searchParams.get('sort') || 'LATEST';

  try {
    const data = await fetchNewsData(topics, tickers, sort);

    if (data.feed) {
      return { feed: data.feed as NewsItem[], error: null };
    } else if (data['Error Message']) {
      return { feed: [], error: data['Error Message'] as string };
    } else if (data['Information']) {
      return { feed: [], error: data['Information'] as string };
    }

    return { feed: [], error: null };
  } catch (e) {
    return { feed: [], error: 'Failed to fetch news' };
  }
};

const TOPICS = [
  { label: 'Blockchain', value: 'blockchain' },
  { label: 'Earnings', value: 'earnings' },
  { label: 'IPO', value: 'ipo' },
  { label: 'Mergers & Acquisitions', value: 'mergers_and_acquisitions' },
  { label: 'Financial Markets', value: 'financial_markets' },
  { label: 'Economy - Fiscal', value: 'economy_fiscal' },
  { label: 'Economy - Monetary', value: 'economy_monetary' },
  { label: 'Economy - Macro', value: 'economy_macro' },
  { label: 'Energy & Transportation', value: 'energy_transportation' },
  { label: 'Finance', value: 'finance' },
  { label: 'Life Sciences', value: 'life_sciences' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Retail & Wholesale', value: 'retail_wholesale' },
  { label: 'Technology', value: 'technology' },
];

const POPULAR_TICKERS = ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD'];

function Badge({ children, color = 'gray', tooltip }: { children: React.ReactNode; color?: string; tooltip?: React.ReactNode; }) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span un-p='x-2 y-1' un-border='rounded-full' un-text='sm' un-relative="~"
      className={`group ${colors[color] ?? colors.gray}`}>
      {children}
      {tooltip && (
        <div un-absolute="~"
          un-z="200"
          un-bottom="full"
          un-p="x-2 y-1"
          un-bg="gray-900!" un-text="white xs" un-rounded="md"
          un-pointer-events="none" un-whitespace="nowrap"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          {tooltip}
        </div>
      )}
    </span>
  );
}

function NewsCard({ item }: { item: NewsItem; }) {
  const timeAgo = dayjs(item.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')).fromNow();

  return (
    <div un-flex="~ col md:row" un-bg="white" un-border="~ gray-200 rounded-xl"
      un-hover="shadow-md border-blue-300" un-transition="all duration-200">
      {item.banner_image && (
        <div un-w="full md:48" un-h="48 md:auto" un-flex="none" un-bg="gray-100" un-relative="~">
          <img src={item.banner_image} alt="" un-absolute="~ inset-0" un-w="full" un-h="full" un-object="cover" />
        </div>
      )}
      <div un-flex="~ col 1" un-p="x-2 md:x-4 y-2" un-gap="2">
        <div un-flex="~ items-start justify-between gap-4">
          <div un-flex="~ col gap-1">
            <div un-flex="~ items-center gap-2 text-xs gray-500">
              <span un-font="medium gray-900">{item.source}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" un-text="lg md:xl font-bold blue-400 hover:blue-600" un-leading="tight">
              {item.title}
            </a>
          </div>
          <div un-flex="none" >
            <SentimentBadge score={item.overall_sentiment_score} label={item.overall_sentiment_label} />
          </div>
        </div>

        <p un-text="sm gray-600" un-line-clamp="2 md:3">{item.summary}</p>

        <div un-flex="~ wrap gap-2" un-mt="auto">
          {item.ticker_sentiment.slice(0, 4).map((t) => (
            <Badge key={t.ticker} color="blue"
              tooltip={
                <div un-flex="~ col gap-1">
                  <div>Sentiment: <span un-font="bold">{t.ticker_sentiment_label}</span> ({parseFloat(t.ticker_sentiment_score).toFixed(4)})</div>
                  <div>Relevance: {parseFloat(t.relevance_score).toFixed(4)}</div>
                </div>
              }
            >
              ${t.ticker}
            </Badge>
          ))}
          {item.topics.slice(0, 3).map((t) => (
            <Badge key={t.topic} color="gray"
              tooltip={`Relevance: ${parseFloat(t.relevance_score).toFixed(4)}`}
            >
              #{t.topic}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ score, label }: { score: number; label: string; }) {
  let color = 'gray';
  if (score <= -0.15) color = 'red';
  else if (score >= 0.15) color = 'green';

  return (
    <Badge color={color} tooltip={`Sentiment Score: ${score.toFixed(4)}`}>{label}</Badge>
  );
}

function MultiSelectInput({ name, placeholder, defaultValue = '', suggestions = [] }: {
  name: string;
  placeholder: string;
  defaultValue?: string;
  suggestions?: { label: string; value: string; }[];
}) {
  const [values, setValues] = useState<string[]>(defaultValue ? defaultValue.split(',') : []);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      const val = input.trim().toUpperCase();
      if (val && !values.includes(val)) {
        setValues([...values, val]);
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      setValues(values.slice(0, -1));
    }
  };

  const addValue = (val: string) => {
    if (!values.includes(val)) {
      setValues([...values, val]);
    }
    setInput('');
  };

  const filteredSuggestions = suggestions.filter(s =>
    !values.includes(s.value) &&
    (s.label.toLowerCase().includes(input.toLowerCase()) || s.value.toLowerCase().includes(input.toLowerCase()))
  );

  return (
    <div un-flex="~ col" un-relative="~">
      <div un-flex="~ wrap items-center gap-2" un-p="2" un-bg="white" un-border="~ gray-300 focus-within:blue-500" un-rounded="lg" un-shadow="sm">
        {values.map(v => (
          <span key={v} un-flex="~ items-center gap-1" un-bg="blue-50" un-text="blue-700 xs" un-p="x-2 y-1" un-rounded="md">
            {suggestions.find(s => s.value === v)?.label ?? v}
            <button type="button" onClick={() => setValues(values.filter(x => x !== v))} un-hover="text-blue-900">×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
            const val = input.trim().toUpperCase();
            if (val && !values.includes(val)) {
              setValues([...values, val]);
              setInput('');
            }
          }}
          placeholder={values.length === 0 ? placeholder : ''}
          un-flex="1"
          un-min-w="120px"
          un-outline="none"
          un-text="sm"
        />
        <input type="hidden" name={name} value={values.join(',')} />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div un-absolute="~" un-top="full" un-left="0" un-right="0" un-mt="1" un-bg="white" un-border="~ gray-200 rounded-lg" un-shadow="lg" un-z="50" un-max-h="60" un-overflow="y-auto" un-p="2">
          <div un-flex="~ wrap gap-2">
            {filteredSuggestions.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => addValue(s.value)}
                un-p="x-2 y-1" un-text="xs hover:blue-600"
                un-bg="gray-50 hover:blue-50" un-border="~ gray-200 hover:blue-200 rounded-lg"
                un-transition="colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvestNews({ loaderData }: Route.ComponentProps) {
  const { feed, error } = loaderData;
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const [mode, setMode] = useState<'tickers' | 'topics'>(searchParams.has('topics') ? 'topics' : 'tickers');
  const isLoading = navigation.state === 'loading';

  return (
    <div un-flex="~ col" un-w="full" un-max-w="5xl" un-mx="auto" un-gap="2" >
      <div un-flex="~ col gap-2">
        <Form
          method="get"
          un-flex="~ col md:row gap-2"
          un-bg="gray-50"
          un-p="2"
          un-border="~ gray-200 rounded-lg"
        >
          <div un-flex="~"
            un-bg='white'
            un-border='rounded-lg ~ gray-200'
            un-p='1'
            un-shadow='sm'
          >
            <button
              type="button"
              onClick={() => { setMode('topics'); }}
              un-p='x-3 y-1'
              un-rounded="md"
              un-text={`sm ${mode === 'topics' ? 'white' : 'blue-600'}`}
              un-bg={mode === 'topics' ? 'blue-600' : 'hover:blue-50'}
              un-shadow={mode === 'topics' ? 'sm' : 'none'}
            >
              Topics
            </button>
            <button
              type="button"
              onClick={() => { setMode('tickers'); }}
              un-p='x-3 y-1'
              un-rounded="md"
              un-text={`sm ${mode === 'tickers' ? 'white' : 'blue-600'}`}
              un-bg={mode === 'tickers' ? 'blue-600' : 'hover:blue-50'}
              un-shadow={mode === 'tickers' ? 'sm' : 'none'}
            >
              Tickers
            </button>
          </div>

          <div un-flex="1">
            {mode === 'tickers' ? (
              <MultiSelectInput
                key="tickers"
                name="tickers"
                placeholder="Enter tickers (e.g. AAPL, NVDA)..."
                defaultValue={searchParams.get('tickers') || ''}
                suggestions={POPULAR_TICKERS.map(t => ({ label: t, value: t }))}
              />
            ) : (
              <MultiSelectInput
                key="topics"
                name="topics"
                placeholder="Select topics..."
                defaultValue={searchParams.get('topics') || ''}
                suggestions={TOPICS}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            un-bg='blue-600 hover:blue-700'
            un-text='white'
            un-px="4"
            un-shadow="sm hover:md"
            un-border='rounded'
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </Form>
      </div>

      {error && (
        <div un-p="4" un-bg="red-50" un-text="red-700" un-rounded="lg" un-border="~ red-200">
          {error}
        </div>
      )}

      <div un-flex="~ col gap-2">
        {feed.length === 0 && !error ? (
          <div un-text="center gray-500 py-12">
            No news found. Try adjusting your filters.
          </div>
        ) : (
          feed.map((item, i) => (
            <NewsCard key={`${item.url}-${i}`} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
