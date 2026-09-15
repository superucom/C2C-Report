"use client";

import * as React from "react";
import { KeyRound, LockKeyhole, RefreshCw, ShieldCheck, Trash2, UserRound, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import type { ManagedHeadUser } from "@/types";
import { CreateHeadUser } from "@/components/user-management/create-head-user";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(value));
}

export function ManageHeadUsers() {
  const [users, setUsers] = React.useState<ManagedHeadUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [resetId, setResetId] = React.useState<string | null>(null);
  const [resetPassword, setResetPassword] = React.useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = React.useState("");

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error || "ไม่สามารถโหลดรายการบัญชีได้");
        return;
      }
      setUsers(data.users || []);
    } catch (error) {
      console.error("Load managed users failed:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดรายการบัญชี");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const updateUser = async (id: string, body: Record<string, string>) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error || "ไม่สามารถจัดการบัญชีได้");
        return false;
      }
      setUsers((current) => current.map((user) => (user.id === id ? data.user : user)));
      return true;
    } catch (error) {
      console.error("Manage user failed:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (id: string) => {
    if (resetPassword.length < 8) {
      toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      toast.error("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    const success = await updateUser(id, { action: "password", newPassword: resetPassword, confirmPassword: resetConfirmPassword });
    if (success) {
      setResetId(null);
      setResetPassword("");
      setResetConfirmPassword("");
      toast.success("เปลี่ยนรหัสผ่าน Head เรียบร้อยแล้ว");
    }
  };

  const handleDelete = async (user: ManagedHeadUser) => {
    if (!window.confirm(`ต้องการลบบัญชี ${user.username} ใช่หรือไม่? การลบจะไม่สามารถย้อนกลับได้`)) return;
    setBusyId(user.id);
    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error || "ไม่สามารถลบบัญชีได้");
        return;
      }
      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast.success(`ลบบัญชี ${user.username} เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("Delete user failed:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <CreateHeadUser onCreated={() => void loadUsers()} />

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
              <UserRoundPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">บัญชี Head ที่สร้าง</h2>
              <p className="mt-1 text-sm text-muted-foreground">ดูสถานะ ระงับการเข้าใช้งาน เปลี่ยนรหัสผ่าน หรือ ลบบัญชี Head</p>
            </div>
          </div>
          <button type="button" onClick={() => void loadUsers()} disabled={isLoading} className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-secondary disabled:opacity-50">
            <RefreshCw className={isLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            รีเฟรช
          </button>
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">กำลังโหลดรายการบัญชี...</div>
        ) : users.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">ยังไม่มีบัญชี Head</div>
        ) : (
          <div className="mt-5 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border border-border/80 bg-background p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><UserRound className="h-4 w-4" /></div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{user.username}</p>
                        <span className={user.isActive ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400" : "rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"}>
                          {user.isActive ? "ใช้งานอยู่" : "ระงับแล้ว"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">สร้างเมื่อ {formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busyId === user.id} onClick={() => void updateUser(user.id, { action: user.isActive ? "suspend" : "activate" })} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium hover:bg-secondary disabled:opacity-50">
                      {user.isActive ? <LockKeyhole className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                      {user.isActive ? "ระงับ" : "เปิดใช้งาน"}
                    </button>
                    <button type="button" disabled={busyId === user.id} onClick={() => { setResetId(resetId === user.id ? null : user.id); setResetPassword(""); setResetConfirmPassword(""); }} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium hover:bg-secondary disabled:opacity-50">
                      <KeyRound className="h-3.5 w-3.5" /> เปลี่ยนรหัสผ่าน
                    </button>
                    <button type="button" disabled={busyId === user.id} onClick={() => void handleDelete(user)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/30 px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" /> ลบ
                    </button>
                  </div>
                </div>

                {resetId === user.id && (
                  <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <label className="space-y-1.5"><span className="text-xs font-medium">รหัสผ่านใหม่</span><input type="password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} minLength={8} autoComplete="new-password" placeholder="อย่างน้อย 8 ตัวอักษร" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></label>
                    <label className="space-y-1.5"><span className="text-xs font-medium">ยืนยันรหัสผ่านใหม่</span><input type="password" value={resetConfirmPassword} onChange={(event) => setResetConfirmPassword(event.target.value)} minLength={8} autoComplete="new-password" placeholder="กรอกอีกครั้ง" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></label>
                    <button type="button" disabled={busyId === user.id} onClick={() => void handleResetPassword(user.id)} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">บันทึกรหัสผ่าน</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
