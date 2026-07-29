"use client";

import * as React from "react";
import { ArrowDownToLine, Banknote, Gift, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDashboard } from "@/lib/calculations";
import { toDateKey } from "@/lib/parse-helpers";
import { useC2CData } from "@/hooks/use-c2c-data";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: "primary" | "accent" | "success" | "muted";
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-foreground",
    success: "bg-success/15 text-success",
    muted: "bg-secondary text-secondary-foreground",
  };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{label}</CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export function KpiCards() {
  const { depositRecords, bonusRecords } = useC2CData();

  const today = new Date();
  const todayKey = toDateKey(today);

  const dashboard = React.useMemo(
    () => calculateDashboard(depositRecords, bonusRecords, today.getFullYear(), today.getMonth() + 1, todayKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depositRecords, bonusRecords]
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="ยอดฝาก C2C วันนี้"
        value={`฿${formatCurrency(dashboard.todayC2CDeposit)}`}
        icon={ArrowDownToLine}
        tone="primary"
      />
      <KpiCard
        label="ยอดฝากทั้งหมดวันนี้"
        value={`฿${formatCurrency(dashboard.todayTotalDeposit)}`}
        icon={Banknote}
        tone="muted"
      />
      <KpiCard
        label="โบนัส C2C วันนี้"
        value={`฿${formatCurrency(dashboard.todayBonus)}`}
        icon={Gift}
        tone="accent"
      />
      <KpiCard
        label="% โบนัสต่อยอดฝาก C2C"
        value={formatPercent(dashboard.todayBonusPercent)}
        icon={Percent}
        tone="success"
      />
    </div>
  );
}
