import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    if (currentUser.role !== "SUPER") {
      return NextResponse.json({ error: "เฉพาะ Super เท่านั้นที่สามารถดูบัญชี Head ได้" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { role: "HEAD" },
      orderBy: { createdAt: "desc" },
      select: { id: true, username: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดรายการบัญชีได้" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    if (currentUser.role !== "SUPER") {
      return NextResponse.json({ error: "เฉพาะ Super เท่านั้นที่สามารถเพิ่ม Username ได้" }, { status: 403 });
    }

    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (username.length < 3 || username.length > 50 || /\s/.test(username)) {
      return NextResponse.json({ error: "Username ต้องมีความยาว 3-50 ตัวอักษร และห้ามมีช่องว่าง" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
    }
    if (await prisma.user.findUnique({ where: { username } })) {
      return NextResponse.json({ error: "Username นี้มีอยู่แล้ว" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { username, passwordHash: hashPassword(password), role: "HEAD" },
    });

    return NextResponse.json(
      { success: true, user: { id: user.id, username: user.username, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "ไม่สามารถสร้าง Username ได้" }, { status: 500 });
  }
}
