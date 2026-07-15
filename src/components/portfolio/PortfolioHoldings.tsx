import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { PortfolioHolding } from "@/api/portfolio/portfolio";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyLogo } from "@/components/stock/CompanyLogo";
import type { RealtimePrice } from "@/api/stock/useRealtimePrices";

interface PortfolioHoldingsProps {
  holdings: PortfolioHolding[];
  isLoading?: boolean;
  isLoadingPrices?: boolean;
  livePrices?: Record<string, RealtimePrice>;
}

export const PortfolioHoldings = ({
  holdings,
  isLoading = false,
  isLoadingPrices = false,
  livePrices = {}
}: PortfolioHoldingsProps) => {
  if (isLoading) {
    return (
      <Card className="flex flex-col border-none shadow-none bg-transparent">
        <CardHeader className="pb-2 px-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Holdings</CardTitle>
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-3xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[250px] pl-6 h-12 font-medium">Asset</TableHead>
                  <TableHead className="text-right h-12 font-medium">Price</TableHead>
                  <TableHead className="text-right h-12 font-medium">Shares</TableHead>
                  <TableHead className="text-right h-12 font-medium">Balance</TableHead>
                  <TableHead className="text-right h-12 font-medium">Return</TableHead>
                  <TableHead className="text-right w-[150px] pr-6 h-12 font-medium">Allocation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent border-b border-border/50 last:border-0">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center gap-3 justify-end">
                        <Skeleton className="h-1.5 w-24 rounded-full" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (holdings.length === 0) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle>Holdings</CardTitle>
          <CardDescription>
            This portfolio doesn't have any holdings yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate total portfolio value for percentage calculations
  const totalValue = holdings.reduce(
    (sum, holding) => sum + (isLoadingPrices ? holding.total_invested : (holding.current_price || 0) * holding.quantity),
    0
  );

  return (
    <Card className="flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Holdings</CardTitle>
          <CardDescription className="text-xs mr-4">
            {holdings.length} {holdings.length === 1 ? "asset" : "assets"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-3xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="w-[250px] pl-6 h-12 font-medium">Asset</TableHead>
                <TableHead className="text-right h-12 font-medium">Price</TableHead>
                <TableHead className="text-right h-12 font-medium">Value</TableHead>
                <TableHead className="text-right w-[150px] pr-6 h-12 font-medium">Gain/Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => {
                const marketValue =
                  (holding.current_price || 0) * holding.quantity;
                const pnl = marketValue - holding.total_invested;
                const pnlPercentage = holding.total_invested > 0 ? (pnl / holding.total_invested) * 100 : 0;
                const allocation = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
                const isLive = !!livePrices[holding.ticker.toUpperCase()];

                return (
                  <TableRow key={holding.ticker} className="group hover:bg-muted/30 border-border/50 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <Link
                        to={`/instrument/${holding.ticker}`}
                        className="flex items-center gap-3 group/link"
                      >
                        <CompanyLogo ticker={holding.ticker} size={30} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm group-hover/link:text-primary transition-colors">
                            {holding.ticker}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {holding.quantity.toLocaleString()} shares
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {isLoadingPrices ? (
                        <Skeleton className="h-4 w-16 ml-auto" />
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1.5">
                            {holding.current_price ? formatCurrency(holding.current_price) : "N/A"}
                            {isLive && (
                              <span className="relative flex h-1.5 w-1.5" title="Live price">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">Avg: {formatCurrency(holding.average_price)}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {isLoadingPrices ? (
                        <Skeleton className="h-4 w-20 ml-auto" />
                      ) : (
                        formatCurrency(marketValue)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isLoadingPrices ? (
                        <Skeleton className="h-4 w-24 ml-auto" />
                      ) : (
                        <div className="flex justify-end">
                          <div
                            className={`flex flex-col items-end ${pnl >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                              }`}
                          >
                            <span className="font-medium text-sm">
                              {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
                            </span>
                            <span className="text-xs opacity-80 bg-current/10 px-1.5 py-0.5 rounded-md mt-0.5">
                              {formatPercentage(pnlPercentage)}
                            </span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="pr-6">
                      {isLoadingPrices ? (
                        <Skeleton className="h-4 w-full" />
                      ) : (
                        <div className="flex items-center gap-3 justify-end">
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, allocation)}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground text-xs w-8 text-right font-medium">
                            {Math.round(allocation)}%
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
