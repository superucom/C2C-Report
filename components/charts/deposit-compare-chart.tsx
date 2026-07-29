"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardDailyPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function DepositCompareChart({ data }: { data: DashboardDailyPoint[] }) {
  const chartData = data.map((d) => ({
    day: d.dateKey.slice(0, 2),
    ยอดฝากรวม: d.totalDeposit,
    ยอดฝากC2C: d.c2cDeposit,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(v) => formatCurrency(v, 0)}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => formatCurrency(Number(value), 2)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="ยอดฝากรวม" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="ยอดฝากC2C" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
