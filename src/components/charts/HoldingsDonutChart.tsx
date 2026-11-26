import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCustomerHoldings } from '@/api/portfolio/useCustomerHoldings';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDecimal } from '@/lib/formatters';
import { PortfolioHolding } from '@/types/portfolio';
import { CompanyLogo } from '@/components/stock/CompanyLogo';
import { useTranslation } from 'react-i18next';

const COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#E11D48', '#F59E0B',
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F97316', '#06B6D4', '#6366F1', '#A855F7', '#F472B6',
  '#F87171', '#60A5FA', '#A78BFA', '#F472B6', '#F87171'
];

interface ChartEntry {
  name: string;
  value: number;
  quantity: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ChartEntry }[] }) => {
  const { t } = useTranslation('dashboard');
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm">{t('donut.value', { value: formatCurrency(data.value) })}</p>
        <p className="text-sm">{t('donut.shares', { count: data.quantity })}</p>
      </div>
    );
  }
  return null;
};

export const HoldingsDonutChart = () => {
  const { data: holdings, isLoading, error } = useCustomerHoldings({ includeMarketData: false });
  const { t } = useTranslation('dashboard');

  // Generate a consistent color for each symbol
  const getColorForSymbol = (symbol: string) => {
    // Simple hash function to generate a consistent index
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
  };

  // Transform holdings data for the chart
  const chartData = React.useMemo(() => {
    if (!holdings) return [];
    
    // Sort holdings by value (descending) to ensure consistent ordering
    const sortedHoldings = [...holdings].sort((a, b) => 
      (b.currentValue || 0) - (a.currentValue || 0)
    );
    
    return sortedHoldings.map((holding: PortfolioHolding) => ({
      name: holding.symbol,
      value: holding.quantity * holding.averagePrice,
      quantity: holding.quantity,
      color: getColorForSymbol(holding.symbol),
    }));
  }, [holdings]);

  if (isLoading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <p className="text-red-500">{t('donut.error')}</p>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <p className="text-muted-foreground">{t('donut.empty')}</p>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="h-full p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <div className="md:col-span-2 relative h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(chartData.reduce((sum, item) => sum + item.value, 0))}
                </div>
                <div className="text-sm text-gray-500">{t('donut.total')}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={140}
                  innerRadius={90}
                  paddingAngle={1}
                  cornerRadius={4}
                  dataKey="value"
                >
                  {chartData.map((entry: ChartEntry, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || COLORS[index % COLORS.length]} 
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="hidden md:flex flex-col justify-center space-y-3 pl-4 py-4 overflow-y-auto max-h-full">
            {chartData.map((entry: ChartEntry, index: number) => {
              const color = entry.color || COLORS[index % COLORS.length];
              const percentage = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100);
              
              return (
                <div key={`legend-${index}`} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-4 h-4 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: color }}
                  />
                  <CompanyLogo ticker={entry.name} size={16} />
                  <span className="font-medium text-gray-900 truncate">{entry.name}</span>
                  <span className="text-gray-500 ml-auto">{formatDecimal(percentage, 1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HoldingsDonutChart;
