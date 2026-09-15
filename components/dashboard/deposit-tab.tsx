"use client";

import * as React from "react";
import { useC2CData } from "@/hooks/use-c2c-data";
import { calculateDepositSummary } from "@/lib/calculations";
import { shiftMonth } from "@/lib/thai-date";
import { DepositSummaryTable } from "@/components/tables/deposit-summary-table";
import { SummaryToolbar } from "@/components/tables/summary-toolbar";
import { exportDepositExcel, exportElementToJPG, exportElementToPDF } from "@/services/export";
import { toast } from "sonner";
import { ArrowDownToLine } from "lucide-react";

export function DepositTab() {
  const { depositRecords } = useC2CData();
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [search, setSearch] = React.useState("");
  const tablesRef = React.useRef<HTMLDivElement>(null);

  const prev = shiftMonth(year, month, -1);

  const currentSummary = React.useMemo(
    () => calculateDepositSummary(depositRecords, year, month),
    [depositRecords, year, month]
  );
  const prevSummary = React.useMemo(
    () => calculateDepositSummary(depositRecords, prev.year, prev.month),
    [depositRecords, prev.year, prev.month]
  );

  const handleExportPDF = async () => {
    if (!tablesRef.current) return;
    toast.promise(exportElementToPDF(tablesRef.current, `สรุปยอดฝาก-C2C.pdf`), {
      loading: "กำลังสร้าง PDF...",
      success: "ดาวน์โหลด PDF สำเร็จ",
      error: "สร้าง PDF ไม่สำเร็จ",
    });
  };

  const handleExportJPG = async () => {
    if (!tablesRef.current) return;
    toast.promise(exportElementToJPG(tablesRef.current, `สรุปยอดฝาก-C2C.jpg`), {
      loading: "กำลังสร้าง JPG...",
      success: "ดาวน์โหลด JPG สำเร็จ",
      error: "สร้าง JPG ไม่สำเร็จ",
    });
  };

  return (
    <div className="space-y-5">
      <div className="dashboard-enter flex items-start gap-3 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ArrowDownToLine className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">สรุปยอดฝาก C2C</h2>
          <p className="mt-1 text-xs text-muted-foreground">ตรวจสอบยอดฝากรายวัน เปรียบเทียบเดือน และแก้ไขยอดฝากรวมได้จากตาราง</p>
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
        onExportExcel={() => exportDepositExcel(currentSummary)}
        onExportPDF={handleExportPDF}
        onExportJPG={handleExportJPG}
      />
      </div>

      <div ref={tablesRef} className="dashboard-enter grid grid-cols-1 gap-4 bg-background lg:grid-cols-2" style={{ "--dashboard-delay": "160ms" } as React.CSSProperties}>
        <DepositSummaryTable summary={prevSummary} searchQuery={search} />
        <DepositSummaryTable summary={currentSummary} searchQuery={search} />
      </div>
    </div>
  );
}
