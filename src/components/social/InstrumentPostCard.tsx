import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStockPriceApiV1StockTickerPriceGet } from "@/api/stock/stock";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

interface InstrumentPostCardProps {
  ticker: string;
}

export const InstrumentPostCard = ({ ticker }: InstrumentPostCardProps) => {
  const { data: stockData, isLoading, error } = useGetStockPriceApiV1StockTickerPriceGet(ticker, {
    query: {
      enabled: !!ticker,
      refetchOnWindowFocus: false,
    },
  });

  // Extract the price data from the response
  const priceData = stockData?.data;

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !priceData) {
    return null; // Don't render anything if there's an error or no stock data
  }

  const priceChange = priceData.current_price - priceData.previous_close;
  const changePercent = (priceChange / priceData.previous_close) * 100;
  const isPositive = priceChange >= 0;

  return (
    <Card className="mt-3 border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors hover:shadow-md">
      <Link to={`/instrument/${ticker}`} className="block">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CompanyLogo ticker={ticker} size={22} />
              <CardTitle className="text-base font-medium">
                {ticker.toUpperCase()}
              </CardTitle>
              <span className="text-muted-foreground text-sm">
                {ticker.toUpperCase()}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-medium">
                ${priceData.current_price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Change</p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : changePercent < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : changePercent < 0
                      ? "text-red-600 dark:text-red-400"
                      : ""
                  )}
                >
                  {isPositive ? "+" : ""}
                  {priceChange.toFixed(2)} ({changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
