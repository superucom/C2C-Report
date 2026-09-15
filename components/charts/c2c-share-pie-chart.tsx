"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function C2CSharePieChart({ c2c, total }: { c2c: number; total: number }) {
  const nonC2C = Math.max(total - c2c, 0);
  const data = [
    { name: "C2C", value: c2c },
    { name: "Non C2C", value: nonC2C },
  ];
  const colors = ["var(--chart-1)", "var(--chart-4)"];
  const pct = total > 0 ? (c2c / total) * 100 : 0;
  const nonC2CPct = total > 0 ? (nonC2C / total) * 100 : 0;

  return (
    <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(150px,0.85fr)]">
      <div className="relative h-[260px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={98}
              paddingAngle={3}
              cornerRadius={5}
              animationDuration={700}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i]} stroke="var(--card)" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                boxShadow: "0 10px 28px color-mix(in oklch, var(--foreground) 12%, transparent)",
              }}
              formatter={(value) => `฿${formatCurrency(Number(value), 2)}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight tabular-nums">{formatPercent(pct)}</span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">สัดส่วน C2C</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="text-[11px] text-muted-foreground">ยอดฝากรวม</p>
          <p className="mt-1 text-lg font-bold tracking-tight tabular-nums">฿{formatCurrency(total)}</p>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--chart-1)]" /><span>C2C</span></div>
            <span className="font-semibold tabular-nums text-primary">{formatPercent(pct)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--chart-4)]" /><span>Non C2C</span></div>
            <span className="font-semibold tabular-nums text-muted-foreground">{formatPercent(nonC2CPct)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
