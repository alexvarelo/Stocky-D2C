import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Term } from "@/components/glossary/Term";
import { CHART_AXIS, CHART_MARGIN, ChartTitle, Reading, TOOLTIP_STYLE } from "./shared";

function NumberField({ id, label, value, onChange, step = 1 }: { id: string; label: string; value: number; onChange: (_v: number) => void; step?: number }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
      />
    </div>
  );
}

const money = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 0 });
const clamp = (v: number, lo: number, hi: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

/** Pure client calculator with user-chosen assumptions; no market data involved. */
export function CompoundGrowthWidget() {
  const [start, setStart] = useState(1000);
  const [monthly, setMonthly] = useState(100);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(20);

  const { rows, final, invested } = useMemo(() => {
    const s = clamp(start, 0, 1e9);
    const m = clamp(monthly, 0, 1e7);
    const r = clamp(rate, -50, 50) / 100;
    const y = Math.round(clamp(years, 1, 60));
    const mr = Math.pow(1 + r, 1 / 12) - 1;
    let bal = s;
    const out = [{ year: 0, balance: s, invested: s }];
    for (let mo = 1; mo <= y * 12; mo++) {
      bal = bal * (1 + mr) + m;
      if (mo % 12 === 0) out.push({ year: mo / 12, balance: Math.round(bal), invested: s + m * mo });
    }
    return { rows: out, final: bal, invested: s + m * y * 12 };
  }, [start, monthly, rate, years]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Illustrative calculator: you choose the assumptions. It is not a forecast, and real returns vary every year.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <NumberField id="cg-start" label="Starting amount" value={start} onChange={setStart} step={100} />
        <NumberField id="cg-monthly" label="Added each month" value={monthly} onChange={setMonthly} step={10} />
        <NumberField id="cg-rate" label="Assumed yearly return (%)" value={rate} onChange={setRate} step={0.5} />
        <NumberField id="cg-years" label="Years" value={years} onChange={setYears} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Reading label="Money put in" value={money(invested)} />
        <Reading label="Growth" value={money(final - invested)} />
        <Reading label={<Term id="cagr">End value</Term>} value={money(final)} />
      </div>
      <ChartTitle explain={{ label: "compound growth calculator", value: `end value ${money(final)} from ${money(invested)} invested`, detail: `assuming ${rate}% a year over ${years} years` }}>
        Balance vs money put in
      </ChartTitle>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis dataKey="year" {...CHART_AXIS} />
            <YAxis {...CHART_AXIS} width={52} tickFormatter={(v: number) => new Intl.NumberFormat(undefined, { notation: "compact" }).format(v)} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => money(v)} labelFormatter={(l) => `Year ${l}`} />
            <Line dataKey="balance" name="Balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="invested" name="Money put in" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Equal-weight portfolio volatility from user-chosen assumptions: sigma * sqrt(1/N + (1 - 1/N) * rho). */
export function DiversificationWidget() {
  const [vol, setVol] = useState(30);
  const [corr, setCorr] = useState(0.4);

  const rows = useMemo(() => {
    const s = clamp(vol, 1, 200);
    const rho = clamp(corr, -0.1, 1);
    return [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30].map((n) => ({
      n,
      volatility: Number((s * Math.sqrt(1 / n + (1 - 1 / n) * rho)).toFixed(2)),
    }));
  }, [vol, corr]);
  const floor = rows[rows.length - 1].volatility;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Illustrative model: equal-sized holdings that each have the same <Term id="volatility">volatility</Term> and the same{" "}
        <Term id="correlation">correlation</Term> with each other. These are your assumptions, not market data.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <NumberField id="dv-vol" label="Volatility of each holding (%)" value={vol} onChange={setVol} />
        <NumberField id="dv-corr" label="Correlation between holdings (-0.1 to 1)" value={corr} onChange={setCorr} step={0.1} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Reading label="1 holding" value={`${rows[0].volatility.toFixed(1)}%`} />
        <Reading label={<Term id="diversification">30 holdings</Term>} value={`${floor.toFixed(1)}%`} note="Part of the risk remains however many you hold" />
      </div>
      <ChartTitle explain={{ label: "diversification calculator: portfolio volatility against number of holdings", detail: `assuming ${vol}% volatility per holding and ${corr} correlation` }}>
        Portfolio volatility vs number of holdings
      </ChartTitle>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis dataKey="n" {...CHART_AXIS} />
            <YAxis {...CHART_AXIS} width={40} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => `${v.toFixed(1)}%`} labelFormatter={(l) => `${l} holdings`} />
            <Line dataKey="volatility" name="Portfolio volatility" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
