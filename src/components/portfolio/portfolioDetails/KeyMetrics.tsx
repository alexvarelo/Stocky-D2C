import { Card, CardContent } from "@/components/ui/card";
import { holdingMarketValue } from "@/lib/portfolioValue";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioHolding } from "@/api/portfolio/portfolio";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Trophy, TrendingDown, PieChart, DollarSign, Wallet } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { useTranslation } from "react-i18next";

interface KeyMetricsProps {
    holdings: PortfolioHolding[];
    totalInvested: number;
    className?: string;
    isLoading?: boolean;
}

export const KeyMetrics = ({ holdings, totalInvested, className = "", isLoading }: KeyMetricsProps) => {
    const { t } = useTranslation('portfolio');
    const totalValue = holdings.reduce((sum, h) => sum + holdingMarketValue(h), 0);
    const avgPosition = holdings.length > 0 ? totalValue / holdings.length : 0;
    // Hooks must run unconditionally, so these are computed before the loading/empty early returns.
    const animatedTotalInvested = useAnimatedNumber(totalInvested);
    const animatedAvgPosition = useAnimatedNumber(avgPosition);

    if (isLoading) {
        return (
            <div className={`grid grid-cols-2 gap-4 ${className}`}>
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="border-none shadow-none bg-transparent">
                        <CardContent className="p-4 bg-card/50 border border-border/50 rounded-3xl h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <Skeleton className="h-8 w-8 rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (holdings.length === 0) {
        return null;
    }

    // Calculate metrics
    const bestPerformer = [...holdings].sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))[0];
    const worstPerformer = [...holdings].sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0))[0];

    const largestHolding = [...holdings].sort((a, b) =>
        holdingMarketValue(b) - holdingMarketValue(a)
    )[0];

    const metrics = [
        {
            key: "invested",
            label: t("metrics.invested"),
            value: formatCurrency(animatedTotalInvested),
            subValue: t("metrics.investedSub"),
            icon: Wallet,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            isPositive: true
        },
        {
            key: "best",
            label: t("metrics.best"),
            value: bestPerformer?.ticker,
            subValue: formatPercentage(bestPerformer?.change_percent || 0),
            icon: Trophy,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            isPositive: (bestPerformer?.change_percent || 0) >= 0
        },
        {
            key: "worst",
            label: t("metrics.worst"),
            value: worstPerformer?.ticker,
            subValue: formatPercentage(worstPerformer?.change_percent || 0),
            icon: TrendingDown,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            isPositive: (worstPerformer?.change_percent || 0) >= 0
        },
        {
            key: "largest",
            label: t("metrics.largest"),
            value: largestHolding?.ticker,
            subValue: formatPercentage(totalValue > 0 ? ((largestHolding ? holdingMarketValue(largestHolding) : 0) / totalValue) * 100 : 0),
            icon: PieChart,
            color: "text-sky-500",
            bg: "bg-sky-500/10",
            isPositive: true
        },
        {
            key: "avg",
            label: t("metrics.avg"),
            value: formatCurrency(animatedAvgPosition),
            subValue: t("metrics.avgSub"),
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            isPositive: true
        }
    ];

    return (
        <div className={`grid grid-cols-2 gap-4 ${className}`}>
            {metrics.map((metric, i) => (
                <Card key={i} className="border-none shadow-none bg-transparent">
                    <CardContent className="p-4 bg-card/50 border border-border/50 rounded-3xl h-full flex flex-col justify-between hover:bg-card/80 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-2xl ${metric.bg}`}>
                                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">{metric.label}</p>
                            <p className="text-lg font-bold tracking-tight tabular-nums truncate">{metric.value}</p>
                            <p className={`text-xs font-medium mt-1 ${metric.key === "worst" || metric.key === "best" ?
                                (metric.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400") :
                                "text-muted-foreground"
                                }`}>
                                {metric.subValue}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
