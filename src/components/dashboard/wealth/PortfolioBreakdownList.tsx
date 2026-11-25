import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Portfolio } from "@/api/portfolio/usePortfolios";
import { useTranslation } from "react-i18next";
import { formatPercentage } from "@/lib/formatters";

interface PortfolioBreakdownListProps {
    portfolios: Portfolio[];
}

export const PortfolioBreakdownList = ({ portfolios }: PortfolioBreakdownListProps) => {
    const { t } = useTranslation('dashboard');
    if (portfolios.length === 0) return null;

    const sorted = [...portfolios].sort((a, b) => (b.total_value || 0) - (a.total_value || 0));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card"
        >
            {sorted.map((portfolio) => {
                const value = portfolio.total_value || 0;
                const returnPct = portfolio.total_return_percentage || 0;
                const isPositive = returnPct >= 0;

                return (
                    <Link
                        key={portfolio.id}
                        to={`/portfolio/${portfolio.id}`}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                    >
                        <div className="min-w-0">
                            <p className="truncate font-semibold">{portfolio.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {t('wealth.holdings', { count: portfolio.holdings_count || 0 })}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <div className="text-right">
                                <p className="font-semibold">{formatCurrency(value)}</p>
                                <p className={`text-xs font-medium ${isPositive ? "text-success" : "text-danger"}`}>
                                    {isPositive ? "+" : ""}
                                    {formatPercentage(returnPct)}
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </Link>
                );
            })}
        </motion.div>
    );
};
