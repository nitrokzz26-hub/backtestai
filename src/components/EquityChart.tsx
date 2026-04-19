"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function EquityChart({ data }: { data: { t: string; equity: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.t).toLocaleDateString(),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#a1a1aa"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#0f1714",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
            }}
            labelStyle={{ color: "#e4e4e7" }}
          />
          <Line type="monotone" dataKey="equity" stroke="#4ade80" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
