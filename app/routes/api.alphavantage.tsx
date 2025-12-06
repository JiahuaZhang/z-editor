import { authenticate } from '~/service/session.server';
import type { Route } from './+types/api.yahoo.$';

const BASE_URL = 'https://www.alphavantage.co/query';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  if (process.env.NODE_ENV !== 'development') {
    await authenticate(request);
  }

  const apiUrl = new URL(BASE_URL);

  const apiKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;
  if (apiKey) {
    apiUrl.searchParams.append('apikey', apiKey);
  }

  url.searchParams.forEach((value, key) => {
    apiUrl.searchParams.append(key, value);
  });

  const response = await fetch(apiUrl);
  return response.json();
};
