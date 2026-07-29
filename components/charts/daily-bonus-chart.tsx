"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardDailyPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function DailyBonusChart({ data }: { data: DashboardDailyPoint[] }) {
  const chartData = data.map((d) => ({
    date: d.dateKey,
    dayLabel: d.dateKey.slice(0, 5), // DD/MM
    โบนัส: d.bonusAmount,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBonus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
        <XAxis
          dataKey="dayLabel"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(v) => formatCurrency(v, 0)}
          width={65}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          labelFormatter={(label) => `วันที่ ${label}`}
          formatter={(value) => [`฿${formatCurrency(Number(value), 2)}`, "โบนัส C2C"]}
        />
        <Area
          type="monotone"
          dataKey="โบนัส"
          stroke="var(--chart-2)"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorBonus)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
