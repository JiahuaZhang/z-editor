export namespace Yahoo {
  export type TradingPeriod = {
    timezone: string;
    end: number;
    start: number;
    gmtoffset: number;
  };

  export type Meta = {
    currency: string;
    symbol: string;
    exchangeName: string;
    fullExchangeName: string;
    instrumentType: string;
    firstTradeDate: number;
    regularMarketTime: number;
    hasPrePostMarketData: boolean;
    gmtoffset: number;
    timezone: string;
    exchangeTimezoneName: string;
    regularMarketPrice: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketVolume: number;
    longName: string;
    shortName: string;
    chartPreviousClose: number;
    priceHint: number;
    currentTradingPeriod: {
      pre: TradingPeriod;
      regular: TradingPeriod;
      post: TradingPeriod;
    };
    dataGranularity: string;
    range: string;
    validRanges: string[];
  };

  export type Quote = {
    volume: number[];
    low: number[];
    high: number[];
    close: number[];
    open: number[];
  };

  export type Indicators = {
    quote: Quote[];
    adjclose: { adjclose: number[]; }[];
  };

  export type Result = {
    meta: Meta;
    timestamp: number[];
    indicators: Indicators;
  };

  export type ChartResponse = {
    chart: {
      result: Result[];
      error: null | string;
    };
  };
}
