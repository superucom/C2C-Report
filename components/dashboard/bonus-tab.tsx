"use client";

import * as React from "react";
import { useC2CData } from "@/hooks/use-c2c-data";
import { calculateBonusSummary } from "@/lib/calculations";
import { shiftMonth } from "@/lib/thai-date";
import { BonusSummaryTable } from "@/components/tables/bonus-summary-table";
import { SummaryToolbar } from "@/components/tables/summary-toolbar";
import { exportBonusExcel, exportElementToPDF } from "@/services/export";
import { toast } from "sonner";

export function BonusTab() {
  const { depositRecords, bonusRecords } = useC2CData();
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [search, setSearch] = React.useState("");
  const tablesRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-4">
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
      />

      <div ref={tablesRef} className="grid grid-cols-1 gap-4 bg-background lg:grid-cols-2">
        <BonusSummaryTable summary={prevSummary} searchQuery={search} />
        <BonusSummaryTable summary={currentSummary} searchQuery={search} />
      </div>
    </div>
  );
}
