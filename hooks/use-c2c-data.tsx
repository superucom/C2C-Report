"use client";

import * as React from "react";
import { toast } from "sonner";
import type { DailyBonusSummaryRecord, DailyDepositSummaryRecord, ParsedFileMeta } from "@/types";
import { parseBonusExcel, parseDepositExcel } from "@/services/excel-parser";

interface C2CDataContextValue {
  depositRecords: DailyDepositSummaryRecord[];
  bonusRecords: DailyBonusSummaryRecord[];
  depositMeta: ParsedFileMeta | null;
  bonusMeta: ParsedFileMeta | null;
  isParsingDeposit: boolean;
  isParsingBonus: boolean;
  uploadDepositFile: (file: File) => Promise<void>;
  uploadBonusFile: (file: File) => Promise<void>;
  deleteDayData: (dateKey: string) => Promise<void>;
}

const C2CDataContext = React.createContext<C2CDataContextValue | null>(null);

export function C2CDataProvider({ children }: { children: React.ReactNode }) {
  const [depositSummaries, setDepositSummaries] = React.useState<DailyDepositSummaryRecord[]>([]);
  const [bonusSummaries, setBonusSummaries] = React.useState<DailyBonusSummaryRecord[]>([]);
  const [depositMeta, setDepositMeta] = React.useState<ParsedFileMeta | null>(null);
  const [bonusMeta, setBonusMeta] = React.useState<ParsedFileMeta | null>(null);
  const [isParsingDeposit, setIsParsingDeposit] = React.useState(false);
  const [isParsingBonus, setIsParsingBonus] = React.useState(false);

  // Helper to fetch all C2C data and update state
  const refreshAllData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/c2c-data");
      if (res.ok) {
        const data = await res.json();
        
        const depositMetaParsed = data.depositMeta
          ? {
              ...data.depositMeta,
              uploadedAt: new Date(data.depositMeta.uploadedAt),
            }
          : null;
        const bonusMetaParsed = data.bonusMeta
          ? {
              ...data.bonusMeta,
              uploadedAt: new Date(data.bonusMeta.uploadedAt),
            }
          : null;

        setDepositSummaries(data.depositSummaries || []);
        setBonusSummaries(data.bonusSummaries || []);
        setDepositMeta(depositMetaParsed);
        setBonusMeta(bonusMetaParsed);
      } else {
        console.error("Failed to fetch C2C data:", await res.text());
      }
    } catch (err) {
      console.error("Failed to refresh C2C data:", err);
    }
  }, []);

  // Load data from database on mount
  React.useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const uploadDepositFile = React.useCallback(async (file: File) => {
    setIsParsingDeposit(true);
    try {
      const result = await parseDepositExcel(file);
      if (!result.ok) {
        toast.error(result.error.message, {
          description: `ขาดคอลัมน์: ${result.error.missingColumns.join(", ")}`,
        });
        return;
      }

      // Save daily summaries to database via POST
      const saveRes = await fetch("/api/deposit/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaries: result.summaries,
          meta: result.meta,
        }),
      });

      if (!saveRes.ok) {
        const errMsg = await saveRes.text();
        throw new Error(errMsg || "ไม่สามารถบันทึกข้อมูลสรุปยอดฝากลงฐานข้อมูลได้");
      }

      // Refetch the full accumulated dataset
      await refreshAllData();

      toast.success("บันทึกไฟล์ยอดฝากเรียบร้อยแล้ว (จัดเก็บเฉพาะสรุปประจำวัน)", {
        description: `${file.name} — ประมวลผล ${result.meta.rowCount.toLocaleString("th-TH")} แถว -> สรุป ${result.summaries.length} วัน`,
      });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("ไม่สามารถอ่านหรือบันทึกไฟล์ได้", { description: msg });
    } finally {
      setIsParsingDeposit(false);
    }
  }, [refreshAllData]);

  const uploadBonusFile = React.useCallback(async (file: File) => {
    setIsParsingBonus(true);
    try {
      const result = await parseBonusExcel(file);
      if (!result.ok) {
        toast.error(result.error.message, {
          description: `ขาดคอลัมน์: ${result.error.missingColumns.join(", ")}`,
        });
        return;
      }

      // Save daily summaries to database via POST
      const saveRes = await fetch("/api/bonus/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaries: result.summaries,
          meta: result.meta,
        }),
      });

      if (!saveRes.ok) {
        const errMsg = await saveRes.text();
        throw new Error(errMsg || "ไม่สามารถบันทึกข้อมูลสรุปโบนัสลงฐานข้อมูลได้");
      }

      // Refetch the full accumulated dataset
      await refreshAllData();

      toast.success("บันทึกไฟล์โบนัสเรียบร้อยแล้ว (จัดเก็บเฉพาะสรุปประจำวัน)", {
        description: `${file.name} — ประมวลผล ${result.meta.rowCount.toLocaleString("th-TH")} แถว -> สรุป ${result.summaries.length} วัน`,
      });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("ไม่สามารถอ่านหรือบันทึกไฟล์ได้", { description: msg });
    } finally {
      setIsParsingBonus(false);
    }
  }, [refreshAllData]);

  const deleteDayData = React.useCallback(async (dateKey: string) => {
    try {
      const res = await fetch(`/api/c2c-data?dateKey=${encodeURIComponent(dateKey)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "ไม่สามารถลบข้อมูลประจำวันได้");
      }

      // Update state locally immediately
      setDepositSummaries((prev) => prev.filter((r) => r.dateKey !== dateKey));
      setBonusSummaries((prev) => prev.filter((r) => r.dateKey !== dateKey));

      // Fetch the updated dataset and metadata from DB
      await refreshAllData();

      toast.success(`ลบข้อมูลประจำวันที่ ${dateKey} เรียบร้อยแล้ว`);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("ไม่สามารถลบข้อมูลได้", { description: msg });
    }
  }, [refreshAllData]);

  const value: C2CDataContextValue = {
    depositRecords: depositSummaries,
    bonusRecords: bonusSummaries,
    depositMeta,
    bonusMeta,
    isParsingDeposit,
    isParsingBonus,
    uploadDepositFile,
    uploadBonusFile,
    deleteDayData,
  };

  return <C2CDataContext.Provider value={value}>{children}</C2CDataContext.Provider>;
}

export function useC2CData() {
  const ctx = React.useContext(C2CDataContext);
  if (!ctx) throw new Error("useC2CData must be used within C2CDataProvider");
  return ctx;
}
