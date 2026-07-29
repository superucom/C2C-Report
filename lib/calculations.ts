import type {
  DailyBonusSummary,
  DailyBonusSummaryRecord,
  DailyDepositSummary,
  DailyDepositSummaryRecord,
  DashboardDailyPoint,
  DashboardSummary,
  MonthlyBonusSummary,
  MonthlyDepositSummary,
} from "@/types";
import { toDateKey } from "@/lib/parse-helpers";

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function monthDayKeys(year: number, month: number): { dateKey: string; dateObj: Date }[] {
  const total = daysInMonth(year, month);
  const out: { dateKey: string; dateObj: Date }[] = [];
  for (let d = 1; d <= total; d++) {
    const dateObj = new Date(year, month - 1, d);
    out.push({ dateKey: toDateKey(dateObj), dateObj });
  }
  return out;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function groupDepositsByDay(records: DailyDepositSummaryRecord[]): Map<string, { c2c: number; total: number }> {
  const map = new Map<string, { c2c: number; total: number }>();
  for (const rec of records) {
    map.set(rec.dateKey, { c2c: rec.c2cDeposit, total: rec.totalDeposit });
  }
  return map;
}

function groupBonusByDay(records: DailyBonusSummaryRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const rec of records) {
    map.set(rec.dateKey, rec.bonusAmount);
  }
  return map;
}

export function calculateDepositSummary(
  records: DailyDepositSummaryRecord[],
  year: number,
  month: number
): MonthlyDepositSummary {
  const byDay = groupDepositsByDay(records);
  const days: DailyDepositSummary[] = monthDayKeys(year, month).map(({ dateKey, dateObj }) => {
    const bucket = byDay.get(dateKey);
    const c2cDeposit = bucket?.c2c ?? 0;
    const totalDeposit = bucket?.total ?? 0;
    const percent = totalDeposit > 0 ? round2((c2cDeposit / totalDeposit) * 100) : 0;
    return { dateKey, dateObj, c2cDeposit, totalDeposit, percent };
  });

  const daysWithData = days.filter((d) => d.totalDeposit > 0 || d.c2cDeposit > 0);
  const sum = (fn: (d: DailyDepositSummary) => number) => days.reduce((acc, d) => acc + fn(d), 0);
  const avg = (fn: (d: DailyDepositSummary) => number) =>
    daysWithData.length > 0 ? sum(fn) / daysWithData.length : 0;

  const totalC2C = sum((d) => d.c2cDeposit);
  const totalAll = sum((d) => d.totalDeposit);

  return {
    year,
    month,
    days,
    total: {
      c2cDeposit: round2(totalC2C),
      totalDeposit: round2(totalAll),
      percent: totalAll > 0 ? round2((totalC2C / totalAll) * 100) : 0,
    },
    average: {
      c2cDeposit: round2(avg((d) => d.c2cDeposit)),
      totalDeposit: round2(avg((d) => d.totalDeposit)),
      percent: round2(avg((d) => d.percent)),
    },
  };
}

export function calculateBonusSummary(
  depositRecords: DailyDepositSummaryRecord[],
  bonusRecords: DailyBonusSummaryRecord[],
  year: number,
  month: number
): MonthlyBonusSummary {
  const depositByDay = groupDepositsByDay(depositRecords);
  const bonusByDay = groupBonusByDay(bonusRecords);

  const days: DailyBonusSummary[] = monthDayKeys(year, month).map(({ dateKey, dateObj }) => {
    const c2cDeposit = depositByDay.get(dateKey)?.c2c ?? 0;
    const bonusAmount = bonusByDay.get(dateKey) ?? 0;
    const bonusPercent = c2cDeposit > 0 ? round2((bonusAmount / c2cDeposit) * 100) : 0;
    return { dateKey, dateObj, c2cDeposit, bonusAmount, bonusPercent };
  });

  const daysWithData = days.filter((d) => d.c2cDeposit > 0 || d.bonusAmount > 0);
  const sum = (fn: (d: DailyBonusSummary) => number) => days.reduce((acc, d) => acc + fn(d), 0);
  const avg = (fn: (d: DailyBonusSummary) => number) =>
    daysWithData.length > 0 ? sum(fn) / daysWithData.length : 0;

  const totalC2CDeposit = sum((d) => d.c2cDeposit);
  const totalBonus = sum((d) => d.bonusAmount);

  return {
    year,
    month,
    days,
    total: {
      c2cDeposit: round2(totalC2CDeposit),
      bonusAmount: round2(totalBonus),
      bonusPercent: totalC2CDeposit > 0 ? round2((totalBonus / totalC2CDeposit) * 100) : 0,
    },
    average: {
      c2cDeposit: round2(avg((d) => d.c2cDeposit)),
      bonusAmount: round2(avg((d) => d.bonusAmount)),
      bonusPercent: round2(avg((d) => d.bonusPercent)),
    },
  };
}

export function calculateDashboard(
  depositRecords: DailyDepositSummaryRecord[],
  bonusRecords: DailyBonusSummaryRecord[],
  year: number,
  month: number,
  todayKey: string
): DashboardSummary {
  const depositByDay = groupDepositsByDay(depositRecords);
  const bonusByDay = groupBonusByDay(bonusRecords);

  const daily = monthDayKeys(year, month).map(({ dateKey, dateObj }) => {
    const bucket = depositByDay.get(dateKey);
    return {
      dateKey,
      dateObj,
      c2cDeposit: bucket?.c2c ?? 0,
      totalDeposit: bucket?.total ?? 0,
      bonusAmount: bonusByDay.get(dateKey) ?? 0,
    };
  });

  const todayBucket = depositByDay.get(todayKey);
  const todayC2CDeposit = todayBucket?.c2c ?? 0;
  const todayTotalDeposit = todayBucket?.total ?? 0;
  const todayBonus = bonusByDay.get(todayKey) ?? 0;

  return {
    todayC2CDeposit,
    todayTotalDeposit,
    todayBonus,
    todayBonusPercent: todayC2CDeposit > 0 ? round2((todayBonus / todayC2CDeposit) * 100) : 0,
    daily,
    monthlyDepositTotal: round2(daily.reduce((a, d) => a + d.totalDeposit, 0)),
    monthlyC2CTotal: round2(daily.reduce((a, d) => a + d.c2cDeposit, 0)),
    monthlyBonusTotal: round2(daily.reduce((a, d) => a + d.bonusAmount, 0)),
  };
}

export function calculateDashboardByDateRange(
  depositRecords: DailyDepositSummaryRecord[],
  bonusRecords: DailyBonusSummaryRecord[],
  startDate: Date,
  endDate: Date,
  todayKey: string
): DashboardSummary {
  const depositByDay = groupDepositsByDay(depositRecords);
  const bonusByDay = groupBonusByDay(bonusRecords);

  const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  const daily: DashboardDailyPoint[] = [];
  while (cur <= end) {
    const dateKey = toDateKey(cur);
    const bucket = depositByDay.get(dateKey);
    daily.push({
      dateKey,
      dateObj: new Date(cur),
      c2cDeposit: bucket?.c2c ?? 0,
      totalDeposit: bucket?.total ?? 0,
      bonusAmount: bonusByDay.get(dateKey) ?? 0,
    });
    cur.setDate(cur.getDate() + 1);
  }

  const todayBucket = depositByDay.get(todayKey);
  const todayC2CDeposit = todayBucket?.c2c ?? 0;
  const todayTotalDeposit = todayBucket?.total ?? 0;
  const todayBonus = bonusByDay.get(todayKey) ?? 0;

  return {
    todayC2CDeposit,
    todayTotalDeposit,
    todayBonus,
    todayBonusPercent: todayC2CDeposit > 0 ? round2((todayBonus / todayC2CDeposit) * 100) : 0,
    daily,
    monthlyDepositTotal: round2(daily.reduce((a, d) => a + d.totalDeposit, 0)),
    monthlyC2CTotal: round2(daily.reduce((a, d) => a + d.c2cDeposit, 0)),
    monthlyBonusTotal: round2(daily.reduce((a, d) => a + d.bonusAmount, 0)),
  };
}
