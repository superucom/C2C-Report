import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    if (!(await getCurrentUser())) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { dateKey } = await params;

    if (!dateKey) {
      return NextResponse.json({ error: "Missing dateKey" }, { status: 400 });
    }

    const body = await request.json();
    const { totalDeposit } = body;

    if (typeof totalDeposit !== "number" || isNaN(totalDeposit) || totalDeposit < 0) {
      return NextResponse.json({ error: "Invalid totalDeposit value" }, { status: 400 });
    }

    // ตรวจสอบว่า record มีอยู่จริง
    const existing = await prisma.dailyDepositSummary.findUnique({
      where: { dateKey },
    });

    if (!existing) {
      return NextResponse.json(
        { error: `ไม่พบข้อมูลประจำวันที่ ${dateKey}` },
        { status: 404 }
      );
    }

    // อัปเดต totalDeposit
    const updated = await prisma.dailyDepositSummary.update({
      where: { dateKey },
      data: { totalDeposit },
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    console.error("Error updating totalDeposit:", error);
    return NextResponse.json(
      { error: "ไม่สามารถอัปเดตยอดฝากรวมได้" },
      { status: 500 }
    );
  }
}
