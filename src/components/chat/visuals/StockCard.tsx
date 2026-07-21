import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

export interface StockCardProps {
    symbol: string;
    name?: string;
    price: number;
    change: number;
    changePercent: number;
    currency?: string;
}

export function StockCard({
    symbol,
    name,
    price,
    change,
    changePercent,
    currency = "USD",
}: StockCardProps) {
    const isPositive = change >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="w-full max-w-sm p-5 my-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <CompanyLogo ticker={symbol} companyName={name} size={36} />
                    <div>
                        <h3 className="text-lg font-semibold leading-none tracking-tight">{symbol}</h3>
                        {name && <p className="text-sm text-muted-foreground mt-1">{name}</p>}
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)}
                    </span>
                    <div className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        isPositive ? "text-success" : "text-danger"
                    )}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)</span>
                        <span className="text-muted-foreground font-normal ml-1">Today</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
