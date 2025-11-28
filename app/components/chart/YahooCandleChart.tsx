import dayjs from 'dayjs';
import { useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Cell
} from 'recharts';
import type { Yahoo } from '~/types/YahooFinance';

type ChartData = {
  datetime: string;
  displayTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  indicator?: {
    sma?: Record<number, number | null>;
    atr?: number;
    natr?: number;
    adr?: number;
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bb?: {
      upper: number;
      middle: number;
      lower: number;
      width: number;
      squeeze: boolean;
    };
    donchian?: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
};

export type ChartConfig = {
  sma50: boolean;
  sma200: boolean;
  natr: boolean;
  bbBand: boolean;
  bbWidth: boolean;
  volume: boolean;
  donchian: boolean;
  adr: boolean;
  rsi: boolean;
  macd: boolean;
};

type Props = { data: Yahoo.ChartResponse; };

export const addSMA = (data: ChartData[], period: number) => {
  const sums = new Array(data.length).fill(null);
  sums[0] = data[0].close;
  for (let i = 1; i < period; i++) {
    sums[i] = sums[i - 1] + data[i].close;
  }
  for (let i = period; i < data.length; i++) {
    sums[i] = sums[i - 1] + data[i].close - data[i - period].close;
  }

  for (let i = period - 1; i < data.length; i++) {
    const item = data[i];
    if (!item.indicator) {
      item.indicator = {};
    }
    if (!item.indicator.sma) {
      item.indicator.sma = {};
    }
    item.indicator.sma[period] = sums[i] / period;
  }

  return data;
};

export const addVolatility = (data: ChartData[], range = 14) => {
  const trueRanges = new Array(data.length).fill(0);

  trueRanges[0] = data[0].high - data[0].low;
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 1];

    const hl = current.high - current.low;
    const hpc = Math.abs(current.high - prev.close);
    const lpc = Math.abs(current.low - prev.close);
    trueRanges[i] = Math.max(hl, hpc, lpc);
  }

  let currentSum = 0;
  for (let i = 0; i < range - 1; i++) {
    currentSum += trueRanges[i];
  }

  for (let i = range - 1; i < data.length; i++) {
    currentSum += trueRanges[i];

    const atr = currentSum / range;
    const item = data[i];
    if (!item.indicator) {
      item.indicator = {};
    }
    item.indicator.atr = atr;
    item.indicator.natr = (atr / item.close) * 100;

    currentSum -= trueRanges[i - range + 1];
  }

  return data;
};

export const addBollinger = (data: ChartData[], period = 20, stdDev = 2) => {
  const closes = data.map(d => d.close);
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  // Calculate ATR for Keltner Channels (Standard Squeeze uses 20 period, 1.5 multiplier usually)
  // We need TR first
  const trs = new Array(data.length).fill(0);
  trs[0] = highs[0] - lows[0];
  for (let i = 1; i < data.length; i++) {
    const hl = highs[i] - lows[i];
    const hpc = Math.abs(highs[i] - closes[i - 1]);
    const lpc = Math.abs(lows[i] - closes[i - 1]);
    trs[i] = Math.max(hl, hpc, lpc);
  }

  // Calculate SMA of TR for ATR
  // Simple SMA for ATR here to match standard KC calculation often used in Squeeze
  const atrs = new Array(data.length).fill(0);
  let trSum = 0;
  for (let i = 0; i < period; i++) {
    trSum += trs[i];
  }
  atrs[period - 1] = trSum / period;
  for (let i = period; i < data.length; i++) {
    trSum = trSum + trs[i] - trs[i - period];
    atrs[i] = trSum / period;
  }

  for (let i = period - 1; i < data.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;

    const squaredDiffs = slice.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const sd = Math.sqrt(variance);

    const upper = mean + (sd * stdDev);
    const lower = mean - (sd * stdDev);
    const width = (upper - lower) / mean;

    // Keltner Channels for Squeeze
    // KC Middle is usually EMA, but SMA is also common. Let's use SMA(20) which is 'mean' here.
    // KC Multiplier is usually 1.5
    const kcUpper = mean + (1.5 * atrs[i]);
    const kcLower = mean - (1.5 * atrs[i]);

    // Squeeze is ON when BB is inside KC
    const squeeze = upper < kcUpper && lower > kcLower;

    if (!data[i].indicator) data[i].indicator = {};
    data[i].indicator!.bb = {
      upper,
      middle: mean,
      lower,
      width: width * 100, // Percentage
      squeeze
    };
  }
  return data;
};

export const addDonchian = (data: ChartData[], period = 20) => {
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  for (let i = period - 1; i < data.length; i++) {
    const sliceHighs = highs.slice(i - period + 1, i + 1);
    const sliceLows = lows.slice(i - period + 1, i + 1);

    const upper = Math.max(...sliceHighs);
    const lower = Math.min(...sliceLows);
    const middle = (upper + lower) / 2;

    if (!data[i].indicator) data[i].indicator = {};
    data[i].indicator!.donchian = {
      upper,
      middle,
      lower
    };
  }
  return data;
};

export const addADR = (data: ChartData[], period = 20) => {
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const ranges = highs.map((h, i) => h - lows[i]);

  for (let i = period - 1; i < data.length; i++) {
    const slice = ranges.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    const adr = sum / period;

    if (!data[i].indicator) data[i].indicator = {};
    data[i].indicator!.adr = adr;
  }
  return data;
};

export const addRSI = (data: ChartData[], period = 14) => {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i].close;
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    let gain = 0;
    let loss = 0;

    if (change > 0) {
      gain = change;
    } else {
      loss = -change;
    }

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    let rs = 0;
    if (avgLoss !== 0) {
      rs = avgGain / avgLoss;
    } else {
      rs = avgGain === 0 ? 0 : 100; // Handle division by zero
    }

    const rsi = 100 - (100 / (1 + rs));

    if (!data[i].indicator) data[i].indicator = {};
    data[i].indicator!.rsi = rsi;
  }
  return data;
};

export const getEMA = (data: number[], period: number) => {
  const k = 2 / (period + 1);
  const emaArray = new Array<number | null>(data.length).fill(null);

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  emaArray[period - 1] = sum / period;

  for (let i = period; i < data.length; i++) {
    emaArray[i] = (data[i] * k) + (emaArray[i - 1]! * (1 - k));
  }
  return emaArray;
};

export const addMACD = (data: ChartData[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const closes = data.map(d => d.close);
  const fastEMA = getEMA(closes, fastPeriod);
  const slowEMA = getEMA(closes, slowPeriod);

  const macdLine = new Array<number | null>(data.length).fill(null);
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine[i] = fastEMA[i]! - slowEMA[i]!;
    }
  }

  const validMacdIndices: number[] = [];
  const validMacdValues: number[] = [];
  macdLine.forEach((val, idx) => {
    if (val !== null) {
      validMacdIndices.push(idx);
      validMacdValues.push(val);
    }
  });

  const signalLineValues = getEMA(validMacdValues, signalPeriod);

  for (let i = 0; i < validMacdIndices.length; i++) {
    const signal = signalLineValues[i];
    if (signal === null) continue;

    const idx = validMacdIndices[i];
    const macd = validMacdValues[i];
    const histogram = macd - signal;

    if (!data[idx].indicator) data[idx].indicator = {};
    data[idx].indicator!.macd = {
      macd,
      signal,
      histogram
    };
  }

  return data;
};

export const toChartData = (yahooData: Yahoo.ChartResponse): ChartData[] => {
  if (!yahooData?.chart?.result?.[0]) {
    return [];
  }

  const result = yahooData.chart.result[0];
  const { timestamp, indicators } = result;

  if (!timestamp || !indicators?.quote?.[0]) {
    return [];
  }

  const quote = indicators.quote[0];

  const chartData = timestamp.map((ts, index) => ({
    datetime: dayjs.unix(ts).format('YYYY-MM-DD HH:mm:ss'),
    displayTime: dayjs.unix(ts).format('M/D'),
    open: quote.open[index],
    high: quote.high[index],
    low: quote.low[index],
    close: quote.close[index],
    volume: quote.volume[index],
  }));

  addSMA(chartData, 50);
  addSMA(chartData, 200);
  addVolatility(chartData);
  addBollinger(chartData);
  addDonchian(chartData);
  addADR(chartData);
  addRSI(chartData);
  addMACD(chartData);

  return chartData;
};

const CustomVolumeBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#16a34a80' : '#dc262680';

  return <rect x={x} y={y} width={width} height={height} fill={color} />;
};

const tooltip = (config: ChartConfig) => <Tooltip
  wrapperStyle={{ zIndex: 1 }}
  content={({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div un-bg="white" un-p="3" un-border="~ gray-200" un-rounded="lg">
          <p un-font="bold" un-mb="1">
            {data.datetime}
          </p>
          <div un-flex="~ col" un-gap="0.5">
            <div un-flex="~" un-justify="between">
              <span un-text="sm">Open:</span>
              <span un-text="sm">{data.open.toFixed(3)}</span>
            </div>
            <div un-flex="~" un-justify="between">
              <span un-text="sm">High:</span>
              <span un-text="sm">{data.high.toFixed(3)}</span>
            </div>
            <div un-flex="~" un-justify="between">
              <span un-text="sm">Low:</span>
              <span un-text="sm">{data.low.toFixed(3)}</span>
            </div>
            <div un-flex="~" un-justify="between">
              <span un-text="sm">Close:</span>
              <span un-text="sm">{data.close.toFixed(3)}</span>
            </div>
            {config.sma50 && data.indicator?.sma?.[50] && (
              <div un-flex="~" un-justify="between" un-text="blue-600">
                <span un-text="sm">SMA50:</span>
                <span un-text="sm">{data.indicator.sma[50].toFixed(3)}</span>
              </div>
            )}
            {config.sma200 && data.indicator?.sma?.[200] && (
              <div un-flex="~" un-justify="between" un-text="purple-600">
                <span un-text="sm">SMA200:</span>
                <span un-text="sm">{data.indicator.sma[200].toFixed(3)}</span>
              </div>
            )}
            {config.bbBand && data.indicator?.bb && (
              <>
                <div un-flex="~" un-justify="between" un-text="teal-600">
                  <span un-text="sm">BB Upper:</span>
                  <span un-text="sm">{data.indicator.bb.upper.toFixed(3)}</span>
                </div>
                <div un-flex="~" un-justify="between" un-text="teal-600">
                  <span un-text="sm">BB Lower:</span>
                  <span un-text="sm">{data.indicator.bb.lower.toFixed(3)}</span>
                </div>
              </>
            )}
            {config.donchian && data.indicator?.donchian && (
              <>
                <div un-flex="~" un-justify="between" un-text="orange-500">
                  <span un-text="sm">DC Upper:</span>
                  <span un-text="sm">{data.indicator.donchian.upper.toFixed(3)}</span>
                </div>
                <div un-flex="~" un-justify="between" un-text="orange-500">
                  <span un-text="sm">DC Lower:</span>
                  <span un-text="sm">{data.indicator.donchian.lower.toFixed(3)}</span>
                </div>
              </>
            )}
            {config.natr && data.indicator?.natr && (
              <div un-flex="~" un-justify="between" un-text="orange-600">
                <span un-text="sm">NATR:</span>
                <span un-text="sm">{data.indicator.natr.toFixed(3)}</span>
              </div>
            )}
            {config.adr && data.indicator?.adr && (
              <div un-flex="~" un-justify="between" un-text="indigo-500">
                <span un-text="sm">ADR:</span>
                <span un-text="sm">{data.indicator.adr.toFixed(3)}</span>
              </div>
            )}
            {config.rsi && data.indicator?.rsi && (
              <div un-flex="~" un-justify="between" un-text="fuchsia-600">
                <span un-text="sm">RSI:</span>
                <span un-text="sm">{data.indicator.rsi.toFixed(2)}</span>
              </div>
            )}
            {config.macd && data.indicator?.macd && (
              <>
                <div un-flex="~" un-justify="between" un-text="blue-500">
                  <span un-text="sm">MACD:</span>
                  <span un-text="sm">{data.indicator.macd.macd.toFixed(3)}</span>
                </div>
                <div un-flex="~" un-justify="between" un-text="orange-500">
                  <span un-text="sm">Signal:</span>
                  <span un-text="sm">{data.indicator.macd.signal.toFixed(3)}</span>
                </div>
                <div un-flex="~" un-justify="between" un-text={data.indicator.macd.histogram >= 0 ? 'green-500' : 'red-500'}>
                  <span un-text="sm">Hist:</span>
                  <span un-text="sm">{data.indicator.macd.histogram.toFixed(3)}</span>
                </div>
              </>
            )}
            {config.bbWidth && data.indicator?.bb && (
              <div un-flex="~" un-justify="between" un-text="cyan-600">
                <span un-text="sm">BBW:</span>
                <span un-text="sm">
                  {data.indicator.bb.width.toFixed(3)}
                  {data.indicator.bb.squeeze && <span un-text="red-500" un-ml="1">(Squeeze)</span>}
                </span>
              </div>
            )}
          </div>
          <p un-text="sm" un-mt="1">
            Vol: {data.volume.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  }}
/>;

// todo: vwap
export const YahooCandleChart = ({ data }: Props) => {
  const [hoveredChart, setHoveredChart] = useState<'price' | 'natr' | 'bbw' | 'adr' | 'rsi' | 'macd' | 'volume' | ''>('');
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<ChartConfig>({
    sma50: false,
    sma200: false,
    natr: false,
    bbBand: false,
    bbWidth: false,
    volume: true,
    donchian: false,
    adr: false,
    rsi: false,
    macd: false,
  });

  const chartData = toChartData(data).slice(200);

  if (chartData.length === 0) {
    return (
      <div un-flex="~ items-center justify-center" un-h="140" un-bg="gray-50" un-rounded="lg">
        <p un-text="gray-500">No chart data available</p>
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map((d) => d.low));
  const maxPrice = Math.max(...chartData.map((d) => d.high));
  const padding = (maxPrice - minPrice) * 0.05;
  const domainMin = minPrice - padding;
  const maxVolume = Math.max(...chartData.map((d) => d.volume));

  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    const { open, close, high, low } = payload;

    const isGreen = close >= open;
    const color = isGreen ? '#16a34a' : '#dc2626';
    const range = high - domainMin;
    const ratio = range > 0 ? height / range : 0;

    const priceToY = (price: number) => {
      return y + (high - price) * ratio;
    };

    const yHigh = y;
    const yLow = priceToY(low);
    const yOpen = priceToY(open);
    const yClose = priceToY(close);

    const bodyTop = Math.min(yOpen, yClose);
    const bodyBottom = Math.max(yOpen, yClose);
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

    return (
      <g>
        <line
          x1={x + width / 2}
          y1={yHigh}
          x2={x + width / 2}
          y2={yLow}
          stroke={color}
          strokeWidth={1}
        />
        <rect x={x} y={bodyTop} width={width} height={bodyHeight} fill={color} />
      </g>
    );
  };

  const volumeHeight = config.volume ? 20 : 0;
  const natrHeight = config.natr ? 15 : 0;
  const bbwHeight = config.bbWidth ? 15 : 0;
  const adrHeight = config.adr ? 15 : 0;
  const rsiHeight = config.rsi ? 15 : 0;
  const macdHeight = config.macd ? 20 : 0;
  const priceHeight = 100 - volumeHeight - natrHeight - bbwHeight - adrHeight - rsiHeight - macdHeight;

  return (
    <div un-flex="~ col" un-h="140">
      <div un-flex="~ justify-end" un-mb="1" un-relative="~">
        <button
          onClick={() => setShowConfig(!showConfig)}
          un-flex='~' un-p="1" un-border="~ rounded gray-200" un-hover="bg-gray-50" un-text="gray-600"
        >
          <span className="i-mdi:cog" un-text="lg" un-cursor='pointer' />
        </button>
        {showConfig && (
          <div un-absolute="~" un-top="full" un-right="0" un-mt="1" un-bg="white" un-p="3" un-border="~ rounded gray-200" un-shadow="xl" un-w="64" un-z="50">
            <div un-flex="~ col gap-2">
              <div un-flex="~ gap-2" un-justify="end" un-mb="1">
                <button
                  un-text="xs blue-600 hover:blue-700"
                  onClick={() => setConfig(prev => {
                    const newConfig = Object.keys(prev).reduce((acc, key) => {
                      acc[key as keyof ChartConfig] = true;
                      return acc;
                    }, {} as ChartConfig);
                    return newConfig;
                  })}
                >
                  All
                </button>
                <span un-text="gray-300">|</span>
                <button
                  un-text="xs gray-500 hover:gray-700"
                  onClick={() => setConfig(prev => {
                    const newConfig = Object.keys(prev).reduce((acc, key) => {
                      acc[key as keyof ChartConfig] = false;
                      return acc;
                    }, {} as ChartConfig);
                    return newConfig;
                  })}
                >
                  None
                </button>
              </div>
              <div un-flex="~ items-center justify-between">
                <span un-text="sm font-semibold gray-700">SMA</span>
                <div un-flex="~ gap-3">
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-blue-600">
                    <input type="checkbox" checked={config.sma50} onChange={(e) => setConfig({ ...config, sma50: e.target.checked })} un-accent="blue-600" />
                    50
                  </label>
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-purple-600">
                    <input type="checkbox" checked={config.sma200} onChange={(e) => setConfig({ ...config, sma200: e.target.checked })} un-accent="purple-600" />
                    200
                  </label>
                </div>
              </div>
              <div un-h="1px" un-bg="gray-100" />
              <div un-flex="~ items-center justify-between">
                <span un-text="sm font-semibold gray-700">ATR</span>
                <div un-flex="~ gap-3">
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-orange-600">
                    <input type="checkbox" checked={config.natr} onChange={(e) => setConfig({ ...config, natr: e.target.checked })} un-accent="orange-600" />
                    NATR
                  </label>
                </div>
              </div>
              <div un-h="1px" un-bg="gray-100" />
              <div un-flex="~ items-center justify-between">
                <span un-text="sm font-semibold gray-700">Bollinger</span>
                <div un-flex="~ gap-3">
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-teal-600">
                    <input type="checkbox" checked={config.bbBand} onChange={(e) => setConfig({ ...config, bbBand: e.target.checked })} un-accent="teal-600" />
                    Band
                  </label>
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-cyan-600">
                    <input type="checkbox" checked={config.bbWidth} onChange={(e) => setConfig({ ...config, bbWidth: e.target.checked })} un-accent="cyan-600" />
                    Width
                  </label>
                </div>
              </div>
              <div un-h="1px" un-bg="gray-100" />
              <div un-flex="~ items-center justify-between">
                <span un-text="sm font-semibold gray-700">Donchian</span>
                <div un-flex="~ gap-3">
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-orange-500">
                    <input type="checkbox" checked={config.donchian} onChange={(e) => setConfig({ ...config, donchian: e.target.checked })} un-accent="orange-500" />
                    Show
                  </label>
                </div>
              </div>
              <div un-h="1px" un-bg="gray-100" />
              <div un-flex="~ items-center justify-between">
                <span un-text="sm font-semibold gray-700">ADR</span>
                <div un-flex="~ gap-3">
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-indigo-500">
                    <input type="checkbox" checked={config.adr} onChange={(e) => setConfig({ ...config, adr: e.target.checked })} un-accent="indigo-500" />
                    Show
                  </label>
                </div>
              </div>
              <div un-h="1px" un-bg="gray-100" />
              <div un-flex="~ items-center justify-between">
                <span un-text="sm font-semibold gray-700">RSI</span>
                <div un-flex="~ gap-3">
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-fuchsia-600">
                    <input type="checkbox" checked={config.rsi} onChange={(e) => setConfig({ ...config, rsi: e.target.checked })} un-accent="fuchsia-600" />
                    Show
                  </label>
                </div>
              </div>
              <div un-h="1px" un-bg="gray-100" />
              <div un-flex="~ items-center justify-between">
                <span un-text="sm font-semibold gray-700">MACD</span>
                <div un-flex="~ gap-3">
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-blue-500">
                    <input type="checkbox" checked={config.macd} onChange={(e) => setConfig({ ...config, macd: e.target.checked })} un-accent="blue-500" />
                    Show
                  </label>
                </div>
              </div>
              <div un-h="1px" un-bg="gray-100" />
              <div un-flex="~ items-center justify-between">
                <span un-text="sm font-semibold gray-700">Volume</span>
                <div un-flex="~ gap-3">
                  <label un-flex="~ items-center gap-1.5 text-sm cursor-pointer hover:text-gray-600">
                    <input type="checkbox" checked={config.volume} onChange={(e) => setConfig({ ...config, volume: e.target.checked })} un-accent="gray-600" />
                    Show
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div un-flex="~ col 1" un-min-h="0">
        <ResponsiveContainer width="100%" height={`${priceHeight}%`}>
          <ComposedChart
            data={chartData}
            syncId="yahoo-chart"
            onMouseMove={() => setHoveredChart('price')}
            onMouseLeave={() => setHoveredChart('')}
          >
            <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
            <XAxis
              dataKey="datetime"
              hide={config.natr || config.bbWidth || config.adr || config.rsi || config.macd || config.volume}
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => dayjs(value).format('M/D')}
            />
            <YAxis stroke="#666"
              fontSize={14}
              fontWeight={600}
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            {hoveredChart === 'price' && tooltip(config)}
            <Bar dataKey="high" shape={<CustomCandlestick />} />
            {config.sma50 && <Line type="monotone" dataKey="indicator.sma.50" stroke="#2563eb" dot={false} strokeWidth={1.5} isAnimationActive={false} />}
            {config.sma200 && <Line type="monotone" dataKey="indicator.sma.200" stroke="#9333ea" dot={false} strokeWidth={1.5} isAnimationActive={false} />}
            {config.bbBand && (
              <>
                <Line type="monotone" dataKey="indicator.bb.upper" stroke="#0d9488" strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="indicator.bb.lower" stroke="#0d9488" strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="indicator.bb.middle" stroke="#0d9488" dot={false} strokeWidth={1} isAnimationActive={false} />
              </>
            )}
            {config.donchian && (
              <>
                <Line type="monotone" dataKey="indicator.donchian.upper" stroke="#f97316" strokeDasharray="5 5" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="indicator.donchian.lower" stroke="#f97316" strokeDasharray="5 5" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="indicator.donchian.middle" stroke="#f97316" dot={false} strokeWidth={1} isAnimationActive={false} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {config.natr && (
          <ResponsiveContainer width="100%" height={`${natrHeight}%`}>
            <ComposedChart
              data={chartData}
              syncId="yahoo-chart"
              onMouseMove={() => setHoveredChart('natr')}
              onMouseLeave={() => setHoveredChart('')}
            >
              <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
              <XAxis
                dataKey="datetime"
                hide={config.bbWidth || config.adr || config.rsi || config.macd || config.volume}
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => dayjs(value).format('M/D')}
              />
              <YAxis stroke="#666"
                fontSize={12}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value.toFixed(2)}%`}
              />
              {hoveredChart === 'natr' && tooltip(config)}
              <Line type="monotone" dataKey="indicator.natr" stroke="#ea580c" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {config.bbWidth && (
          <ResponsiveContainer width="100%" height={`${bbwHeight}%`}>
            <ComposedChart
              data={chartData}
              syncId="yahoo-chart"
              onMouseMove={() => setHoveredChart('bbw')}
              onMouseLeave={() => setHoveredChart('')}
            >
              <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
              <XAxis
                dataKey="datetime"
                hide={config.adr || config.rsi || config.macd || config.volume}
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => dayjs(value).format('M/D')}
              />
              <YAxis stroke="#666"
                fontSize={12}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value.toFixed(2)}`}
              />
              {hoveredChart === 'bbw' && tooltip(config)}
              <Bar
                dataKey={(entry) => entry.indicator?.bb?.squeeze ? entry.indicator.bb.width : 0}
                fill="#f472b6"
                barSize={2}
                isAnimationActive={false}
              />
              <Line type="monotone" dataKey="indicator.bb.width" stroke="#06b6d4" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {config.adr && (
          <ResponsiveContainer width="100%" height={`${adrHeight}%`}>
            <ComposedChart
              data={chartData}
              syncId="yahoo-chart"
              onMouseMove={() => setHoveredChart('adr')}
              onMouseLeave={() => setHoveredChart('')}
            >
              <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
              <XAxis
                dataKey="datetime"
                hide={config.rsi || config.macd || config.volume}
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => dayjs(value).format('M/D')}
              />
              <YAxis stroke="#666"
                fontSize={12}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value.toFixed(2)}`}
              />
              {hoveredChart === 'adr' && tooltip(config)}
              <Line type="monotone" dataKey="indicator.adr" stroke="#6366f1" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {config.rsi && (
          <ResponsiveContainer width="100%" height={`${rsiHeight}%`}>
            <ComposedChart
              data={chartData}
              syncId="yahoo-chart"
              onMouseMove={() => setHoveredChart('rsi')}
              onMouseLeave={() => setHoveredChart('')}
            >
              <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
              <XAxis
                dataKey="datetime"
                hide={config.volume}
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => dayjs(value).format('M/D')}
              />
              <YAxis stroke="#666"
                fontSize={12}
                domain={[0, 100]}
                ticks={[30, 70]}
              />
              {hoveredChart === 'rsi' && tooltip(config)}
              <Line type="monotone" dataKey="indicator.rsi" stroke="#c026d3" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              <ReferenceLine y={70} stroke="#c026d3" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#c026d3" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {config.macd && (
          <ResponsiveContainer width="100%" height={`${macdHeight}%`}>
            <ComposedChart
              data={chartData}
              syncId="yahoo-chart"
              onMouseMove={() => setHoveredChart('macd')}
              onMouseLeave={() => setHoveredChart('')}
            >
              <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
              <XAxis
                dataKey="datetime"
                hide={config.volume}
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => dayjs(value).format('M/D')}
              />
              <YAxis stroke="#666"
                fontSize={12}
                domain={['auto', 'auto']}
              />
              {hoveredChart === 'macd' && tooltip(config)}
              <Bar dataKey="indicator.macd.histogram" fill="#22c55e" isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.indicator?.macd?.histogram && entry.indicator.macd.histogram >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="indicator.macd.macd" stroke="#3b82f6" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              <Line type="monotone" dataKey="indicator.macd.signal" stroke="#f97316" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {config.volume && (
          <ResponsiveContainer width="100%" height={`${volumeHeight}%`}>
            <ComposedChart
              data={chartData}
              syncId="yahoo-chart"
              onMouseMove={() => setHoveredChart('volume')}
              onMouseLeave={() => setHoveredChart('')}
            >
              <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
              <XAxis
                dataKey="datetime"
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => dayjs(value).format('M/D')}
              />
              <YAxis stroke="#666"
                fontSize={12}
                domain={[0, maxVolume]}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toString();
                }}
              />
              {hoveredChart === 'volume' && tooltip(config)}
              <Bar dataKey="volume" shape={<CustomVolumeBar />} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
