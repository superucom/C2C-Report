"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/date-range-picker";
import { DailyC2CDepositChart } from "@/components/charts/daily-c2c-deposit-chart";
import { DailyBonusChart } from "@/components/charts/daily-bonus-chart";
import { DepositCompareChart } from "@/components/charts/deposit-compare-chart";
import { C2CSharePieChart } from "@/components/charts/c2c-share-pie-chart";
import { useC2CData } from "@/hooks/use-c2c-data";
import { calculateDashboardByDateRange } from "@/lib/calculations";
import { toDateKey } from "@/lib/parse-helpers";
import { formatCurrency, formatPercent } from "@/lib/utils";

function getInitialDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return {
    startStr: formatDate(start),
    endStr: formatDate(end),
  };
}

export function DashboardTab() {
  const { depositRecords, bonusRecords } = useC2CData();
  const initial = React.useMemo(() => getInitialDates(), []);
  const [startDateStr, setStartDateStr] = React.useState(initial.startStr);
  const [endDateStr, setEndDateStr] = React.useState(initial.endStr);

  const dashboard = React.useMemo(() => {
    const startParts = startDateStr.split("-").map(Number);
    const endParts = endDateStr.split("-").map(Number);
    const startObj = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const endObj = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    const now = new Date();

    return calculateDashboardByDateRange(
      depositRecords,
      bonusRecords,
      startObj,
      endObj,
      toDateKey(now)
    );
  }, [depositRecords, bonusRecords, startDateStr, endDateStr]);

  const rangePercent =
    dashboard.monthlyDepositTotal > 0 ? (dashboard.monthlyC2CTotal / dashboard.monthlyDepositTotal) * 100 : 0;

  // Format date display (e.g. 01/07/2026 ถึง 31/07/2026)
  const formatDisplayDate = (isoStr: string) => {
    const [y, m, d] = isoStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <div className="dashboard-enter flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">แนวโน้มผลการดำเนินงาน</h2>
          <p className="mt-1 text-xs text-muted-foreground">ข้อมูลช่วงวันที่ {formatDisplayDate(startDateStr)} ถึง {formatDisplayDate(endDateStr)}</p>
        </div>
        <DateRangePicker
          startDate={startDateStr}
          endDate={endDateStr}
          onChange={(s, e) => {
            setStartDateStr(s);
            setEndDateStr(e);
          }}
        />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="dashboard-enter border-border/80 bg-card/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ "--dashboard-delay": "80ms" } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">ยอดฝากรวมในช่วงที่เลือก</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tracking-tight tabular-nums">฿{formatCurrency(dashboard.monthlyDepositTotal)}</p>
          </CardContent>
        </Card>
        <Card className="dashboard-enter border-primary/20 bg-primary/[0.04] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ "--dashboard-delay": "130ms" } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">ยอดฝาก C2C ในช่วงที่เลือก</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tracking-tight text-primary tabular-nums">฿{formatCurrency(dashboard.monthlyC2CTotal)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatPercent(rangePercent)} ของยอดฝากรวม</p>
          </CardContent>
        </Card>
        <Card className="dashboard-enter border-accent/30 bg-accent/[0.05] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ "--dashboard-delay": "180ms" } as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">โบนัส C2C ในช่วงที่เลือก</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tracking-tight text-amber-500 tabular-nums">฿{formatCurrency(dashboard.monthlyBonusTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Split Daily Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="dashboard-enter border-border/80 bg-card/90 shadow-sm transition-all duration-300 hover:shadow-md" style={{ "--dashboard-delay": "220ms" } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              ยอดฝาก C2C รายวัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyC2CDepositChart data={dashboard.daily} />
          </CardContent>
        </Card>

        <Card className="dashboard-enter border-border/80 bg-card/90 shadow-sm transition-all duration-300 hover:shadow-md" style={{ "--dashboard-delay": "260ms" } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              โบนัส C2C รายวัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyBonusChart data={dashboard.daily} />
          </CardContent>
        </Card>
      </div>

      {/* Comparative & Share Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="dashboard-enter border-border/80 bg-card/90 shadow-sm transition-all duration-300 hover:shadow-md" style={{ "--dashboard-delay": "300ms" } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="text-sm font-bold">ยอดฝากรวม เทียบกับ ยอดฝาก C2C</CardTitle>
          </CardHeader>
          <CardContent>
            <DepositCompareChart data={dashboard.daily} />
          </CardContent>
        </Card>

        <Card className="dashboard-enter border-border/80 bg-card/90 shadow-sm transition-all duration-300 hover:shadow-md" style={{ "--dashboard-delay": "340ms" } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="text-sm font-bold">สัดส่วน C2C กับ Non C2C</CardTitle>
          </CardHeader>
          <CardContent>
            <C2CSharePieChart c2c={dashboard.monthlyC2CTotal} total={dashboard.monthlyDepositTotal} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
