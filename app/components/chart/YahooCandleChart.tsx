import dayjs from 'dayjs';
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

export const YahooCandleChart = ({ data }: Props) => {
  const chartData = toChartData(data);

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
  const priceRange = maxPrice - minPrice + padding * 2;
  const maxVolume = Math.max(...chartData.map((d) => d.volume));

  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    const { open, close, high, low } = payload;

    const isGreen = close >= open;
    const color = isGreen ? '#16a34a' : '#dc2626';

    const priceToY = (price: number) => {
      const ratio = (maxPrice + padding - price) / priceRange;
      return y + ratio * height;
    };

    const yHigh = priceToY(high);
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
      <ResponsiveContainer width="100%" height="75%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
          <XAxis dataKey="displayTime" stroke="#666" fontSize={12} hide />
          <YAxis stroke="#666"
            fontSize={14}
            fontWeight={600}
            domain={[minPrice - padding, maxPrice + padding]}
            tickFormatter={(value) => `${value.toFixed(1)}`}
          />
          {tooltip}
          <Bar dataKey="high" shape={<CustomCandlestick />} />
          <Line type="monotone" dataKey="indicator.sma.50" stroke="#2563eb" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          <Line type="monotone" dataKey="indicator.sma.200" stroke="#9333ea" dot={false} strokeWidth={1.5} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height="25%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="4" stroke="#f0f0f0" />
          <XAxis dataKey="displayTime" stroke="#666" fontSize={12} />
          <YAxis stroke="#666"
            fontSize={12}
            domain={[0, maxVolume]}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value.toString();
            }}
          />
          <Bar dataKey="volume" shape={<CustomVolumeBar />} />
          {tooltip}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
