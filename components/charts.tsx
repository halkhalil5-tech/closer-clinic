"use client";

import { useMemo, useState } from "react";
import type { DayPoint, ScenarioAgg } from "@/lib/stats";

/**
 * Hand-rolled SVG charts, single-series (mint on navy) so no categorical
 * palette is needed. Marks: 2px line, 8px hit-target points, rounded bar ends,
 * recessive grid, tap/hover tooltip. Numbers are always also readable as text.
 */

const PRIMARY = "var(--color-primary)";
const GRID = "var(--color-line)";

/* ------------------------------ close rate line ------------------------------ */

export function CloseRateChart({ byDay, windowDays }: { byDay: DayPoint[]; windowDays: number }) {
  const [active, setActive] = useState<number | null>(null);

  // Fill the window with every calendar day so the x-axis is honest time,
  // carrying null for days without reps (gaps in the line).
  const series = useMemo(() => {
    const out: { date: string; label: string; closeRate: number | null; reps: number }[] = [];
    const end = new Date();
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const point = byDay.find((p) => p.date === key);
      out.push({
        date: key,
        label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
        closeRate: point?.closeRate ?? null,
        reps: point?.reps ?? 0,
      });
    }
    return out;
  }, [byDay, windowDays]);

  const W = 340;
  const H = 150;
  const PAD = { top: 12, right: 10, bottom: 22, left: 34 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (series.length === 1 ? iw / 2 : (i / (series.length - 1)) * iw);
  const y = (rate: number) => PAD.top + (1 - rate) * ih;

  const segments = useMemo(() => {
    const segs: string[] = [];
    let current: string[] = [];
    series.forEach((p, i) => {
      if (p.closeRate === null) {
        if (current.length > 1) segs.push(current.join(" "));
        current = [];
      } else {
        current.push(`${current.length === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.closeRate).toFixed(1)}`);
      }
    });
    if (current.length > 1) segs.push(current.join(" "));
    return segs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series]);

  const activePoint = active !== null ? series[active] : null;
  const hasData = series.some((p) => p.closeRate !== null);

  if (!hasData) {
    return (
      <div className="flex h-36 items-center justify-center text-sm text-muted">
        No graded reps in this window yet.
      </div>
    );
  }

  return (
    <div className="relative">
      {activePoint && activePoint.closeRate !== null && (
        <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-md border border-line bg-navy-900 px-2.5 py-1.5 font-mono text-xs whitespace-nowrap">
          {activePoint.label} · {Math.round(activePoint.closeRate * 100)}% · {activePoint.reps} rep
          {activePoint.reps === 1 ? "" : "s"}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setActive(null)}
        onTouchEnd={() => setTimeout(() => setActive(null), 1500)}
      >
        {[0, 0.5, 1].map((r) => (
          <g key={r}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(r)} y2={y(r)} stroke={GRID} strokeWidth="1" />
            <text
              x={PAD.left - 6}
              y={y(r) + 3.5}
              textAnchor="end"
              className="fill-[var(--color-muted)] font-mono text-[9px]"
            >
              {Math.round(r * 100)}%
            </text>
          </g>
        ))}
        {segments.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {series.map((p, i) =>
          p.closeRate === null ? null : (
            <g key={p.date}>
              <circle
                cx={x(i)}
                cy={y(p.closeRate)}
                r={active === i ? 5 : 3.5}
                fill={PRIMARY}
                stroke="var(--color-navy-850)"
                strokeWidth="2"
              />
              {/* oversized invisible hit target */}
              <rect
                x={x(i) - Math.max(8, iw / series.length / 2)}
                y={PAD.top}
                width={Math.max(16, iw / series.length)}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
                onTouchStart={() => setActive(i)}
              />
            </g>
          )
        )}
        {/* sparse x labels: first, middle, last */}
        {[0, Math.floor((series.length - 1) / 2), series.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
              className="fill-[var(--color-muted)] font-mono text-[9px]"
            >
              {series[i].label}
            </text>
          ))}
      </svg>
    </div>
  );
}

/* ------------------- training reps vs real-world closes ------------------- */

export interface RealDayPoint {
  date: string; // YYYY-MM-DD
  presented: number;
  closed: number;
}

/**
 * The proof chart: simulated-rep close rate (mint) and self-reported
 * real-world close rate (bone) on one time axis.
 */
export function SimVsRealChart({
  byDay,
  real,
  windowDays,
  revenueByDay = [],
}: {
  byDay: DayPoint[];
  real: RealDayPoint[];
  windowDays: number;
  /** Closed revenue per day (cents); rendered as weekly bars behind the lines. */
  revenueByDay?: { date: string; cents: number }[];
}) {
  const W = 340;
  const H = 150;
  const PAD = { top: 12, right: 10, bottom: 22, left: 34 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const days: string[] = [];
  const end = new Date();
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const x = (i: number) => PAD.left + (days.length === 1 ? iw / 2 : (i / (days.length - 1)) * iw);
  const y = (rate: number) => PAD.top + (1 - rate) * ih;

  // Weekly revenue bars: bucket the window's days into weeks ending today.
  const revByDate = new Map(revenueByDay.map((r) => [r.date, r.cents]));
  const weeks: { startIdx: number; endIdx: number; cents: number }[] = [];
  for (let end = days.length - 1; end >= 0; end -= 7) {
    const start = Math.max(0, end - 6);
    let cents = 0;
    for (let i = start; i <= end; i++) cents += revByDate.get(days[i]) ?? 0;
    weeks.unshift({ startIdx: start, endIdx: end, cents });
  }
  const maxWeekCents = Math.max(0, ...weeks.map((w) => w.cents));
  const hasRevenue = maxWeekCents > 0;

  function pathFor(rateOf: (date: string) => number | null): string[] {
    const segs: string[] = [];
    let current: string[] = [];
    days.forEach((date, i) => {
      const r = rateOf(date);
      if (r === null) {
        if (current.length > 1) segs.push(current.join(" "));
        current = [];
      } else {
        current.push(`${current.length === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r).toFixed(1)}`);
      }
    });
    if (current.length > 1) segs.push(current.join(" "));
    return segs;
  }

  const simRate = (date: string) => byDay.find((p) => p.date === date)?.closeRate ?? null;
  const realRate = (date: string) => {
    const p = real.find((r) => r.date === date);
    return p && p.presented > 0 ? p.closed / p.presented : null;
  };

  const simSegs = pathFor(simRate);
  const realSegs = pathFor(realRate);
  const hasSim = days.some((d) => simRate(d) !== null);
  const hasReal = days.some((d) => realRate(d) !== null);

  if (!hasSim && !hasReal) {
    return (
      <div className="flex h-36 items-center justify-center text-sm text-muted">
        Run reps and log real-world outcomes to see them together.
      </div>
    );
  }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {hasRevenue &&
          weeks.map((w, i) => {
            const h = (w.cents / maxWeekCents) * ih * 0.8;
            const x0 = x(w.startIdx);
            const x1 = x(w.endIdx);
            const bw = Math.max(6, x1 - x0);
            return (
              <rect
                key={`w${i}`}
                x={(x0 + x1) / 2 - bw / 2}
                y={PAD.top + ih - h}
                width={bw}
                height={h}
                fill="var(--color-amber)"
                opacity="0.18"
              />
            );
          })}
        {[0, 0.5, 1].map((r) => (
          <g key={r}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(r)} y2={y(r)} stroke={GRID} strokeWidth="1" />
            <text
              x={PAD.left - 6}
              y={y(r) + 3.5}
              textAnchor="end"
              className="fill-[var(--color-muted)] font-mono text-[9px]"
            >
              {Math.round(r * 100)}%
            </text>
          </g>
        ))}
        {simSegs.map((d, i) => (
          <path key={`s${i}`} d={d} fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {realSegs.map((d, i) => (
          <path key={`r${i}`} d={d} fill="none" stroke="var(--color-bone)" strokeWidth="2" strokeDasharray="1 4" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {days.map((date, i) => {
          const s = simRate(date);
          const r = realRate(date);
          return (
            <g key={date}>
              {s !== null && <circle cx={x(i)} cy={y(s)} r="3" fill={PRIMARY} stroke="var(--color-panel)" strokeWidth="1.5" />}
              {r !== null && <circle cx={x(i)} cy={y(r)} r="3" fill="var(--color-bone)" stroke="var(--color-panel)" strokeWidth="1.5" />}
            </g>
          );
        })}
        {[0, Math.floor((days.length - 1) / 2), days.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((i) => {
            const d = new Date(`${days[i]}T00:00:00Z`);
            return (
              <text
                key={i}
                x={x(i)}
                y={H - 6}
                textAnchor={i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"}
                className="fill-[var(--color-muted)] font-mono text-[9px]"
              >
                {d.getUTCMonth() + 1}/{d.getUTCDate()}
              </text>
            );
          })}
      </svg>
      <div className="mt-1 flex gap-4">
        <span className="flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
          <span className="h-0.5 w-4 bg-primary" /> Sim reps
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
          <span className="h-0.5 w-4 bg-bone" /> Real world
          {!hasReal && <span className="normal-case tracking-normal">— none logged yet</span>}
        </span>
        {hasRevenue && (
          <span className="flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
            <span className="h-2 w-4 bg-amber/30" /> Closed $/wk
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- per-scenario bars ---------------------------- */

export function ScenarioBars({
  data,
}: {
  data: (ScenarioAgg & { title: string })[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted">
        Run a few stations to see per-scenario averages.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((s) => (
        <div key={s.scenarioSlug}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-dim">
              {s.title}
            </span>
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink">
              {Math.round(s.avgTotal)}
              <span className="text-faint"> avg · </span>
              {Math.round(s.closeRate * 100)}%
              <span className="text-faint"> · {s.reps}r</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 bg-panel-2">
            <div
              className="bar-fill h-full bg-primary"
              style={{ width: `${Math.min(100, s.avgTotal)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
