import futureData from '~/data/future.json';
import { authenticate } from '~/service/session.server';
import type { Route } from './+types/api.twelve-data.$';

const TWELVE_DATA_API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY || '';
const BASE_URL = 'https://api.twelvedata.com';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  if (process.env.NODE_ENV === 'development') {
    if (url.searchParams.get('symbol') === 'SPY') {
      return futureData;
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
  apiUrl.searchParams.append('apikey', TWELVE_DATA_API_KEY);

  const response = await fetch(apiUrl);
  return response.json();
};
