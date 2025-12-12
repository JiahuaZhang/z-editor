const BASE_URL = 'https://www.alphavantage.co/query';

export const AlphaVantageService = {
  async fetchNewsSentiment(params: {
    topics?: string | null;
    tickers?: string | null;
    sort?: string;
    limit?: string;
  }) {
    const apiUrl = new URL(BASE_URL);

    const apiKey = process.env.VITE_ALPHA_VANTAGE_API_KEY;
    if (apiKey) {
      apiUrl.searchParams.append('apikey', apiKey);
    }

    apiUrl.searchParams.append('function', 'NEWS_SENTIMENT');
    apiUrl.searchParams.append('sort', params.sort || 'LATEST');
    apiUrl.searchParams.append('limit', params.limit || '50');

    if (params.tickers) {
      apiUrl.searchParams.append('tickers', params.tickers);
    } else if (params.topics) {
      apiUrl.searchParams.append('topics', params.topics);
    } else {
      apiUrl.searchParams.append('topics', 'technology');
    }

    const response = await fetch(apiUrl);
    return response.json();
  }
};
