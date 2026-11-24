import { useMemo, useState } from "react";
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
import { usePriceFlash, priceFlashClass } from "@/hooks/usePriceFlash";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PositionThesisButton } from "@/components/thesis/PositionThesisButton";

interface PortfolioHoldingsProps {
  holdings: PortfolioHolding[];
  isLoading?: boolean;
  isLoadingPrices?: boolean;
  livePrices?: Record<string, RealtimePrice>;
  /** Enables the per-position thesis indicator. */
  portfolioId?: string;
}

type SortColumn = "asset" | "price" | "value" | "today" | "return" | "allocation";
type SortDirection = "asc" | "desc";
type AllocationBasis = "value" | "invested";

interface Row {
  holding: PortfolioHolding;
  marketValue: number;
  pnl: number;
  pnlPercentage: number;
  todayChangePercent: number;
  allocation: number;
}

const SortableHead = ({
  column,
  label,
  align = "right",
  activeColumn,
  direction,
  onSort,
  className,
}: {
  column: SortColumn;
  label: string;
  align?: "left" | "right";
  activeColumn: SortColumn;
  direction: SortDirection;
  onSort: (_col: SortColumn) => void;
  className?: string;
}) => {
  const isActive = activeColumn === column;
  return (
    <TableHead className={cn("h-12 font-medium", align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        {isActive ? (
          direction === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </TableHead>
  );
};

const HoldingRow = ({
  row,
  isLive,
  isLoadingPrices,
  portfolioId,
}: {
  row: Row;
  isLive: boolean;
  isLoadingPrices: boolean;
  portfolioId?: string;
}) => {
  const { holding, marketValue, pnl, pnlPercentage, todayChangePercent, allocation } = row;
  const flash = usePriceFlash(isLive ? holding.current_price : undefined);
  const isTodayPositive = todayChangePercent >= 0;

  return (
    <TableRow className="group hover:bg-muted/30 border-border/50 transition-colors">
      <TableCell className="pl-6 py-4">
        <div className="flex items-center gap-1">
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
        {portfolioId && <PositionThesisButton ticker={holding.ticker} portfolioId={portfolioId} />}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">
        {isLoadingPrices ? (
          <Skeleton className="h-4 w-16 ml-auto" />
        ) : (
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1.5">
              <span className={`rounded px-1 -mx-1 transition-colors duration-700 ${priceFlashClass(flash)}`}>
                {holding.current_price ? formatCurrency(holding.current_price, holding.currency) : "N/A"}
              </span>
              {isLive && (
                <span className="relative flex h-1.5 w-1.5" title="Live price">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">Avg: {formatCurrency(holding.average_price, holding.currency)}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right font-semibold">
        {isLoadingPrices ? (
          <Skeleton className="h-4 w-20 ml-auto" />
        ) : (
          formatCurrency(marketValue, holding.currency)
        )}
      </TableCell>
      <TableCell className="text-right">
        {isLoadingPrices ? (
          <Skeleton className="h-4 w-16 ml-auto" />
        ) : (
          <span className={`text-sm font-medium ${isTodayPositive ? "text-success" : "text-danger"}`}>
            {isTodayPositive ? "+" : ""}
            {formatPercentage(todayChangePercent)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isLoadingPrices ? (
          <Skeleton className="h-4 w-24 ml-auto" />
        ) : (
          <div className="flex justify-end">
            <div
              className={`flex flex-col items-end ${pnl >= 0
                ? "text-success"
                : "text-danger"
                }`}
            >
              <span className="font-medium text-sm">
                {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, holding.currency)}
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
};

const HoldingCard = ({
  row,
  isLive,
  isLoadingPrices,
  portfolioId,
}: {
  row: Row;
  isLive: boolean;
  isLoadingPrices: boolean;
  portfolioId?: string;
}) => {
  const { holding, marketValue, pnl, pnlPercentage, todayChangePercent, allocation } = row;
  const flash = usePriceFlash(isLive ? holding.current_price : undefined);
  const isTodayPositive = todayChangePercent >= 0;
  const isReturnPositive = pnl >= 0;

  return (
    <Link
      to={`/instrument/${holding.ticker}`}
      className="block rounded-2xl border border-border/50 bg-card/50 p-4 active:bg-muted/40 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyLogo ticker={holding.ticker} size={32} />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm">{holding.ticker}</span>
            <span className="text-xs text-muted-foreground">
              {holding.quantity.toLocaleString()} shares
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
        {portfolioId && <PositionThesisButton ticker={holding.ticker} portfolioId={portfolioId} />}
        <div className="flex flex-col items-end shrink-0">
          {isLoadingPrices ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span className="font-semibold text-sm">{formatCurrency(marketValue, holding.currency)}</span>
          )}
          <span className={`text-xs font-medium ${isTodayPositive ? "text-success" : "text-danger"}`}>
            {isTodayPositive ? "+" : ""}{formatPercentage(todayChangePercent)} today
          </span>
        </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          {isLoadingPrices ? (
            <Skeleton className="h-3.5 w-16" />
          ) : (
            <>
              <span className={`rounded px-1 -mx-1 transition-colors duration-700 ${priceFlashClass(flash)}`}>
                {holding.current_price ? formatCurrency(holding.current_price, holding.currency) : "N/A"}
              </span>
              {isLive && (
                <span className="relative flex h-1.5 w-1.5" title="Live price">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
              )}
              <span className="text-muted-foreground">
                avg {formatCurrency(holding.average_price, holding.currency)}
              </span>
            </>
          )}
        </div>
        {isLoadingPrices ? (
          <Skeleton className="h-3.5 w-14" />
        ) : (
          <span className={`font-medium ${isReturnPositive ? "text-success" : "text-danger"}`}>
            {isReturnPositive ? "+" : ""}{formatCurrency(pnl, holding.currency)} ({formatPercentage(pnlPercentage)})
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${Math.min(100, allocation)}%` }}
          />
        </div>
        <span className="text-muted-foreground text-xs font-medium">
          {Math.round(allocation)}% of portfolio
        </span>
      </div>
    </Link>
  );
};

const HoldingsSkeleton = () => (
  <Card className="flex flex-col border-none shadow-none bg-transparent">
    <CardHeader className="pb-2 px-0">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-medium">Holdings</CardTitle>
        <Skeleton className="h-4 w-20" />
      </div>
    </CardHeader>
    <CardContent className="p-0">
      {/* Mobile skeleton: stacked cards */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
            <Skeleton className="h-1.5 w-full rounded-full mt-4" />
          </div>
        ))}
      </div>

      {/* Desktop skeleton: table */}
      <div className="hidden md:block rounded-3xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[250px] pl-6 h-12 font-medium">Asset</TableHead>
              <TableHead className="text-right h-12 font-medium">Price</TableHead>
              <TableHead className="text-right h-12 font-medium">Value</TableHead>
              <TableHead className="text-right h-12 font-medium">Today</TableHead>
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
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-14 ml-auto" />
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

export const PortfolioHoldings = ({
  holdings,
  isLoading = false,
  isLoadingPrices = false,
  livePrices = {},
  portfolioId,
}: PortfolioHoldingsProps) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>("allocation");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [allocationBasis, setAllocationBasis] = useState<AllocationBasis>("value");

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Total portfolio value/invested for percentage calculations - basis picks which one the Allocation column is against.
  const totalValue = holdings.reduce(
    (sum, holding) => sum + (isLoadingPrices ? holding.total_invested : (holding.current_price || 0) * holding.quantity),
    0
  );
  const totalInvested = holdings.reduce((sum, holding) => sum + holding.total_invested, 0);
  const allocationTotal = allocationBasis === "value" ? totalValue : totalInvested;

  const rows: Row[] = useMemo(() => {
    return holdings.map((holding) => {
      const marketValue = (holding.current_price || 0) * holding.quantity;
      const pnl = marketValue - holding.total_invested;
      const pnlPercentage = holding.total_invested > 0 ? (pnl / holding.total_invested) * 100 : 0;
      const todayChangePercent = holding.today_change_percent || 0;
      const basisValue = allocationBasis === "value" ? marketValue : holding.total_invested;
      const allocation = allocationTotal > 0 ? (basisValue / allocationTotal) * 100 : 0;

      return { holding, marketValue, pnl, pnlPercentage, todayChangePercent, allocation };
    });
  }, [holdings, allocationBasis, allocationTotal]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      let diff = 0;
      switch (sortColumn) {
        case "asset":
          diff = a.holding.ticker.localeCompare(b.holding.ticker);
          break;
        case "price":
          diff = (a.holding.current_price || 0) - (b.holding.current_price || 0);
          break;
        case "value":
          diff = a.marketValue - b.marketValue;
          break;
        case "today":
          diff = a.todayChangePercent - b.todayChangePercent;
          break;
        case "return":
          diff = a.pnlPercentage - b.pnlPercentage;
          break;
        case "allocation":
          diff = a.allocation - b.allocation;
          break;
      }
      return sortDirection === "asc" ? diff : -diff;
    });
    return sorted;
  }, [rows, sortColumn, sortDirection]);

  if (isLoading) {
    return <HoldingsSkeleton />;
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

  return (
    <Card className="flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="pb-2 px-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg font-medium">Holdings</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border/50 bg-muted/30 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setAllocationBasis("value")}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium transition-colors",
                  allocationBasis === "value" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                % of value
              </button>
              <button
                type="button"
                onClick={() => setAllocationBasis("invested")}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium transition-colors",
                  allocationBasis === "invested" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                % of invested
              </button>
            </div>
            <CardDescription className="text-xs">
              {holdings.length} {holdings.length === 1 ? "asset" : "assets"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile: stacked cards, no horizontal scroll */}
        <div className="flex flex-col gap-2.5 md:hidden">
          {sortedRows.map((row) => {
            const isLive = !!livePrices[row.holding.ticker.toUpperCase()];
            return (
              <HoldingCard
                key={row.holding.ticker}
                row={row}
                isLive={isLive}
                isLoadingPrices={isLoadingPrices}
                portfolioId={portfolioId}
              />
            );
          })}
        </div>

        {/* Desktop: sortable table */}
        <div className="hidden md:block rounded-3xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <SortableHead column="asset" label="Asset" align="left" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} className="w-[250px] pl-6" />
                <SortableHead column="price" label="Price" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
                <SortableHead column="value" label="Value" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
                <SortableHead column="today" label="Today" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
                <SortableHead column="return" label="Return" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} />
                <SortableHead column="allocation" label="Allocation" activeColumn={sortColumn} direction={sortDirection} onSort={handleSort} className="w-[150px] pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.map((row) => {
                const isLive = !!livePrices[row.holding.ticker.toUpperCase()];
                return (
                  <HoldingRow
                    key={row.holding.ticker}
                    row={row}
                    isLive={isLive}
                    isLoadingPrices={isLoadingPrices}
                    portfolioId={portfolioId}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
