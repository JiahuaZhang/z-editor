import yahooData from '~/data/yahoo.ndx.json';
import { authenticate } from '~/service/session.server';
import { YahooFinanceService } from '~/services/yahooFinance';
import type { Route } from './+types/api.yahoo.$';

const BASE_URL = 'https://query1.finance.yahoo.com';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  if (process.env.NODE_ENV === 'development' && false) {
    if (url.searchParams.get('symbol') === '^NDX') {
      return yahooData;
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    await authenticate(request);
  }

  const endpoint = params['*'];
  const apiUrl = new URL(`${BASE_URL}/${endpoint}`);

  if (endpoint?.includes('v7/finance/options')) {
    const crumb = await YahooFinanceService.getCrumb();
    if (crumb) {
      apiUrl.searchParams.set('crumb', crumb);
    }
  }

  url.searchParams.forEach((value, key) => {
    apiUrl.searchParams.append(key, value);
  });

  let response = await fetch(apiUrl, {
    headers: {
      'Cookie': YahooFinanceService.getCookie() ?? ''
    }
  });

  let data = await response.json();

  if (endpoint?.includes('v7/finance/options') && data?.finance?.error?.description === 'Invalid Crumb') {
    console.error('Invalid Crumb detected, refreshing...');
    const newCrumb = await YahooFinanceService.getCrumb(true);
    if (newCrumb) {
      apiUrl.searchParams.set('crumb', newCrumb);
      response = await fetch(apiUrl, {
        headers: {
          'Cookie': YahooFinanceService.getCookie() || ''
        }
      });
      data = await response.json();
    }
  }

  return data;
};
