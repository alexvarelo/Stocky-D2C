import { useGetHistoricalDataApiV1StockTickerHistoryGet } from '@/api/stock/stock';
import type { HistoricalDataResponse } from '@/api/financialDataApi.schemas';
import { format } from '@/lib/dateFormat';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartDataPoint {
  date: string;
  close: number;
}

interface SimpleLineChartProps {
  ticker: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="text-sm text-muted-foreground">
          {format(new Date(label), 'MMM d, yyyy')}
        </p>
        <p className="font-medium">
          ${(payload[0].value as number).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function SimpleLineChart({ ticker, height = 200 }: SimpleLineChartProps) {
  const { data, isLoading } = useGetHistoricalDataApiV1StockTickerHistoryGet(
    ticker,
    { period: '1y' },
    { query: { enabled: !!ticker } }
  );

  if (isLoading) {
    return <Skeleton className="w-full" style={{ height: `${height}px` }} />;
  }

  // Check if we have valid data
  const responseData = data?.data as HistoricalDataResponse | undefined;
  const historicalData = responseData?.data || [];

  if (!historicalData.length) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-muted-foreground text-sm">No data available</p>
      </div>
    );
  }

  // Format the data for the chart
  const chartData: ChartDataPoint[] = historicalData.map((item) => ({
    date: item.date,
    close: item.close || 0
  }));

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            width={40}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="close"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
