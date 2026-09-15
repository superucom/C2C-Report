"use client";

import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardDailyPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function DepositCompareChart({ data }: { data: DashboardDailyPoint[] }) {
  const isMonthlyView = data.length > 20;
  const chartData = data.map((d) => ({
    day: isMonthlyView ? d.dateKey.slice(0, 2) : d.dateKey.slice(0, 5),
    ยอดฝากรวม: d.totalDeposit,
    ยอดฝากC2C: d.c2cDeposit,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="depositCompareFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.24} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 6" stroke="var(--border)" opacity={0.75} />
        <XAxis
          dataKey="day"
          interval={isMonthlyView ? 2 : 0}
          minTickGap={isMonthlyView ? 10 : 18}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, 0)}
          width={70}
        />
        <Tooltip
          cursor={{ stroke: "var(--primary)", strokeDasharray: "4 4", opacity: 0.55 }}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
            boxShadow: "0 10px 28px color-mix(in oklch, var(--foreground) 12%, transparent)",
          }}
          labelFormatter={(label) => `วันที่ ${label}`}
          formatter={(value, name) => [`฿${formatCurrency(Number(value), 2)}`, name]}
        />
        <Legend iconType="line" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        <Area
          type="monotone"
          dataKey="ยอดฝากC2C"
          name="ยอดฝาก C2C"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          fill="url(#depositCompareFill)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
          animationDuration={700}
        />
        <Line
          type="monotone"
          dataKey="ยอดฝากรวม"
          name="ยอดฝากรวม"
          stroke="var(--chart-5)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
          animationDuration={700}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
