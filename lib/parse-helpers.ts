/**
 * Helpers for turning messy Excel cell values (numbers, Excel date serials,
 * or free-text dates/numbers) into clean JS values.
 */

const TEXT_DATE_PATTERNS: { regex: RegExp; build: (m: RegExpMatchArray) => Date | null }[] = [
  // 2026-07-16 18:22[:00]  or 2026-07-16
  {
    regex: /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    build: (m) => {
      const [, y, mo, d, h = "0", mi = "0", s = "0"] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
    },
  },
  // 16/07/2026 18:22  or 16/07/2026 (DD/MM/YYYY)
  {
    regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    build: (m) => {
      const [, d, mo, y, h = "0", mi = "0", s = "0"] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
    },
  },
  // 16-07-2026 (DD-MM-YYYY)
  {
    regex: /^(\d{1,2})-(\d{1,2})-(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    build: (m) => {
      const [, d, mo, y, h = "0", mi = "0", s = "0"] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
    },
  },
];

/** Excel's epoch: day 0 = 1899-12-30 (accounts for the classic leap-year bug). */
function excelSerialToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400; // seconds
  const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  let totalSeconds = Math.floor(86400 * fractionalDay);
  const date = new Date(utcValue * 1000);
  const seconds = totalSeconds % 60;
  totalSeconds -= seconds;
  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor(totalSeconds / 60) % 60;
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes, seconds)
  );
}

/** Parses a cell value that should represent a timestamp into a JS Date, or null if it can't be parsed. */
export function parseCellDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    const d = excelSerialToDate(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    for (const { regex, build } of TEXT_DATE_PATTERNS) {
      const m = trimmed.match(regex);
      if (m) {
        const d = build(m);
        if (d && !Number.isNaN(d.getTime())) return d;
      }
    }
    // Last resort: let the JS engine try
    const fallback = new Date(trimmed);
    if (!Number.isNaN(fallback.getTime())) return fallback;
  }
  return null;
}

/** Parses a cell value that should represent a number, tolerating thousands separators. */
export function parseCellNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return 0;
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function parseCellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/** Formats a Date as DD/MM/YYYY, used as the day-grouping key everywhere in this app. */
export function toDateKey(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}
