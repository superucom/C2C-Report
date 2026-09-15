import { NextResponse } from "next/server";
import { createSession, getCurrentUser, hashPassword, revokeAllUserSessions, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

    const body = await request.json();
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!currentPassword) return NextResponse.json({ error: "กรุณากรอกรหัสผ่านเดิม" }, { status: 400 });
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: "รหัสผ่านเดิมไม่ถูกต้อง" }, { status: 400 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(newPassword) } });
    await revokeAllUserSessions(user.id);
    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "ไม่สามารถเปลี่ยนรหัสผ่านได้" }, { status: 500 });
  }
}
