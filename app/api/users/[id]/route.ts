import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, revokeAllUserSessions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSuper() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 }) };
  if (currentUser.role !== "SUPER") {
    return { error: NextResponse.json({ error: "เฉพาะ Super เท่านั้นที่จัดการบัญชี Head ได้" }, { status: 403 }) };
  }
  return { currentUser };
}

function publicUser(user: { id: string; username: string; role: "SUPER" | "HEAD"; isActive: boolean; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireSuper();
    if (access.error) return access.error;
    const { id } = await params;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "ไม่พบบัญชีที่ต้องการ" }, { status: 404 });
    if (target.role !== "HEAD") return NextResponse.json({ error: "ไม่สามารถจัดการบัญชี Super ได้" }, { status: 403 });

    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "suspend" || action === "activate") {
      const user = await prisma.user.update({
        where: { id: target.id },
        data: { isActive: action === "activate" },
      });
      if (action === "suspend") await revokeAllUserSessions(target.id);
      return NextResponse.json({ success: true, user: publicUser(user) });
    }

    if (action === "password") {
      const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
      const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" }, { status: 400 });
      }
      const user = await prisma.user.update({
        where: { id: target.id },
        data: { passwordHash: hashPassword(newPassword) },
      });
      await revokeAllUserSessions(target.id);
      return NextResponse.json({ success: true, user: publicUser(user) });
    }

    return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  } catch (error) {
    console.error("Error managing user:", error);
    return NextResponse.json({ error: "ไม่สามารถจัดการบัญชีได้" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireSuper();
    if (access.error) return access.error;
    const { id } = await params;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "ไม่พบบัญชีที่ต้องการ" }, { status: 404 });
    if (target.role !== "HEAD") return NextResponse.json({ error: "ไม่สามารถลบบัญชี Super ได้" }, { status: 403 });

    await prisma.user.delete({ where: { id: target.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "ไม่สามารถลบบัญชีได้" }, { status: 500 });
  }
}
