"use client";

import * as React from "react";
import { useC2CData } from "@/hooks/use-c2c-data";
import { calculateBonusSummary } from "@/lib/calculations";
import { shiftMonth } from "@/lib/thai-date";
import { BonusSummaryTable } from "@/components/tables/bonus-summary-table";
import { SummaryToolbar } from "@/components/tables/summary-toolbar";
import { exportBonusExcel, exportElementToJPG, exportElementToPDF } from "@/services/export";
import { toast } from "sonner";
import { Gift } from "lucide-react";

export function BonusTab() {
  const { depositRecords, bonusRecords } = useC2CData();
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [search, setSearch] = React.useState("");
  const tablesRef = React.useRef<HTMLDivElement>(null);
  const currentTableRef = React.useRef<HTMLDivElement>(null);
  const [isExportingJpg, setIsExportingJpg] = React.useState(false);

  const prev = shiftMonth(year, month, -1);

  const currentSummary = React.useMemo(
    () => calculateBonusSummary(depositRecords, bonusRecords, year, month),
    [depositRecords, bonusRecords, year, month]
  );
  const prevSummary = React.useMemo(
    () => calculateBonusSummary(depositRecords, bonusRecords, prev.year, prev.month),
    [depositRecords, bonusRecords, prev.year, prev.month]
  );

  const handleExportPDF = async () => {
    if (!tablesRef.current) return;
    toast.promise(exportElementToPDF(tablesRef.current, `สรุปยอดโบนัส-C2C.pdf`), {
      loading: "กำลังสร้าง PDF...",
      success: "ดาวน์โหลด PDF สำเร็จ",
      error: "สร้าง PDF ไม่สำเร็จ",
    });
  };

  const handleExportJPG = async () => {
    if (!currentTableRef.current) return;
    setIsExportingJpg(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const exportPromise = exportElementToJPG(
      currentTableRef.current,
      `สรุปยอดโบนัส-C2C-${year}-${String(month).padStart(2, "0")}.jpg`
    );
    toast.promise(exportPromise, {
      loading: "กำลังสร้าง JPG...",
      success: "ดาวน์โหลด JPG สำเร็จ",
      error: "สร้าง JPG ไม่สำเร็จ",
    });
    try {
      await exportPromise;
    } catch {
      // toast.promise already reports the export failure to the user.
    } finally {
      setIsExportingJpg(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="dashboard-enter flex items-start gap-3 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
          <Gift className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">สรุปยอดโบนัส C2C</h2>
          <p className="mt-1 text-xs text-muted-foreground">ดูโบนัสรายวัน สัดส่วนโบนัส และแนวโน้มของแต่ละเดือน</p>
        </div>
      </div>
      <div className="dashboard-enter rounded-2xl border border-border/80 bg-card/70 p-3 shadow-sm backdrop-blur" style={{ "--dashboard-delay": "100ms" } as React.CSSProperties}>
      <SummaryToolbar
        year={year}
        month={month}
        onMonthChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
        searchQuery={search}
        onSearchChange={setSearch}
        onExportExcel={() => exportBonusExcel(currentSummary)}
        onExportPDF={handleExportPDF}
        onExportJPG={handleExportJPG}
      />
      </div>

      <div ref={tablesRef} className="dashboard-enter grid grid-cols-1 gap-4 bg-background lg:grid-cols-2" style={{ "--dashboard-delay": "160ms" } as React.CSSProperties}>
        <BonusSummaryTable summary={prevSummary} searchQuery={search} />
        <div ref={currentTableRef} className="min-w-0">
          <BonusSummaryTable summary={currentSummary} searchQuery={search} exportMode={isExportingJpg} />
        </div>
      </div>
    </div>
  );
}
