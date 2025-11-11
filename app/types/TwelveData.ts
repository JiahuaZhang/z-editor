export namespace TwelveData {
  export type Meta = {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
    mic_code: string;
    type: string;
  };

  export type Value = {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  };

  export type TimeSeriesResponse = {
    meta: Meta;
    values: Value[];
    status: string;
  };
}
