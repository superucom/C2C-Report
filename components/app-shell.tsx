"use client";

import { BarChart3, LayoutDashboard, Loader2, LogOut, UserCheck, Users, Wallet } from "lucide-react";
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
import { CreateHeadUser } from "@/components/user-management/create-head-user";

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
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight sm:text-lg">ระบบสรุปรายงาน C2C</h1>
              <p className="text-xs text-muted-foreground">สรุปยอดฝากและยอดโบนัส C2C อัตโนมัติ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile Badge */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              <span>{user?.username} · {user?.role === "SUPER" ? "Super" : "Head"}</span>
            </div>

            <ThemeToggle />

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
              title="ออกจากระบบ"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
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
          {user?.role === "SUPER" && (
            <TabsContent value="accounts">
              <CreateHeadUser />
            </TabsContent>
          )}
        </Tabs>

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
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        ระบบสรุปรายงาน C2C · ประมวลผลข้อมูลทั้งหมดในเบราว์เซอร์ของคุณ ไม่มีการอัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์
      </footer>
    </div>
  );
}
