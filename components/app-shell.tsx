"use client";

import type { CSSProperties } from "react";
import { BarChart3, Database, KeyRound, LayoutDashboard, Loader2, LogOut, UploadCloud, UserCheck, Users, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { DashboardTab } from "@/components/dashboard/dashboard-tab";
import { DepositTab } from "@/components/dashboard/deposit-tab";
import { BonusTab } from "@/components/dashboard/bonus-tab";
import { useC2CData } from "@/hooks/use-c2c-data";
import { useAuth } from "@/hooks/use-auth";
import { LoginCard } from "@/components/login-card";
import { AccountTab } from "@/components/account/account-tab";
import { ManageHeadUsers } from "@/components/user-management/manage-head-users";

export function AppShell() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const {
    depositMeta,
    bonusMeta,
    isParsingDeposit,
    isParsingBonus,
    uploadDepositFile,
    uploadBonusFile,
  } = useC2CData();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">กำลังตรวจสอบสิทธิ์เข้าใช้งาน...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginCard />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_color-mix(in_oklch,var(--primary)_24%,transparent)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight sm:text-lg">ระบบสรุปรายงาน C2C</h1>
              <p className="text-xs text-muted-foreground">สรุปยอดฝากและยอดโบนัส C2C อัตโนมัติ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile Badge */}
            <div className="hidden items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground sm:flex">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              <span>{user?.username} · {user?.role === "SUPER" ? "Super" : "Head"}</span>
            </div>

            <ThemeToggle />

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              title="ออกจากระบบ"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl space-y-7 overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -right-40 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-48 top-[32rem] h-96 w-96 rounded-full bg-accent/5 blur-3xl" aria-hidden="true" />
        <KpiCards />

        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="deposit" className="gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              สรุปยอดฝาก
            </TabsTrigger>
            <TabsTrigger value="bonus" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              สรุปยอดโบนัส
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              บัญชีของฉัน
            </TabsTrigger>
            {user?.role === "SUPER" && (
              <TabsTrigger value="accounts" className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                จัดการบัญชี
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="deposit">
            <DepositTab />
          </TabsContent>
          <TabsContent value="bonus">
            <BonusTab />
          </TabsContent>
          <TabsContent value="account">
            <AccountTab />
          </TabsContent>
          {user?.role === "SUPER" && (
            <TabsContent value="accounts">
              <ManageHeadUsers />
            </TabsContent>
          )}
        </Tabs>

        <section className="dashboard-enter space-y-3" style={{ "--dashboard-delay": "260ms" } as CSSProperties}>
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">นำเข้าข้อมูลรายงาน</h2>
              <p className="text-xs text-muted-foreground">อัปเดตข้อมูลยอดฝากและโบนัสจากไฟล์ Excel</p>
            </div>
            <div className="ml-auto hidden items-center gap-1.5 text-[11px] font-medium text-muted-foreground sm:flex">
              <Database className="h-3.5 w-3.5" /> ข้อมูลจะถูกประมวลผลในระบบเดิม
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UploadDropzone
            title="Upload Excel ยอดฝาก"
            description="ไฟล์รายงานยอดฝาก (Timestamp, Bank, ยอดเติมเข้า AG)"
            accentColor="primary"
            isLoading={isParsingDeposit}
            meta={depositMeta}
            onFile={uploadDepositFile}
          />
          <UploadDropzone
            title="Upload Excel โบนัส"
            description="ไฟล์รายงานโบนัส (Timestamp, ยอดเงิน, หมายเหตุ)"
            accentColor="accent"
            isLoading={isParsingBonus}
            meta={bonusMeta}
            onFile={uploadBonusFile}
          />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80 bg-card/30 py-6 text-center text-xs text-muted-foreground">
        ระบบสรุปรายงาน C2C · ประมวลผลข้อมูลทั้งหมดในเบราว์เซอร์ของคุณ ไม่มีการอัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์
      </footer>
    </div>
  );
}
