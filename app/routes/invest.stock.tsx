import { useFetcher } from 'react-router';
import { YahooCandleChart } from '~/components/chart/YahooCandleChart';
import { StockSymbolSearch } from '~/components/invest/StockSymbolSearch';
import { YahooFinanceService } from '~/services/yahooFinance';
import type { Yahoo } from '~/types/YahooFinance';
import type { Route } from './+types/invest.stock';

async function fetchStockData(symbol: string): Promise<Yahoo.ChartResponse> {
  return YahooFinanceService.fetchChart(symbol, '1d', '2y');
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol') || '^SPX';

  try {
    const data = await fetchStockData(symbol);

    return {
      data,
      symbol,
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      data: null,
      symbol,
      lastUpdate: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export default function Future({ loaderData }: Route.ComponentProps) {
  const { data, symbol, error } = loaderData;
  const fetcher = useFetcher<typeof loader>();

  const currentData = fetcher.data?.data || data;
  const currentSymbol = fetcher.data?.symbol || symbol;
  const isLoading = fetcher.state === 'loading';

  const handleSymbolSubmit = (newSymbol: string) => {
    // fetcher.load(`/invest/stock?symbol=${newSymbol}`);
  };

  return (
    <div un-p="4" un-max-w="7xl" un-mx="auto">
      <div un-mb="6">
        <StockSymbolSearch onSubmit={handleSymbolSubmit} />
      </div>

      {error && (
        <div un-bg="red-50" un-border="~ red-200" un-rounded="lg" un-p="6" un-mb="6">
          <h2 un-text="xl red-800" un-font="bold" un-mb="2">Error Loading Data</h2>
          <p un-text="red-600">{error}</p>
        </div>
      )}

      {isLoading && (
        <div un-bg="blue-50" un-border="~ blue-200" un-rounded="lg" un-p="6" un-mb="6">
          <div un-flex="~ items-center" un-gap="3">
            <span className="i-mdi:loading" un-text="2xl blue-600" un-animate="spin" />
            <span un-text="blue-800" un-font="medium">Loading {currentSymbol} data...</span>
          </div>
        </div>
      )}

      {!error && currentData && currentData.chart?.result?.[0] && (
        <div un-bg="white" un-rounded="xl" un-shadow="lg" un-p="6">
          <div un-mb="4" un-flex="~ justify-between items-center">
            <h2 un-text="xl gray-900" un-font="semibold">
              {currentData.chart.result[0].meta.longName || currentSymbol}
            </h2>
            <div un-text="sm gray-500">
              {currentData.chart.result[0].meta.exchangeName}
            </div>
          </div>
          <YahooCandleChart data={currentData} />
        </div>
      )}

      {!error && !isLoading && (!currentData || !currentData.chart?.result?.[0]) && (
        <div un-bg="yellow-50" un-border="~ yellow-200" un-rounded="lg" un-p="6">
          <h2 un-text="xl yellow-800" un-font="bold" un-mb="2">
            No Data Available
          </h2>
          <p un-text="yellow-700">
            No data found for symbol "{currentSymbol}". Try searching for a different stock.
          </p>
        </div>
      )}
    </div>
  );
}
