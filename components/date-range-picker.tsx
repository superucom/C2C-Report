"use client";

import { Calendar } from "lucide-react";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  // Helpers for preset buttons
  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onChange(formatLocalDate(start), formatLocalDate(end));
  };

  const setLast7Days = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    onChange(formatLocalDate(start), formatLocalDate(now));
  };

  const setLast30Days = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    onChange(formatLocalDate(start), formatLocalDate(now));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/60 p-2 shadow-sm backdrop-blur">
      {/* Date Pickers */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <Calendar className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => e.target.value && onChange(e.target.value, endDate)}
            className="rounded-lg border border-input bg-background pl-8 pr-2 py-1 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">ถึง</span>
        <div className="relative flex items-center">
          <Calendar className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => e.target.value && onChange(startDate, e.target.value)}
            className="rounded-lg border border-input bg-background pl-8 pr-2 py-1 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={setThisMonth}
          className="rounded-md border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          เดือนนี้
        </button>
        <button
          type="button"
          onClick={setLast7Days}
          className="rounded-md border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          7 วันล่าสุด
        </button>
        <button
          type="button"
          onClick={setLast30Days}
          className="rounded-md border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          30 วันล่าสุด
        </button>
      </div>
    </div>
  );
}
