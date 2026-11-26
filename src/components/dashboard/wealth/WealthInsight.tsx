import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { useCustomerHoldings } from "@/api/portfolio/useCustomerHoldings";
import { formatCurrency } from "@/lib/utils";
import { formatPercentage } from "@/lib/formatters";
import { useTypewriterRotation } from "@/hooks/useTypewriterRotation";
import { useTranslation } from "react-i18next";

interface Phrase {
    text: string;
    /** Ticker mentioned in the phrase, linked once fully typed out. */
    symbol?: string;
}

export const WealthInsight = () => {
    const { data: holdings, isLoading } = useCustomerHoldings({ includeMarketData: true });
    const prefersReducedMotion = useReducedMotion();
    const { t } = useTranslation('dashboard');

    const phrases = useMemo<Phrase[]>(() => {
        if (!holdings || holdings.length === 0) return [];

        const withDailyChange = holdings.filter((h) => h.dailyChangePercent !== null);
        const topGainer = [...withDailyChange].sort((a, b) => (b.dailyChangePercent || 0) - (a.dailyChangePercent || 0))[0];
        const topLoser = [...withDailyChange].sort((a, b) => (a.dailyChangePercent || 0) - (b.dailyChangePercent || 0))[0];
        // holdings arrives sorted by currentValue desc
        const largest = holdings[0];

        const list: Phrase[] = [];

        if (topGainer && (topGainer.dailyChangePercent || 0) > 0) {
            list.push({
                text: t('insight.topGainer', { symbol: topGainer.symbol, change: formatPercentage(topGainer.dailyChangePercent || 0) }),
                symbol: topGainer.symbol,
            });
        }
        if (topLoser && (topLoser.dailyChangePercent || 0) < 0 && topLoser.symbol !== topGainer?.symbol) {
            list.push({
                text: t('insight.topLoser', { symbol: topLoser.symbol, change: formatPercentage(Math.abs(topLoser.dailyChangePercent || 0)) }),
                symbol: topLoser.symbol,
            });
        }
        if (largest?.currentValue) {
            list.push({
                text: t('insight.largest', { symbol: largest.symbol, value: formatCurrency(largest.currentValue) }),
                symbol: largest.symbol,
            });
        }

        return list.length > 0 ? list : [{ text: t('insight.assetCount', { count: holdings.length }) }];
    }, [holdings, t]);

    const fallback = useMemo<Phrase[]>(() => [{ text: t('insight.fallback') }], [t]);
    const activePhrases = phrases.length > 0 ? phrases : fallback;

    const { text, isTyping, phraseIndex } = useTypewriterRotation(
        activePhrases.map((p) => p.text),
        { reduced: prefersReducedMotion || false }
    );

    if (isLoading) return null;

    const { symbol } = activePhrases[phraseIndex] ?? {};
    const symbolIndex = symbol ? text.indexOf(symbol) : -1;
    const symbolFullyTyped = symbolIndex !== -1 && text.length >= symbolIndex + symbol!.length;

    return (
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-2.5 py-1.5">
            <StockyLogo variant="ink" size={18} className="shrink-0" />
            <span className="truncate text-xs text-foreground/80">
                {symbolFullyTyped ? (
                    <>
                        {text.slice(0, symbolIndex)}
                        <Link
                            to={`/instrument/${symbol}`}
                            className="font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
                        >
                            {symbol}
                        </Link>
                        {text.slice(symbolIndex! + symbol!.length)}
                    </>
                ) : (
                    text
                )}
                {isTyping && (
                    <span className="ml-0.5 inline-block h-3 w-px translate-y-0.5 animate-pulse bg-foreground/50 align-middle" />
                )}
            </span>
        </div>
    );
};
