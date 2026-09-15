"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export function CreateHeadUser({ onCreated }: { onCreated?: () => void }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error || "ไม่สามารถสร้าง Username ได้");
        return;
      }
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      onCreated?.();
      toast.success(`สร้าง Username ${data.user.username} สำหรับ Head เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("Create Head user failed:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserPlus className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold">สร้างบัญชี Head</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            สร้าง Username สำหรับผู้ใช้งาน Head โดยบัญชีใหม่จะได้รับสิทธิ์ใช้งานรายงานทั้งหมด ยกเว้นการเพิ่ม Username
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
        บัญชีที่สร้างจากหน้านี้จะถูกกำหนด Role เป็น Head อัตโนมัติ
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:grid-cols-4 sm:items-end">
        <label className="space-y-1.5">
          <span className="text-xs font-medium">Username</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={50} required placeholder="เช่น Head01" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium">รหัสผ่าน</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required placeholder="อย่างน้อย 8 ตัวอักษร" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium">ยืนยันรหัสผ่าน</span>
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required placeholder="กรอกรหัสผ่านอีกครั้ง" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
        <button type="submit" disabled={isSubmitting} className="flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? "กำลังสร้าง..." : "สร้าง Head"}
        </button>
      </form>
    </section>
  );
}
