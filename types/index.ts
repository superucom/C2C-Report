export type UserRole = "SUPER" | "HEAD";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface ManagedHeadUser {
  id: string;
  username: string;
  role: "HEAD";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Aggregated daily deposit record stored in database. */
export interface DailyDepositSummaryRecord {
  dateKey: string;
  c2cDeposit: number;
  totalDeposit: number;
}

/** Aggregated daily bonus record stored in database. */
export interface DailyBonusSummaryRecord {
  dateKey: string;
  bonusAmount: number;
}

/** A single row parsed from the deposit ("ยอดฝาก") Excel report. */
export interface DepositRecord {
  timestamp: Date;
  dateKey: string;
  username: string;
  bank: string;
  amountToAG: number;
}

/** A single row parsed from the bonus ("โบนัส") Excel report. */
export interface BonusRecord {
  timestamp: Date;
  dateKey: string;
  username: string;
  amount: number;
  note: string;
  isC2C: boolean;
}

/** One row of the "สรุปยอดฝาก" table. */
export interface DailyDepositSummary {
  dateKey: string; // DD/MM/YYYY
  dateObj: Date;
  c2cDeposit: number; // ยอดฝาก C2C
  totalDeposit: number; // ยอดฝากรวม
  percent: number; // สรุปรวม % ต่อวัน
}

/** One row of the "สรุปยอดโบนัส" table. */
export interface DailyBonusSummary {
  dateKey: string;
  dateObj: Date;
  c2cDeposit: number; // ยอดฝาก C2C (same-day, joined from deposit report)
  bonusAmount: number; // ยอดโบนัส C2C
  bonusPercent: number; // โบนัส %
}

export interface MonthlyTotals {
  c2cDeposit: number;
  totalDeposit: number;
  percent: number;
}

export interface MonthlyBonusTotals {
  c2cDeposit: number;
  bonusAmount: number;
  bonusPercent: number;
}

export interface MonthlyDepositSummary {
  year: number;
  month: number; // 1-12
  days: DailyDepositSummary[];
  total: MonthlyTotals;
  average: MonthlyTotals;
}

export interface MonthlyBonusSummary {
  year: number;
  month: number;
  days: DailyBonusSummary[];
  total: MonthlyBonusTotals;
  average: MonthlyBonusTotals;
}

export interface DashboardDailyPoint {
  dateKey: string;
  dateObj: Date;
  c2cDeposit: number;
  totalDeposit: number;
  bonusAmount: number;
}

export interface DashboardSummary {
  todayC2CDeposit: number;
  todayTotalDeposit: number;
  todayBonus: number;
  todayBonusPercent: number;
  daily: DashboardDailyPoint[]; // for the selected month
  monthlyDepositTotal: number;
  monthlyC2CTotal: number;
  monthlyBonusTotal: number;
}

export interface ParsedFileMeta {
  fileName: string;
  rowCount: number;
  uploadedAt: Date;
}

export interface ValidationError {
  message: string;
  missingColumns: string[];
}

export type ParseResult<T> =
  | { ok: true; records: T[]; summaries: unknown[]; meta: ParsedFileMeta }
  | { ok: false; error: ValidationError };
