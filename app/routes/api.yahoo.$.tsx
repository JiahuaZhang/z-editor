import yahooData from '~/data/yahoo.ndx.json';
import { authenticate } from '~/service/session.server';
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
  url.searchParams.forEach((value, key) => {
    apiUrl.searchParams.append(key, value);
  });

  const response = await fetch(apiUrl);
  return response.json();
};
