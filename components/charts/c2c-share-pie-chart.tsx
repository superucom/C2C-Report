"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function C2CSharePieChart({ c2c, total }: { c2c: number; total: number }) {
  const nonC2C = Math.max(total - c2c, 0);
  const data = [
    { name: "C2C", value: c2c },
    { name: "Non C2C", value: nonC2C },
  ];
  const colors = ["var(--chart-1)", "var(--chart-4)"];
  const pct = total > 0 ? (c2c / total) * 100 : 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} stroke="var(--card)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => `฿${formatCurrency(Number(value), 2)}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
        <span className="text-xl font-bold tabular-nums">{formatPercent(pct)}</span>
        <span className="text-[11px] text-muted-foreground">สัดส่วน C2C</span>
      </div>
    </div>
  );
}
