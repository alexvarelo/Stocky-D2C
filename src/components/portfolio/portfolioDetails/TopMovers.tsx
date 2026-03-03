import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioHolding } from "@/api/portfolio/portfolio";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

interface TopMoversProps {
    holdings: PortfolioHolding[];
    className?: string;
    isLoading?: boolean;
}

export const TopMovers = ({ holdings, className = "", isLoading }: TopMoversProps) => {
    const movers = [...holdings]
        .sort((a, b) => Math.abs(b.today_change_percent || 0) - Math.abs(a.today_change_percent || 0))
        .slice(0, 5);

    if (isLoading) {
        return (
            <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
                <CardHeader className="pb-2 px-0">
                    <CardTitle className="text-lg font-medium">Top Movers (24h)</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 bg-card/50 border border-border/50 rounded-3xl p-6 shadow-sm">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-6 w-12 rounded" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (movers.length === 0) {
        return (
            <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
                <CardHeader className="pb-2 px-0">
                    <CardTitle className="text-lg font-medium">Top Movers (24h)</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center min-h-[200px] text-muted-foreground text-sm bg-card/50 rounded-3xl border border-border/50">
                    No data available
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
            <CardHeader className="pb-2 px-0">
                <CardTitle className="text-lg font-medium">Top Movers (24h)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 bg-card/50 border border-border/50 rounded-3xl p-6 shadow-sm">
                {movers.map((holding) => {
                    const change = holding.today_change_percent || 0;
                    const isPositive = change > 0;
                    const isNeutral = change === 0;

                    return (
                        <div key={holding.ticker} className="flex items-center justify-between group py-1">
                            <div className="flex items-center gap-3">
                                <CompanyLogo ticker={holding.ticker} size={24} />
                                <div>
                                    <Link
                                        to={`/instrument/${holding.ticker}`}
                                        className="font-medium bg-muted/50 px-2 py-1 rounded text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                                    >
                                        {holding.ticker}
                                    </Link>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {formatCurrency(holding.current_price || 0)}
                                    </div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' :
                                isNeutral ? 'text-muted-foreground' :
                                    'text-red-600 dark:text-red-400'
                                }`}>
                                {isPositive ? <ArrowUpRight className="h-4 w-4" /> :
                                    isNeutral ? <Minus className="h-4 w-4" /> :
                                        <ArrowDownRight className="h-4 w-4" />}
                                {formatPercentage(change)}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
