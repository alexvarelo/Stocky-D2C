import { useMemo } from "react";
import type { PortfolioRiskResponse } from "@/api/financialDataApi.schemas";
import { Term } from "@/components/glossary/Term";
import { correlationColor, fmtNum } from "./riskFormat";
import { useTranslation } from "react-i18next";

const MAX_TICKERS = 12;

export function CorrelationHeatmap({ data }: { data: PortfolioRiskResponse }) {
  const { t } = useTranslation("risk");
  const { tickers, matrix, truncated } = useMemo(() => {
    const all = data.correlation.tickers;
    const weightOf = new Map(data.weights.map((w) => [w.ticker, w.weight]));
    const idx = all
      .map((t, i) => ({ t, i, w: weightOf.get(t) ?? 0 }))
      .sort((a, b) => b.w - a.w)
      .slice(0, MAX_TICKERS);
    return {
      tickers: idx.map((x) => x.t),
      matrix: idx.map((r) => idx.map((c) => data.correlation.matrix[r.i]?.[c.i] ?? null)),
      truncated: all.length > MAX_TICKERS ? all.length : 0,
    };
  }, [data]);

  if (tickers.length < 2) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">
        <Term id="correlation">{t("metrics.correlation")}</Term>
      </h4>
      <div className="overflow-x-auto">
        <div
          className="grid gap-0.5 text-[10px] sm:text-xs min-w-fit"
          style={{ gridTemplateColumns: `minmax(2.5rem, auto) repeat(${tickers.length}, minmax(1.75rem, 1fr))` }}
          role="table"
          aria-label={t("correlationMatrix")}
        >
          <div />
          {tickers.map((t) => (
            <div key={`h-${t}`} className="text-center text-muted-foreground truncate px-0.5" title={t}>
              {t}
            </div>
          ))}
          {tickers.map((rt, r) => (
            <div key={`r-${rt}`} className="contents">
              <div className="text-muted-foreground truncate pr-1 flex items-center" title={rt}>
                {rt}
              </div>
              {tickers.map((ct, c) => {
                const v = matrix[r][c];
                return (
                  <div
                    key={`${rt}-${ct}`}
                    className="aspect-square flex items-center justify-center rounded-sm text-foreground/80"
                    style={{ backgroundColor: correlationColor(v) }}
                    title={`${rt} / ${ct}: ${v == null ? "n/a" : v.toFixed(2)}`}
                    tabIndex={0}
                  >
                    <span className="hidden sm:inline">{v == null ? "" : fmtNum(v)}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>-1</span>
        <div
          className="h-1.5 w-24 rounded-full"
          style={{
            background: `linear-gradient(to right, ${correlationColor(-1)}, ${correlationColor(0)}, ${correlationColor(1)})`,
          }}
        />
        <span>+1</span>
        {truncated > 0 && <span className="ml-auto">Top {MAX_TICKERS} of {truncated} by weight</span>}
      </div>
    </div>
  );
}
