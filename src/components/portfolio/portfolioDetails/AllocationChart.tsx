import { useMemo } from "react";
import { holdingMarketValue } from "@/lib/portfolioValue";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioHolding } from "@/api/portfolio/portfolio";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { useTranslation } from "react-i18next";

interface AllocationChartProps {
    holdings: PortfolioHolding[];
    className?: string;
    isLoading?: boolean;
}

const COLORS = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
    "#6366f1", // indigo-500
];

const OTHERS_COLOR = "#94a3b8"; // slate-400

export const AllocationChart = ({ holdings, className = "", isLoading }: AllocationChartProps) => {
    const { t } = useTranslation('portfolio');
    const { chartData, allData } = useMemo(() => {
        if (!holdings.length) return { chartData: [], allData: [] };

        const totalValue = holdings.reduce((sum, h) => sum + holdingMarketValue(h), 0);

        const sortedHoldings = [...holdings].sort((a, b) =>
            holdingMarketValue(b) - holdingMarketValue(a)
        );

        // Prepare data for all holdings (for the list)
        const allData = sortedHoldings.map((h, index) => ({
            name: h.ticker,
            value: holdingMarketValue(h),
            percentage: totalValue > 0 ? (holdingMarketValue(h) / totalValue) * 100 : 0,
            color: index < 5 ? COLORS[index % COLORS.length] : OTHERS_COLOR
        }));

        // Prepare data for the chart (Top 5 + Others)
        const topHoldings = allData.slice(0, 5);
        const otherHoldings = allData.slice(5);

        const chartData = [...topHoldings];

        if (otherHoldings.length > 0) {
            const otherValue = otherHoldings.reduce((sum, h) => sum + h.value, 0);
            chartData.push({
                name: t("detail.others"),
                value: otherValue,
                percentage: totalValue > 0 ? (otherValue / totalValue) * 100 : 0,
                color: OTHERS_COLOR
            });
        }

        return { chartData, allData };
    }, [holdings]);

    if (isLoading) {
        return (
            <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
                <CardHeader className="pb-2 px-0">
                    <CardTitle className="text-lg font-medium">{t('detail.allocation')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col bg-card/50 border border-border/50 rounded-3xl p-6 shadow-sm h-[400px]">
                    <div className="h-[200px] relative shrink-0 flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full border-8 border-muted/20 animate-pulse" />
                    </div>
                    <div className="mt-4 space-y-3 flex-1 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-2.5 h-2.5 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (allData.length === 0) {
        return (
            <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
                <CardHeader className="pb-2 px-0">
                    <CardTitle className="text-lg font-medium">{t('detail.allocation')}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm bg-card/50 rounded-3xl border border-border/50">
                    {t('detail.noHoldingsData')}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
            <CardHeader className="pb-2 px-0">
                <CardTitle className="text-lg font-medium">{t('detail.allocation')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col bg-card/50 border border-border/50 rounded-3xl p-6 shadow-sm h-[400px]">
                <div className="h-[200px] relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--popover))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "0.75rem",
                                    fontSize: "0.875rem",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                }}
                                itemStyle={{ color: "hsl(var(--foreground))" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-3xl font-bold tracking-tighter">{allData.length}</span>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">{t('detail.assets')}</p>
                        </div>
                    </div>
                </div>

                {/* Custom Legend - Scrollable */}
                <div className="mt-4 space-y-3 overflow-y-auto pr-2 pl-1 custom-scrollbar flex-1">
                    {allData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-sm group">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-card"
                                    style={{ backgroundColor: entry.color, "--tw-ring-color": entry.color } as any}
                                />
                                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[100px]">{entry.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold">{formatPercentage(entry.percentage)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
