import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

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
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm my-4"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{symbol}</h3>
                    {name && <p className="text-sm text-slate-500 dark:text-slate-400">{name}</p>}
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <DollarSign className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
            </div>
            
            <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)}
                    </span>
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)</span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">Today</span>
                </div>
            </div>
        </motion.div>
    );
}
