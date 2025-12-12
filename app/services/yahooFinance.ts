let cachedCrumb: string | null = null;
let cachedCookie: string | null = null;

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com';

export const YahooFinanceService = {
  async getCrumb(forceRefresh = false): Promise<string | null> {
    if (cachedCrumb && !forceRefresh) {
      return cachedCrumb;
    }

    try {
      const response1 = await fetch('https://fc.yahoo.com', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const cookies = response1.headers.getSetCookie ? response1.headers.getSetCookie().map(c => c.split(';')[0]).join('; ') : response1.headers.get('set-cookie');

      if (!cookies) {
        console.error('Failed to get cookies from Yahoo');
        return null;
      }
      cachedCookie = cookies;

      const response2 = await fetch(`${YAHOO_BASE_URL}/v1/test/getcrumb`, {
        headers: {
          'Cookie': cookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const crumb = await response2.text();
      if (!crumb) {
        console.error('Failed to get crumb from Yahoo');
        return null;
      }

      cachedCrumb = crumb;
      return crumb;
    } catch (error) {
      console.error('Error fetching Yahoo crumb:', error);
      return null;
    }
  },

  getCookie() {
    return cachedCookie;
  },

  async fetchChart(symbol: string, interval = '1d', range = '2y') {
    const url = `${YAHOO_BASE_URL}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const response = await fetch(url, {
      headers: {
        'Cookie': cachedCookie ?? ''
      }
    });
    return response.json();
  },

  async fetchOptions(symbol: string, date?: string) {
    const apiUrl = new URL(`${YAHOO_BASE_URL}/v7/finance/options/${encodeURIComponent(symbol)}`);

    // Options endpoint requires crumb
    const crumb = await this.getCrumb();
    if (crumb) {
      apiUrl.searchParams.set('crumb', crumb);
    }

    if (date) {
      apiUrl.searchParams.set('date', date);
    }

    let response = await fetch(apiUrl, {
      headers: {
        'Cookie': cachedCookie ?? ''
      }
    });

    let data = await response.json();

    // Retry with fresh crumb if invalid
    if (data?.finance?.error?.description === 'Invalid Crumb') {
      console.error('Invalid Crumb detected, refreshing...');
      const newCrumb = await this.getCrumb(true);
      if (newCrumb) {
        apiUrl.searchParams.set('crumb', newCrumb);
        response = await fetch(apiUrl, {
          headers: {
            'Cookie': cachedCookie ?? ''
          }
        });
        data = await response.json();
      }
    }

    return data;
  }
};
