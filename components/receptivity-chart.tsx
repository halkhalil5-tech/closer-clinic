"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Dot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  turn: number;
  value: number;
  dip: boolean;
}

/**
 * Post-hoc receptivity timeline. Teal line over a flat mint wash; the
 * conversation's sharpest drops are flagged in danger red.
 */
export function ReceptivityChart({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  // Dips: the two sharpest negative swings.
  const drops = values.map((v, i) => (i === 0 ? 0 : values[i - 1] - v));
  const marked = [...drops.keys()]
    .filter((i) => drops[i] > 0)
    .sort((a, b) => drops[b] - drops[a])
    .slice(0, 2);
  const data: Point[] = values.map((v, i) => ({ turn: i + 1, value: v, dip: marked.includes(i) }));

  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
          <CartesianGrid stroke="rgba(10,53,64,0.08)" vertical={false} />
          <XAxis
            dataKey="turn"
            tick={{ fill: "#5b7278", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(10,53,64,0.16)" }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={{ fill: "#5b7278", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: "rgba(10,53,64,0.2)" }}
            contentStyle={{
              background: "#ffffff",
              border: "1px solid rgba(10,53,64,0.12)",
              borderRadius: 8,
              fontSize: 12,
              color: "#0a3540",
            }}
            formatter={(v) => [`${v}`, "Receptivity"]}
            labelFormatter={(l) => `Patient turn ${l}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="var(--color-success)"
            fillOpacity={0.12}
            dot={(props) => {
              const { key, payload, cx, cy } = props as {
                key: string;
                payload: Point;
                cx: number;
                cy: number;
              };
              return (
                <Dot
                  key={key}
                  cx={cx}
                  cy={cy}
                  r={payload.dip ? 4 : 2}
                  fill={payload.dip ? "var(--color-danger)" : "var(--color-primary)"}
                  stroke="#ffffff"
                  strokeWidth={payload.dip ? 1.5 : 0}
                />
              );
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
