"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export function CreateHeadUser() {
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
      toast.success(`สร้าง Username ${data.user.username} สำหรับ Head เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("Create Head user failed:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <details className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-primary">
        <UserPlus className="h-4 w-4" />
        เพิ่ม Username สำหรับ Head
      </summary>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-4 sm:items-end">
        <label className="space-y-1.5"><span className="text-xs font-medium">Username</span><input value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={50} required placeholder="เช่น Head01" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></label>
        <label className="space-y-1.5"><span className="text-xs font-medium">รหัสผ่าน</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required placeholder="อย่างน้อย 8 ตัวอักษร" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></label>
        <label className="space-y-1.5"><span className="text-xs font-medium">ยืนยันรหัสผ่าน</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required placeholder="กรอกรหัสผ่านอีกครั้ง" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></label>
        <button type="submit" disabled={isSubmitting} className="flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"><UserPlus className="h-4 w-4" />{isSubmitting ? "กำลังสร้าง..." : "สร้าง Head"}</button>
      </form>
    </details>
  );
}
