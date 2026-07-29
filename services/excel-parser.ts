import * as XLSX from "xlsx";
import type { BonusRecord, DailyBonusSummaryRecord, DailyDepositSummaryRecord, DepositRecord, ParseResult } from "@/types";
import { parseCellDate, parseCellNumber, parseCellText, toDateKey } from "@/lib/parse-helpers";

type Matrix = unknown[][];

/** Reads the first sheet of a workbook file into a raw 2D array of cell values. */
async function readFirstSheetMatrix(file: File): Promise<Matrix> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
  });
}

/** Finds the row index that contains all of the given header labels (trimmed, case-insensitive). */
function findHeaderRow(matrix: Matrix, requiredHeaders: string[]): number {
  const normalizedRequired = requiredHeaders.map((h) => h.trim().toLowerCase());
  for (let r = 0; r < Math.min(matrix.length, 30); r++) {
    const row = matrix[r] ?? [];
    const normalizedCells = row.map((c) => String(c ?? "").trim().toLowerCase());
    const hasAll = normalizedRequired.every((h) => normalizedCells.includes(h));
    if (hasAll) return r;
  }
  return -1;
}

function findColumnIndex(headerRow: unknown[], label: string): number {
  const target = label.trim().toLowerCase();
  return headerRow.findIndex((c) => String(c ?? "").trim().toLowerCase() === target);
}

const DEPOSIT_REQUIRED_HEADERS = ["Timestamp", "Bank", "ยอดเติมเข้า AG"];
const BONUS_REQUIRED_HEADERS = ["Timestamp", "ยอดเงิน", "หมายเหตุ"];
const C2C_BANK_NAME = "c2c payment";

export async function parseDepositExcel(file: File): Promise<ParseResult<DepositRecord>> {
  const matrix = await readFirstSheetMatrix(file);
  const headerRowIdx = findHeaderRow(matrix, DEPOSIT_REQUIRED_HEADERS);

  if (headerRowIdx === -1) {
    const missing = DEPOSIT_REQUIRED_HEADERS.filter((h) => {
      return !matrix.slice(0, 30).some((row) =>
        row.some((c) => String(c ?? "").trim().toLowerCase() === h.trim().toLowerCase())
      );
    });
    return {
      ok: false,
      error: {
        message: "รูปแบบไฟล์ไม่ถูกต้อง",
        missingColumns: missing.length > 0 ? missing : DEPOSIT_REQUIRED_HEADERS,
      },
    };
  }

  const headerRow = matrix[headerRowIdx];
  const idxTimestamp = findColumnIndex(headerRow, "Timestamp");
  const idxUsername = findColumnIndex(headerRow, "Username");
  const idxBank = findColumnIndex(headerRow, "Bank");
  const idxAmountToAG = findColumnIndex(headerRow, "ยอดเติมเข้า AG");

  const summaryMap = new Map<string, DailyDepositSummaryRecord>();
  let totalRows = 0;

  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.every((c) => c === "" || c === null || c === undefined)) continue;

    const timestamp = parseCellDate(row[idxTimestamp]);
    if (!timestamp) continue;

    totalRows++;
    const dateKey = toDateKey(timestamp);
    const bank = parseCellText(row[idxBank]);
    const amountToAG = parseCellNumber(row[idxAmountToAG]);

    const existing = summaryMap.get(dateKey) || { dateKey, c2cDeposit: 0, totalDeposit: 0 };
    existing.totalDeposit += amountToAG;
    if (bank.trim().toLowerCase() === C2C_BANK_NAME) {
      existing.c2cDeposit += amountToAG;
    }
    summaryMap.set(dateKey, existing);
  }

  const summaries = Array.from(summaryMap.values());

  return {
    ok: true,
    records: [], // Discard raw records
    summaries,
    meta: { fileName: file.name, rowCount: totalRows, uploadedAt: new Date() },
  };
}

export async function parseBonusExcel(file: File): Promise<ParseResult<BonusRecord>> {
  const matrix = await readFirstSheetMatrix(file);
  const headerRowIdx = findHeaderRow(matrix, BONUS_REQUIRED_HEADERS);

  if (headerRowIdx === -1) {
    const missing = BONUS_REQUIRED_HEADERS.filter((h) => {
      return !matrix.slice(0, 30).some((row) =>
        row.some((c) => String(c ?? "").trim().toLowerCase() === h.trim().toLowerCase())
      );
    });
    return {
      ok: false,
      error: {
        message: "รูปแบบไฟล์ไม่ถูกต้อง",
        missingColumns: missing.length > 0 ? missing : BONUS_REQUIRED_HEADERS,
      },
    };
  }

  const headerRow = matrix[headerRowIdx];
  const idxTimestamp = findColumnIndex(headerRow, "Timestamp");
  const idxAmount = findColumnIndex(headerRow, "ยอดเงิน");
  const idxNote = findColumnIndex(headerRow, "หมายเหตุ");

  const summaryMap = new Map<string, DailyBonusSummaryRecord>();
  let totalRows = 0;

  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.every((c) => c === "" || c === null || c === undefined)) continue;

    const timestamp = parseCellDate(row[idxTimestamp]);
    if (!timestamp) continue;

    totalRows++;
    const dateKey = toDateKey(timestamp);
    const note = parseCellText(row[idxNote]);
    const isC2C = note.toLowerCase().includes("c2c");
    const amount = parseCellNumber(row[idxAmount]);

    if (isC2C) {
      const existing = summaryMap.get(dateKey) || { dateKey, bonusAmount: 0 };
      existing.bonusAmount += amount;
      summaryMap.set(dateKey, existing);
    }
  }

  const summaries = Array.from(summaryMap.values());

  return {
    ok: true,
    records: [], // Discard raw records
    summaries,
    meta: { fileName: file.name, rowCount: totalRows, uploadedAt: new Date() },
  };
}
