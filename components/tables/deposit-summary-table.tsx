"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MonthlyDepositSummary } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { formatThaiMonthYear } from "@/lib/thai-date";
import { useC2CData } from "@/hooks/use-c2c-data";
import { MoreHorizontal, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Inline-editable cell สำหรับยอดฝากรวม */
function EditableTotalDepositCell({
  dateKey,
  value,
  onSave,
}: {
  dateKey: string;
  value: number;
  onSave: (dateKey: string, newValue: number) => Promise<void>;
}) {
  const [editing, setEditing] = React.useState(false);
  const [inputVal, setInputVal] = React.useState(String(value));
  const [saving, setSaving] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // เมื่อเปิด edit mode ให้ focus input
  React.useEffect(() => {
    if (editing) {
      setInputVal(String(value));
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, value]);

  const handleSave = async () => {
    const parsed = parseFloat(inputVal.replace(/,/g, ""));
    if (isNaN(parsed) || parsed < 0) {
      setEditing(false);
      return;
    }
    if (parsed === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(dateKey, parsed);
    setSaving(false);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center justify-end gap-1">
        <input
          ref={inputRef}
          type="number"
          step="0.01"
          min="0"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={saving}
          className="w-36 rounded border border-primary bg-background px-2 py-0.5 text-right text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-primary hover:text-primary"
          onClick={handleSave}
          disabled={saving}
          title="บันทึก"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={() => setEditing(false)}
          disabled={saving}
          title="ยกเลิก"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="group flex cursor-pointer items-center justify-end gap-1.5 rounded px-1 py-0.5 hover:bg-muted/60 transition-colors"
      onClick={() => setEditing(true)}
      title="คลิกเพื่อแก้ไขยอดฝากรวม"
    >
      <span className="tabular-nums">{formatCurrency(value, 2)}</span>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
}

export function DepositSummaryTable({
  summary,
  searchQuery = "",
}: {
  summary: MonthlyDepositSummary;
  searchQuery?: string;
}) {
  const { deleteDayData, updateDayTotalDeposit } = useC2CData();
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
              <TableHead className="text-right">
                ยอดฝากรวม
                <span className="ml-1 text-[10px] font-normal text-muted-foreground">(คลิกเพื่อแก้ไข)</span>
              </TableHead>
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
                  <TableCell className="text-right tabular-nums">
                    {empty ? "" : formatCurrency(d.c2cDeposit, 0)}
                  </TableCell>
                  <TableCell className="text-right p-0 pr-2">
                    {empty ? "" : (
                      <EditableTotalDepositCell
                        dateKey={d.dateKey}
                        value={d.totalDeposit}
                        onSave={updateDayTotalDeposit}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {empty ? "" : formatPercent(d.percent)}
                  </TableCell>
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
