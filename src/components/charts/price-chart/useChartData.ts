import { useMemo } from 'react';
import { useGetHistoricalDataApiV1StockTickerHistoryGet } from '@/api/stock/stock';
import { sub } from 'date-fns';
import { format } from '@/lib/dateFormat';
import { TimeRange, ChartMode, ChartDataPoint } from './types';

interface UseChartDataProps {
    ticker: string;
    timeRange: TimeRange;
    chartMode: ChartMode;
    comparisonTicker: string | null;
}

export const useChartData = ({ ticker, timeRange, chartMode, comparisonTicker }: UseChartDataProps) => {
    const transformData = (data: any): ChartDataPoint[] => {
        if (!data?.data) return [];
        const historicalData = Array.isArray(data.data.data) ? data.data.data : [];
        return historicalData.map((item: any) => ({
            date: format(new Date(item.date), 'MMM d, yyyy'),
            timestamp: new Date(item.date).getTime(),
            price: item.close,
            volume: item.volume
        }));
    };

    const { data: response, isLoading } = useGetHistoricalDataApiV1StockTickerHistoryGet(
        ticker,
        { period: timeRange as any },
        {
            query: {
                enabled: !!ticker,
                select: transformData
            }
        }
    );

    const { data: comparisonResponse, isLoading: isComparisonLoading } = useGetHistoricalDataApiV1StockTickerHistoryGet(
        comparisonTicker || "",
        { period: timeRange as any },
        {
            query: {
                enabled: !!comparisonTicker,
                select: transformData
            }
        }
    );

    const chartData = useMemo(() => {
        const mainData = response || [];

        if (chartMode === 'price' || mainData.length === 0) {
            return mainData;
        }

        // Performance mode: Normalize data
        const startPrice = mainData[0].price;
        const normalizedMain = mainData.map((item) => ({
            ...item,
            normalized: ((item.price - startPrice) / startPrice) * 100
        }));

        if (comparisonTicker && comparisonResponse && comparisonResponse.length > 0) {
            const compStartPrice = comparisonResponse[0].price;
            const compMap = new Map(comparisonResponse.map((item) => [item.date, item]));

            return normalizedMain.map((item) => {
                const compItem = compMap.get(item.date);
                return {
                    ...item,
                    comparisonPrice: compItem ? compItem.price : null,
                    comparisonNormalized: compItem ? ((compItem.price - compStartPrice) / compStartPrice) * 100 : null
                };
            });
        }

        return normalizedMain;
    }, [response, comparisonResponse, chartMode, comparisonTicker]);

    // Calculate price change if we have data
    const priceChange = (response && response.length > 1) ?
        response[response.length - 1].price - response[0].price : 0;
    const percentChange = (response && response.length > 1) ?
        (priceChange / response[0].price) * 100 : 0;
    const isPositive = percentChange >= 0;

    return {
        chartData,
        isLoading: isLoading || (!!comparisonTicker && isComparisonLoading),
        priceChange,
        percentChange,
        isPositive,
        currentPrice: response && response.length > 0 ? response[response.length - 1].price : 0
    };
};
