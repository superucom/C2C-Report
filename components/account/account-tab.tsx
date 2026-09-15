"use client";

import * as React from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function AccountTab() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Change password failed:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold">บัญชีของฉัน</h2>
          <p className="mt-1 text-sm text-muted-foreground">เปลี่ยนรหัสผ่านของบัญชีที่กำลังใช้งานอยู่</p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร หลังเปลี่ยนรหัสผ่าน ระบบจะออกจากเซสชันอื่นทั้งหมดเพื่อความปลอดภัย</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-3 sm:items-end">
        <label className="space-y-1.5">
          <span className="text-xs font-medium">รหัสผ่านเดิม</span>
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium">รหัสผ่านใหม่</span>
          <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} autoComplete="new-password" required placeholder="อย่างน้อย 8 ตัวอักษร" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
        <div className="flex gap-3 sm:items-end">
          <label className="min-w-0 flex-1 space-y-1.5">
            <span className="text-xs font-medium">ยืนยันรหัสผ่านใหม่</span>
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} autoComplete="new-password" required placeholder="กรอกอีกครั้ง" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </label>
          <button type="submit" disabled={isSubmitting} className="mt-5 flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0">
            <KeyRound className="h-4 w-4" />
            {isSubmitting ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
          </button>
        </div>
      </form>
    </section>
  );
}
