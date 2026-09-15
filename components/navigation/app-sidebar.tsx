"use client";

import { BarChart3, Gift, KeyRound, LayoutDashboard, Users, WalletCards, X } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuthUser } from "@/types";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  user: AuthUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const itemClassName = "w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/15";

export function AppSidebar({ user, isOpen, onClose }: AppSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(82vw,18rem)] flex-col border-r border-border/80 bg-card/95 px-4 py-5 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-[73px] lg:z-10 lg:h-[calc(100vh-73px)] lg:w-64 lg:translate-x-0 lg:rounded-none lg:border-r lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">เมนูระบบ</span>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิดเมนู" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 px-2 lg:mt-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
          <p className="mt-1 text-xs text-muted-foreground">ศูนย์ควบคุมรายงาน C2C</p>
        </div>

        <TabsList className="mt-5 h-auto w-full flex-col items-stretch justify-start gap-1 overflow-visible rounded-none bg-transparent p-0 shadow-none">
          <TabsTrigger value="dashboard" onClick={onClose} className={itemClassName}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="deposit" onClick={onClose} className={itemClassName}>
            <WalletCards className="h-4 w-4" />
            สรุปยอดฝาก
          </TabsTrigger>
          <TabsTrigger value="bonus" onClick={onClose} className={itemClassName}>
            <Gift className="h-4 w-4" />
            สรุปยอดโบนัส
          </TabsTrigger>
          <div className="my-3 h-px bg-border/70" aria-hidden="true" />
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Account</p>
          <TabsTrigger value="account" onClick={onClose} className={itemClassName}>
            <KeyRound className="h-4 w-4" />
            บัญชีของฉัน
          </TabsTrigger>
          {user?.role === "SUPER" && (
            <TabsTrigger value="accounts" onClick={onClose} className={itemClassName}>
              <Users className="h-4 w-4" />
              จัดการบัญชี
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-auto rounded-2xl border border-primary/15 bg-primary/5 p-3">
          <p className="text-xs font-semibold">{user?.username}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">สิทธิ์ {user?.role === "SUPER" ? "Super" : "Head"}</p>
        </div>
      </aside>
    </>
  );
}
