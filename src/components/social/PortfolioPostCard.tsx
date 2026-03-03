import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Lock,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  usePortfolio,
  usePortfolioPerformance,
} from "@/api/portfolio/portfolio";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

// Format currency utility function
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

interface PortfolioPostCardProps {
  portfolioId: string;
}

export const PortfolioPostCard = ({ portfolioId }: PortfolioPostCardProps) => {
  // Get basic portfolio data (loads immediately)
  const { data: portfolio, isLoading, error } = usePortfolio(portfolioId);

  // Get performance data (loads in the background)
  const {
    data: performanceData,
    isLoading: isPerformanceLoading,
    isError: isPerformanceError,
    refetch: refetchPerformance,
  } = usePortfolioPerformance(portfolioId, !!portfolio);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return null; // Don't render anything if there's an error or no portfolio
  }

  // Calculate values based on whether performance data is available
  const totalValue = performanceData?.total_value || 0;
  const totalChangePercent = performanceData?.total_change_percent || 0;
  const holdingsCount = portfolio.holdings?.length || 0;

  // Get top 3 holdings by value
  const topHoldings =
    portfolio.holdings
      ?.map((holding) => {
        const performanceHolding = performanceData?.holdings?.find(
          (h) => h.ticker === holding.ticker
        );
        const value =
          (performanceHolding?.current_price || 0) * holding.quantity;
        const changePercent = performanceHolding?.change_percent || 0;
        return {
          ...holding,
          value,
          changePercent,
          currentPrice: performanceHolding?.current_price || 0,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 3) || [];

  return (
    <Card className="mt-3 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">
              {portfolio.name}
            </CardTitle>
            {!portfolio.is_public && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Value</p>
            {isPerformanceLoading ? (
              <Skeleton className="h-5 w-24 mt-1" />
            ) : (
              <p className="font-medium">{formatCurrency(totalValue)}</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Total change</p>
            {isPerformanceLoading ? (
              <Skeleton className="h-5 w-16 mt-1" />
            ) : isPerformanceError ? (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <RefreshCw
                  className="h-3.5 w-3.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    refetchPerformance();
                  }}
                />
                <span>Retry</span>
              </div>
            ) : (
              <p
                className={cn(
                  "font-medium",
                  totalChangePercent > 0
                    ? "text-green-600 dark:text-green-400"
                    : totalChangePercent < 0
                    ? "text-red-600 dark:text-red-400"
                    : ""
                )}
              >
                {totalChangePercent > 0 ? "+" : ""}
                {totalChangePercent.toFixed(2)}%
              </p>
            )}
          </div>
          <div>
            <div>
              <p className="text-muted-foreground">Holdings</p>
              <p className="font-medium">{holdingsCount}</p>
            </div>
          </div>
        </div>

        {/* Top Holdings Section */}
        {topHoldings.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Top Holdings
            </h4>
            <div className="space-y-2">
              {topHoldings.map((holding, index) => {
                const changeIcon =
                  holding.changePercent > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  ) : holding.changePercent < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  );

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CompanyLogo ticker={holding.ticker} size={18} />
                        <span className="font-medium">{holding.ticker}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {holding.changePercent > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        ) : holding.changePercent < 0 ? (
                          <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                        ) : (
                          <Minus className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "text-xs font-medium",
                            holding.changePercent > 0
                              ? "text-green-600 dark:text-green-400"
                              : holding.changePercent < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {holding.changePercent > 0 ? "+" : ""}
                          {holding.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(holding.value)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {holding.quantity} ×{" "}
                        {formatCurrency(holding.currentPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          to={`/portfolio/${portfolioId}`}
          className="text-sm text-primary hover:underline flex items-center gap-1 w-full justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          View full portfolio <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
};
