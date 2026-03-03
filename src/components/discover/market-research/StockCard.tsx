import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { SearchResult } from "@/api/financialDataApi.schemas";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

// Mock data for sparklines
const generateSparklineData = (isPositive: boolean) => {
    const data = [];
    let value = 100;
    for (let i = 0; i < 20; i++) {
        const change = (Math.random() - 0.5) * 5;
        value += isPositive ? change + 1 : change - 1;
        data.push({ value });
    }
    return data;
};

interface StockCardProps {
    stock: SearchResult;
    type: "normal" | "compact" | "featured";
}

export function StockCard({ stock, type }: StockCardProps) {
    const navigate = useNavigate();
    const isPositive = (stock.regular_market_change_percent ?? 0) >= 0;
    const sparklineData = generateSparklineData(isPositive);
    const colorClass = isPositive ? "text-green-500" : "text-red-500";

    if (type === "featured") {
        return (
            <div
                onClick={() => navigate(`/instrument/${stock.symbol}`)}
                className="group relative overflow-hidden rounded-3xl bg-card border p-6 transition-all hover:shadow-lg cursor-pointer"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <CompanyLogo ticker={stock.symbol} companyName={stock.name} size={40} />
                        <div>
                            <h3 className="font-bold text-lg">{stock.symbol}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{stock.name}</p>
                        </div>
                    </div>
                    <Badge variant={isPositive ? "default" : "destructive"} className={cn("rounded-full px-3", isPositive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600")}>
                        {isPositive ? "+" : ""}{stock.regular_market_change_percent?.toFixed(2)}%
                    </Badge>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-bold tracking-tight">
                            {formatCurrency(stock.regular_market_price ?? 0, stock.currency ?? "USD")}
                        </p>
                        <p className={cn("text-sm font-medium flex items-center mt-1", colorClass)}>
                            {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                            {formatCurrency(stock.regular_market_change ?? 0, stock.currency ?? "USD")}
                        </p>
                    </div>
                    <div className="h-16 w-24 opacity-50 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineData}>
                                <defs>
                                    <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={isPositive ? "#22c55e" : "#ef4444"}
                                    fill={`url(#gradient-${stock.symbol})`}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => navigate(`/instrument/${stock.symbol}`)}
            className="flex items-center justify-between p-4 rounded-2xl hover:bg-accent/50 transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <CompanyLogo ticker={stock.symbol} companyName={stock.name} size={40} />
                <div>
                    <h4 className="font-bold">{stock.symbol}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[120px]">{stock.name}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-8 w-16 hidden sm:block opacity-50 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? "#22c55e" : "#ef4444"}
                                fill="none"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-right min-w-[80px]">
                    <p className="font-bold text-sm">
                        {formatCurrency(stock.regular_market_price ?? 0, stock.currency ?? "USD")}
                    </p>
                    <p className={cn("text-xs font-medium", colorClass)}>
                        {isPositive ? "+" : ""}{stock.regular_market_change_percent?.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    );
}
