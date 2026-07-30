"use client";

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MonthlyDepositSummary } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { formatThaiMonthYear } from "@/lib/thai-date";
import { useC2CData } from "@/hooks/use-c2c-data";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DepositSummaryTable({
  summary,
  searchQuery = "",
}: {
  summary: MonthlyDepositSummary;
  searchQuery?: string;
}) {
  const { deleteDayData } = useC2CData();
  const hasAnyData = summary.days.some((d) => d.totalDeposit > 0 || d.c2cDeposit > 0);
  const visibleDays = searchQuery
    ? summary.days.filter((d) => d.dateKey.includes(searchQuery.trim()))
    : summary.days;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="bg-primary px-4 py-3 text-center">
        <p className="text-sm font-semibold text-primary-foreground">สรุปยอดฝาก C2C รายวัน ucompany</p>
        <p className="text-xs text-primary-foreground/80">เดือน{formatThaiMonthYear(summary.year, summary.month)}</p>
      </div>

      <div className="max-h-[560px] overflow-auto scrollbar-none">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-secondary">
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead className="text-right">ยอดฝาก C2C</TableHead>
              <TableHead className="text-right">ยอดฝากรวม</TableHead>
              <TableHead className="text-right">สรุปรวม % ต่อวัน</TableHead>
              <TableHead className="w-[80px] text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleDays.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                  ไม่พบวันที่ที่ค้นหา
                </TableCell>
              </TableRow>
            )}
            {visibleDays.map((d) => {
              const empty = d.totalDeposit === 0 && d.c2cDeposit === 0;
              return (
                <TableRow key={d.dateKey}>
                  <TableCell className="font-medium">{d.dateKey}</TableCell>
                  <TableCell className="text-right tabular-nums">{empty ? "" : formatCurrency(d.c2cDeposit, 0)}</TableCell>
                  <TableCell className="text-right tabular-nums">{empty ? "" : formatCurrency(d.totalDeposit, 2)}</TableCell>
                  <TableCell className="text-right tabular-nums">{empty ? "" : formatPercent(d.percent)}</TableCell>
                  <TableCell className="text-center">
                    {!empty && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => {
                          if (confirm(`คุณต้องการลบข้อมูลประจำวันที่ ${d.dateKey} ใช่หรือไม่?`)) {
                            deleteDayData(d.dateKey);
                          }
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>สรุปรายเดือน</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(summary.total.c2cDeposit, 0)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(summary.total.totalDeposit, 2)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPercent(summary.total.percent)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ยอดเฉลี่ย</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(summary.average.c2cDeposit, 2)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(summary.average.totalDeposit, 2)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPercent(summary.average.percent)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {!hasAnyData && (
        <p className="p-4 text-center text-xs text-muted-foreground">ยังไม่มีข้อมูลสำหรับเดือนนี้ — อัปโหลดไฟล์ Excel ยอดฝากด้านบน</p>
      )}
    </div>
  );
}
