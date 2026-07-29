"use client";

import * as React from "react";
import { Download, FileDown, FileSpreadsheet, Search } from "lucide-react";
import { MonthPicker } from "@/components/month-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SummaryToolbarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export function SummaryToolbar({
  year,
  month,
  onMonthChange,
  searchQuery,
  onSearchChange,
  onExportExcel,
  onExportPDF,
}: SummaryToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <MonthPicker year={year} month={month} onChange={onMonthChange} />

      <div className="flex flex-1 items-center gap-2 sm:justify-end">
        <div className="relative w-full max-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาวันที่ เช่น 16/07/2026"
            className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF}>
              <FileDown className="h-4 w-4" />
              Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
