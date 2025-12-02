import { StockSymbolSearch } from '~/components/invest/StockSymbolSearch';
import { YahooOptionChart } from '~/components/invest/YahooOptionChart';
import type { Route } from './+types/invest.option';

async function fetchOptionData(request: Request, symbol: string, date?: string) {
  const baseUrl = new URL(request.url).origin;
  const url = `${baseUrl}/api/yahoo/v7/finance/options/${encodeURIComponent(symbol)}${date ? `?date=${date}` : ''}`;
  const response = await fetch(url);
  return response.json();
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol') || 'NVDA';
  const date = url.searchParams.get('date');

  try {
    const data = await fetchOptionData(request, symbol, date || undefined);

    return {
      data,
      symbol,
      error: null,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      data: null,
      symbol,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export default function OptionPage({ loaderData }: Route.ComponentProps) {
  const { data, symbol, error } = loaderData;

  const result = data?.optionChain?.result?.[0];

  return (
    <div un-max-w="7xl" un-mx="auto" un-pb='8'>
      <StockSymbolSearch un-mb='2' basePath="/invest/option" />

      {error && (
        <div un-bg="red-50" un-border="~ red-200" un-rounded="lg" un-p="6" un-mb="6">
          <h2 un-text="xl red-800" un-font="bold" un-mb="2">Error Loading Data</h2>
          <p un-text="red-600">{error}</p>
        </div>
      )}

      {!error && result ? (
        <YahooOptionChart data={result} />
      ) : (
        !error && (
          <div un-text="center gray-500" un-py="12">
            No data available...
          </div>
        )
      )}
    </div>
  );
}
