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
  YAxis
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
    bb?: {
      upper: number;
      middle: number;
      lower: number;
      width: number;
      squeeze: boolean;
    };
  };
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

const toChartData = (data: Yahoo.ChartResponse): ChartData[] => {
  if (!data?.chart?.result?.[0]) {
    return [];
  }

  const result = data.chart.result[0];
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

const tooltip = <Tooltip
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
            {data.indicator?.sma?.[50] && (
              <div un-flex="~" un-justify="between" un-text="blue-600">
                <span un-text="sm">SMA50:</span>
                <span un-text="sm">{data.indicator.sma[50].toFixed(3)}</span>
              </div>
            )}
            {data.indicator?.sma?.[200] && (
              <div un-flex="~" un-justify="between" un-text="purple-600">
                <span un-text="sm">SMA200:</span>
                <span un-text="sm">{data.indicator.sma[200].toFixed(3)}</span>
              </div>
            )}
            {data.indicator?.bb && (
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
            {data.indicator?.natr && (
              <div un-flex="~" un-justify="between" un-text="orange-600">
                <span un-text="sm">NATR:</span>
                <span un-text="sm">{data.indicator.natr.toFixed(3)}</span>
              </div>
            )}
            {data.indicator?.bb && (
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

// todo: rsi, vwap
export const YahooCandleChart = ({ data }: Props) => {
  const [hoveredChart, setHoveredChart] = useState<'price' | 'natr' | 'bbw' | 'volume' | ''>('');
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

  return (
    <div un-h="140">
      <ResponsiveContainer width="100%" height="50%">
        <ComposedChart
          data={chartData}
          syncId="yahoo-chart"
          onMouseMove={() => setHoveredChart('price')}
          onMouseLeave={() => setHoveredChart('')}
        >
          <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
          <XAxis dataKey="datetime" hide />
          <YAxis stroke="#666"
            fontSize={14}
            fontWeight={600}
            domain={[minPrice - padding, maxPrice + padding]}
            tickFormatter={(value) => `${value.toFixed(1)}`}
          />
          {hoveredChart === 'price' && tooltip}
          <Bar dataKey="high" shape={<CustomCandlestick />} />
          <Line type="monotone" dataKey="indicator.sma.50" stroke="#2563eb" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          <Line type="monotone" dataKey="indicator.sma.200" stroke="#9333ea" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          <Line type="monotone" dataKey="indicator.bb.upper" stroke="#0d9488" strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="indicator.bb.lower" stroke="#0d9488" strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="indicator.bb.middle" stroke="#0d9488" dot={false} strokeWidth={1} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height='15%'>
        <ComposedChart
          data={chartData}
          syncId="yahoo-chart"
          onMouseMove={() => setHoveredChart('natr')}
          onMouseLeave={() => setHoveredChart('')}
        >
          <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
          <XAxis dataKey="datetime" hide />
          <YAxis stroke="#666"
            fontSize={12}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${value.toFixed(2)}%`}
          />
          {hoveredChart === 'natr' && tooltip}
          <Line type="monotone" dataKey="indicator.natr" stroke="#ea580c" dot={false} strokeWidth={1.5} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height='15%'>
        <ComposedChart
          data={chartData}
          syncId="yahoo-chart"
          onMouseMove={() => setHoveredChart('bbw')}
          onMouseLeave={() => setHoveredChart('')}
        >
          <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
          <XAxis dataKey="datetime" hide />
          <YAxis stroke="#666"
            width={60}
            fontSize={12}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${value.toFixed(2)}`}
          />
          {hoveredChart === 'bbw' && tooltip}
          <Bar
            dataKey={(entry) => entry.indicator?.bb?.squeeze ? entry.indicator.bb.width : 0}
            fill="#f472b6"
            barSize={2}
            isAnimationActive={false}
          />
          <Line type="monotone" dataKey="indicator.bb.width" stroke="#06b6d4" dot={false} strokeWidth={1.5} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height="20%">
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
          {hoveredChart === 'volume' && tooltip}
          <Bar dataKey="volume" shape={<CustomVolumeBar />} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
