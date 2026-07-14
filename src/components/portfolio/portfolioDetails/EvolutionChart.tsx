import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioPerformanceChart } from "../PortfolioPerformanceChart";
import { usePortfolioPerformance } from "@/api/portfolio/usePortfolioPerformance";
import { usePortfolioValueHistory } from "@/api/portfolio/usePortfolioValueHistory";
import type { PortfolioHolding } from "@/api/portfolio/portfolio";


interface EvolutionChartProps {
  holdings: PortfolioHolding[];
  portfolioId?: string;
  className?: string;
  isLoading?: boolean;
}

// Snapshots accumulate one per day, so a young portfolio doesn't have enough
// points to draw a meaningful line yet — fall back to the legacy calculation.
const MIN_HISTORY_POINTS = 5;

export const EvolutionChart = ({ holdings, portfolioId, className = "", isLoading: isParentLoading }: EvolutionChartProps) => {
  const { data: history, isLoading: isHistoryLoading } = usePortfolioValueHistory(portfolioId);

  const hasStoredHistory = !!history && history.length >= MIN_HISTORY_POINTS;

  // Legacy path: fetch 1y of prices per holding and aggregate client-side.
  // Only used while the portfolio_value_history table has too few snapshots.
  const { data: calculatedData, isLoading: isChartLoading } = usePortfolioPerformance(
    isHistoryLoading || hasStoredHistory ? [] : holdings
  );

  const performanceData = hasStoredHistory
    ? {
        dates: history.map(point => point.snapshot_date),
        values: history.map(point => point.total_value),
      }
    : calculatedData;

  const isLoading = isParentLoading || isHistoryLoading || (!hasStoredHistory && isChartLoading);

  if (isLoading || !performanceData) {
    return (
      <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
        <CardHeader className="pb-2 px-0">
          <CardTitle className="text-lg font-medium">Evolution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="h-[300px] md:h-[400px] w-full bg-card/50 border border-border/50 rounded-3xl p-4 md:p-6 shadow-sm flex items-end gap-2">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="w-full rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-lg font-medium">Evolution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-[300px] md:h-[400px] w-full bg-card/50 border border-border/50 rounded-3xl overflow-hidden md:p-4 p-2 shadow-sm">
          <PortfolioPerformanceChart
            dates={performanceData.dates}
            values={performanceData.values}
            className="h-full w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
