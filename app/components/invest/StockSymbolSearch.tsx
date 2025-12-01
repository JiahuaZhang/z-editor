import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Input } from '~/components/ui/input';

type StockSymbol = {
  symbol: string;
  name: string;
};

const POPULAR_STOCKS: StockSymbol[] = [
  { symbol: '^SPX', name: 'S&P 500 INDEX' },
  { symbol: '^NDX', name: 'NASDAQ-100' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'MA', name: 'Mastercard Inc.' },
  { symbol: 'PG', name: 'Procter & Gamble' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'UNH', name: 'UnitedHealth Group' },
  { symbol: 'HD', name: 'Home Depot' },
  { symbol: 'BAC', name: 'Bank of America' },
  { symbol: 'XOM', name: 'Exxon Mobil' },
  { symbol: 'CVX', name: 'Chevron Corporation' },
];

type StockSymbolSearchProps = {
  onSubmit: (symbol: string) => void;
  basePath?: string;
};

// todo:
// search to hit api? If there's only 1, auto redirect to that symbol
// default list, after typing, try to hit api as well? update new dropdown. (should cache api results -- backend)
export function StockSymbolSearch({ onSubmit, basePath = '/invest/stock' }: StockSymbolSearchProps) {
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState('^SPX');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<StockSymbol[]>(POPULAR_STOCKS);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const symbol = searchParams.get('symbol');
    if (symbol) {
      setInputValue(symbol);
      setIsOpen(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value.toUpperCase());

    if (value.trim() === '') {
      setFilteredStocks(POPULAR_STOCKS);
    } else {
      const filtered = POPULAR_STOCKS.filter(
        stock =>
          stock.symbol.includes(value.toUpperCase()) ||
          stock.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStocks(filtered);
    }

    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setIsOpen(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setInputValue(symbol);
    setIsOpen(false);
    onSubmit(symbol);
  };

  return (
    <div ref={containerRef} un-relative="~" un-w="md" >
      <form onSubmit={handleSubmit} un-flex="~" un-gap="2">
        <div un-relative="~" un-flex="1">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Enter stock symbol (e.g., NVDA)"
          />
          {inputValue && (
            <div un-absolute="~" un-right="2" un-top='0' un-bottom='0' >
              <button un-h='full' un-flex='~ items-center'
                type="button"
                onClick={() => {
                  setInputValue('');
                  setFilteredStocks(POPULAR_STOCKS);
                }}
                un-text="gray-400 hover:gray-600"
              >
                <span className="i-mdi:close" un-text="lg" />
              </button>
            </div>
          )}
        </div>
        <button disabled={!inputValue || filteredStocks.length === 0}
          type="submit"
          un-bg="blue-500 hover:blue-600 disabled:gray-600"
          un-text="white"
          un-px="4"
          un-py="2"
          un-rounded="md"
          un-font="medium"
          un-cursor='disabled:not-allowed'
          onClick={() => {
            if (inputValue && filteredStocks.length > 0) {
              setInputValue(filteredStocks[0].symbol);
              onSubmit(filteredStocks[0].symbol);
            }
          }}
        >
          Search
        </button>
      </form>

      {isOpen && filteredStocks.length > 0 && (
        <div
          un-absolute="~"
          un-mt="2"
          un-bg="white"
          un-border="~ gray-200 rounded"
          un-shadow="lg"
          un-max-h="80"
          un-overflow-y="auto"
          un-z="50"
        >
          {filteredStocks.map(({ symbol, name }) => (
            <Link to={`${basePath}?symbol=${symbol}`}
              key={symbol}
              type="button"
              un-w="full"
              un-text="left"
              un-px="4"
              un-py="2"
              un-hover="bg-blue-50"
              un-transition="colors"
              un-border="b gray-100 last:none"
            >
              <div un-flex="~ justify-between items-center gap-2" un-min-w='sm' >
                <div un-font="semibold" un-text="gray-900">
                  {symbol}
                </div>
                <div un-text="sm gray-500">
                  {name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && filteredStocks.length === 0 && inputValue && (
        <div
          un-absolute="~"
          un-mt="2"
          un-bg="white"
          un-border="~ gray-200 rounded"
          un-shadow="lg"
          un-p="2"
          un-text="center gray-600"
          un-z="50"
        >
          No matching stocks found for "{inputValue}"
        </div>
      )}
    </div>
  );
}
