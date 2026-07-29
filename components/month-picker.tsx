"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THAI_MONTHS, shiftMonth } from "@/lib/thai-date";

interface MonthPickerProps {
  year: number;
  month: number; // 1-12
  onChange: (year: number, month: number) => void;
  yearRange?: number; // years before/after current year to offer
}

export function MonthPicker({ year, month, onChange, yearRange = 3 }: MonthPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: yearRange * 2 + 1 }, (_, i) => currentYear - yearRange + i);

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        aria-label="เดือนก่อนหน้า"
        onClick={() => {
          const s = shiftMonth(year, month, -1);
          onChange(s.year, s.month);
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={String(month)} onValueChange={(v) => onChange(year, Number(v))}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {THAI_MONTHS.map((m, idx) => (
            <SelectItem key={m} value={String(idx + 1)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(year)} onValueChange={(v) => onChange(Number(v), month)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        aria-label="เดือนถัดไป"
        onClick={() => {
          const s = shiftMonth(year, month, 1);
          onChange(s.year, s.month);
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
