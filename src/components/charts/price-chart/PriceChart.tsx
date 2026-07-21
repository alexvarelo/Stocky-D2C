import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ChartControls } from './ChartControls';
import { ChartVisualizer } from './ChartVisualizer';
import { useChartData } from './useChartData';
import { TimeRange, ChartMode } from './types';
import { useRealtimePrices } from '@/api/stock/useRealtimePrices';

interface PriceChartProps {
    ticker: string;
    currency?: string;
}

export function PriceChart({ ticker, currency = 'USD' }: PriceChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('1y');
    const [chartMode, setChartMode] = useState<ChartMode>('price');
    const [comparisonTicker, setComparisonTicker] = useState<string | null>(null);

    const {
        chartData,
        isLoading,
        priceChange,
        percentChange,
        isPositive,
        currentPrice
    } = useChartData({
        ticker,
        timeRange,
        chartMode,
        comparisonTicker
    });

    // Overlay a live tick from the market data API's websocket on top of the
    // last historical close. Falls back to the static values above until (or
    // unless) a tick actually arrives for this ticker.
    const liveTickers = useMemo(() => (ticker ? [ticker] : []), [ticker]);
    const { prices: livePrices } = useRealtimePrices(liveTickers, !!ticker);
    const live = ticker ? livePrices[ticker.toUpperCase()] : undefined;

    const effectiveCurrentPrice = live?.price ?? currentPrice;
    const effectivePriceChange = live?.change ?? priceChange;
    const effectivePercentChange = live?.changePercent ?? percentChange;
    const effectiveIsPositive = live ? effectivePercentChange >= 0 : isPositive;

    return (
        <Card className="w-full">
            <ChartControls
                ticker={ticker}
                currency={currency}
                currentPrice={effectiveCurrentPrice}
                priceChange={effectivePriceChange}
                percentChange={effectivePercentChange}
                isPositive={effectiveIsPositive}
                isLive={!!live}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                chartMode={chartMode}
                setChartMode={setChartMode}
                comparisonTicker={comparisonTicker}
                setComparisonTicker={setComparisonTicker}
                hasData={chartData.length > 0}
            />
            <ChartVisualizer
                data={chartData}
                isLoading={isLoading}
                chartMode={chartMode}
                ticker={ticker}
                comparisonTicker={comparisonTicker}
                isPositive={isPositive}
            />
        </Card>
    );
}
