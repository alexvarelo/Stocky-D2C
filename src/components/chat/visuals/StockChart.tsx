import React from "react";
import { motion } from "framer-motion";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export interface StockChartProps {
    symbol: string;
    data: Array<{ date: string; price: number }>;
    currency?: string;
}

export function StockChart({ symbol, data, currency = "USD" }: StockChartProps) {
    if (!data || data.length === 0) {
        return null;
    }

    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    const isPositive = lastPrice >= firstPrice;
    const color = isPositive ? "#10b981" : "#f43f5e"; // emerald-500 or rose-500

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm my-4"
        >
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {symbol} Price History
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Last {data.length} periods
                </p>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{label}</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(payload[0].value as number)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient-${symbol})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
