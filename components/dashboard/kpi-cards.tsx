"use client";

import * as React from "react";
import { ArrowDownToLine, Banknote, Gift, Percent, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

/** หาวันล่าสุดที่มีข้อมูลใน records */
function getLatestDateKey(depositRecords: { dateKey: string }[], bonusRecords: { dateKey: string }[]): string | null {
  const allKeys = new Set([
    ...depositRecords.map((r) => r.dateKey),
    ...bonusRecords.map((r) => r.dateKey),
  ]);
  if (allKeys.size === 0) return null;
  return [...allKeys].sort().reverse()[0]; // คืน key ล่าสุด เช่น "2026-07-29"
}

/** แปลง dateKey "YYYY-MM-DD" → Date object (local) */
function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** แสดงวันแบบ "วันที่ DD/MM/YYYY" */
function formatDateDisplay(key: string): string {
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
}

export function KpiCards() {
  const { depositRecords, bonusRecords } = useC2CData();

  const today = new Date();
  const todayKey = toDateKey(today);

  // หา dateKey ที่จะแสดง: วันนี้ถ้ามีข้อมูล ไม่งั้นใช้วันล่าสุดที่มีข้อมูล
  const latestKey = React.useMemo(
    () => getLatestDateKey(depositRecords, bonusRecords),
    [depositRecords, bonusRecords]
  );

  const defaultKey = React.useMemo(() => {
    // ถ้าวันนี้มีข้อมูล → ใช้วันนี้, ไม่งั้น fallback ไปวันล่าสุด
    const hasTodayData = depositRecords.some((r) => r.dateKey === todayKey) ||
      bonusRecords.some((r) => r.dateKey === todayKey);
    if (hasTodayData) return todayKey;
    return latestKey ?? todayKey;
  }, [depositRecords, bonusRecords, todayKey, latestKey]);

  const [selectedKey, setSelectedKey] = React.useState<string>(defaultKey);

  // เมื่อ defaultKey เปลี่ยน (เช่น upload ไฟล์ใหม่) ให้ reset
  React.useEffect(() => {
    setSelectedKey(defaultKey);
  }, [defaultKey]);

  // หา sorted list ของวันที่มีข้อมูลทั้งหมด
  const availableKeys = React.useMemo(() => {
    const allKeys = new Set([
      ...depositRecords.map((r) => r.dateKey),
      ...bonusRecords.map((r) => r.dateKey),
    ]);
    return [...allKeys].sort();
  }, [depositRecords, bonusRecords]);

  const currentIdx = availableKeys.indexOf(selectedKey);

  const goToPrev = () => {
    if (currentIdx > 0) setSelectedKey(availableKeys[currentIdx - 1]);
  };
  const goToNext = () => {
    if (currentIdx < availableKeys.length - 1) setSelectedKey(availableKeys[currentIdx + 1]);
  };

  const dashboard = React.useMemo(
    () => calculateDashboard(depositRecords, bonusRecords, today.getFullYear(), today.getMonth() + 1, selectedKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depositRecords, bonusRecords, selectedKey]
  );

  const isToday = selectedKey === todayKey;
  const isLatest = selectedKey === latestKey;
  const hasData = availableKeys.length > 0;

  return (
    <div className="space-y-3">
      {/* Date selector bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground">ข้อมูลประจำวัน:</span>

        {hasData ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToPrev}
              disabled={currentIdx <= 0}
              title="วันก่อนหน้า"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Native date input */}
            <div className="relative">
              <input
                type="date"
                id="kpi-date-picker"
                value={selectedKey}
                min={availableKeys[0]}
                max={availableKeys[availableKeys.length - 1]}
                onChange={(e) => {
                  if (e.target.value) setSelectedKey(e.target.value);
                }}
                className="h-8 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToNext}
              disabled={currentIdx >= availableKeys.length - 1}
              title="วันถัดไป"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">ยังไม่มีข้อมูล</span>
        )}

        {/* Badge */}
        {hasData && (
          <div className="flex items-center gap-1.5 ml-1">
            {isToday && (
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                วันนี้
              </span>
            )}
            {!isToday && isLatest && (
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-500 ring-1 ring-inset ring-amber-500/20">
                วันล่าสุด
              </span>
            )}
            {!isToday && !isLatest && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                {formatDateDisplay(selectedKey)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
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
    </div>
  );
}
