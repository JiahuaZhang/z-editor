let cachedCrumb: string | null = null;
let cachedCookie: string | null = null;

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

      const response2 = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
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
  }
};
