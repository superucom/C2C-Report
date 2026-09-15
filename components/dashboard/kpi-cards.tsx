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
  hero = false,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: "primary" | "accent" | "success" | "muted";
  hero?: boolean;
  delay?: number;
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-foreground",
    success: "bg-success/15 text-success",
    muted: "bg-secondary text-secondary-foreground",
  };
  return (
    <Card
      className={cn(
        "dashboard-enter group relative overflow-hidden border-border/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        hero && "dashboard-sheen border-primary bg-primary text-primary-foreground shadow-[0_18px_40px_color-mix(in_oklch,var(--primary)_20%,transparent)] xl:col-span-2",
        !hero && "bg-card/90"
      )}
      style={{ "--dashboard-delay": `${delay}ms` } as React.CSSProperties}
    >
      {hero && <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-primary-foreground/10 blur-2xl" aria-hidden="true" />}
      <CardHeader className="relative flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={hero ? "text-primary-foreground/75" : ""}>{label}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", hero ? "bg-primary-foreground/15 text-primary-foreground" : toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <p className={cn("tabular-nums tracking-tight", hero ? "text-3xl font-bold sm:text-4xl" : "text-2xl font-bold")}>{value}</p>
        {hero && <p className="mt-2 text-xs text-primary-foreground/70">ยอดฝากจากข้อมูลประจำวันที่เลือก</p>}
      </CardContent>
    </Card>
  );
}

// dateKey format ในระบบนี้คือ "DD/MM/YYYY"

/** แปลง dateKey "DD/MM/YYYY" → input value "YYYY-MM-DD" สำหรับ <input type="date"> */
function dateKeyToInputValue(dateKey: string): string {
  const [d, m, y] = dateKey.split("/");
  return `${y}-${m}-${d}`;
}

/** แปลง input value "YYYY-MM-DD" → dateKey "DD/MM/YYYY" */
function inputValueToDateKey(value: string): string {
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

/** หาวันล่าสุดที่มีข้อมูล (dateKey format "DD/MM/YYYY") */
function getLatestDateKey(
  depositRecords: { dateKey: string }[],
  bonusRecords: { dateKey: string }[]
): string | null {
  const allKeys = new Set([
    ...depositRecords.map((r) => r.dateKey),
    ...bonusRecords.map((r) => r.dateKey),
  ]);
  if (allKeys.size === 0) return null;

  // Sort by converting to YYYY-MM-DD for correct chronological order
  const sorted = [...allKeys].sort((a, b) => {
    return dateKeyToInputValue(a) < dateKeyToInputValue(b) ? -1 : 1;
  });
  return sorted[sorted.length - 1]; // วันล่าสุด
}

export function KpiCards() {
  const { depositRecords, bonusRecords } = useC2CData();

  const today = new Date();
  const todayKey = toDateKey(today); // "DD/MM/YYYY"

  // หาวันล่าสุดที่มีข้อมูล
  const latestKey = React.useMemo(
    () => getLatestDateKey(depositRecords, bonusRecords),
    [depositRecords, bonusRecords]
  );

  // ถ้าวันนี้มีข้อมูล → ใช้วันนี้, ไม่งั้น fallback ไปวันล่าสุด
  const defaultKey = React.useMemo(() => {
    const hasTodayData =
      depositRecords.some((r) => r.dateKey === todayKey) ||
      bonusRecords.some((r) => r.dateKey === todayKey);
    if (hasTodayData) return todayKey;
    return latestKey ?? todayKey;
  }, [depositRecords, bonusRecords, todayKey, latestKey]);

  const [selectedKey, setSelectedKey] = React.useState<string>(defaultKey);

  // เมื่อ data โหลดใหม่ (upload ไฟล์) ให้ reset ไปวันล่าสุด
  React.useEffect(() => {
    setSelectedKey(defaultKey);
  }, [defaultKey]);

  // หา sorted list ของวันที่มีข้อมูล (sorted ascending)
  const availableKeys = React.useMemo(() => {
    const allKeys = new Set([
      ...depositRecords.map((r) => r.dateKey),
      ...bonusRecords.map((r) => r.dateKey),
    ]);
    return [...allKeys].sort((a, b) =>
      dateKeyToInputValue(a) < dateKeyToInputValue(b) ? -1 : 1
    );
  }, [depositRecords, bonusRecords]);

  const currentIdx = availableKeys.indexOf(selectedKey);

  const goToPrev = () => {
    if (currentIdx > 0) setSelectedKey(availableKeys[currentIdx - 1]);
  };
  const goToNext = () => {
    if (currentIdx < availableKeys.length - 1) setSelectedKey(availableKeys[currentIdx + 1]);
  };

  // min/max สำหรับ date input (format YYYY-MM-DD)
  const minInputVal = availableKeys.length > 0 ? dateKeyToInputValue(availableKeys[0]) : undefined;
  const maxInputVal =
    availableKeys.length > 0 ? dateKeyToInputValue(availableKeys[availableKeys.length - 1]) : undefined;

  const dashboard = React.useMemo(
    () =>
      calculateDashboard(
        depositRecords,
        bonusRecords,
        today.getFullYear(),
        today.getMonth() + 1,
        selectedKey // ← "DD/MM/YYYY" ตรงกับ key ในระบบ
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depositRecords, bonusRecords, selectedKey]
  );

  const isToday = selectedKey === todayKey;
  const isLatest = selectedKey === latestKey;
  const hasData = availableKeys.length > 0;

  return (
    <section className="dashboard-enter space-y-4" style={{ "--dashboard-delay": "40ms" } as React.CSSProperties}>
      {/* Date selector bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">ภาพรวมยอดวันนี้</h2>
            <p className="text-xs text-muted-foreground">เลือกวันที่เพื่อดูตัวเลขสรุปแบบเจาะจง</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasData ? (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrev}
              disabled={currentIdx <= 0}
              title="วันก่อนหน้า"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Date input — ใช้ YYYY-MM-DD สำหรับ input, แต่ state เก็บ DD/MM/YYYY */}
            <input
              type="date"
              id="kpi-date-picker"
              value={dateKeyToInputValue(selectedKey)}
              min={minInputVal}
              max={maxInputVal}
              onChange={(e) => {
                if (e.target.value) setSelectedKey(inputValueToDateKey(e.target.value));
              }}
              className="h-8 rounded-lg border border-border bg-background px-2 py-1 text-sm font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
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
            <div className="flex items-center gap-1.5">
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
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard
          label="ยอดฝาก C2C วันนี้"
          value={`฿${formatCurrency(dashboard.todayC2CDeposit)}`}
          icon={ArrowDownToLine}
          tone="primary"
          hero
          delay={100}
        />
        <KpiCard
          label="ยอดฝากทั้งหมดวันนี้"
          value={`฿${formatCurrency(dashboard.todayTotalDeposit)}`}
          icon={Banknote}
          tone="muted"
          delay={160}
        />
        <KpiCard
          label="% C2C ต่อยอดฝากรวม"
          value={formatPercent(
            dashboard.todayTotalDeposit > 0
              ? (dashboard.todayC2CDeposit / dashboard.todayTotalDeposit) * 100
              : 0
          )}
          icon={Percent}
          tone="primary"
          delay={220}
        />
        <KpiCard
          label="โบนัส C2C วันนี้"
          value={`฿${formatCurrency(dashboard.todayBonus)}`}
          icon={Gift}
          tone="accent"
          delay={280}
        />
        <KpiCard
          label="% โบนัสต่อยอดฝาก C2C"
          value={formatPercent(dashboard.todayBonusPercent)}
          icon={Percent}
          tone="success"
          delay={340}
        />
      </div>
    </section>
  );
}
