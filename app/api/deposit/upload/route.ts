import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DailyDepositSummaryRecord } from "@/types";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    if (!(await getCurrentUser())) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const body = await request.json();
    const { summaries, meta } = body;

    if (!Array.isArray(summaries) || !meta) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const items = summaries as DailyDepositSummaryRecord[];

    // Upsert each daily summary
    await prisma.$transaction(
      items.map((item) =>
        prisma.dailyDepositSummary.upsert({
          where: { dateKey: item.dateKey },
          update: {
            c2cDeposit: item.c2cDeposit,
            totalDeposit: item.totalDeposit,
          },
          create: {
            dateKey: item.dateKey,
            c2cDeposit: item.c2cDeposit,
            totalDeposit: item.totalDeposit,
          },
        })
      )
    );

    // Get final count of daily summary records
    const totalDaysCount = await prisma.dailyDepositSummary.count();

    // Upsert metadata
    await prisma.fileMeta.upsert({
      where: { type: "deposit" },
      update: {
        fileName: meta.fileName,
        rowCount: meta.rowCount || totalDaysCount,
        uploadedAt: new Date(meta.uploadedAt),
      },
      create: {
        type: "deposit",
        fileName: meta.fileName,
        rowCount: meta.rowCount || totalDaysCount,
        uploadedAt: new Date(meta.uploadedAt),
      },
    });

    return NextResponse.json({ success: true, count: totalDaysCount });
  } catch (error: unknown) {
    console.error("Error uploading deposit data:", error);
    const msg = error instanceof Error ? error.message : String(error);
    let userMsg = "ไม่สามารถบันทึกข้อมูลลงฐานข้อมูลได้";
    if (msg.includes("YOUR-PROJECT-REF") || msg.includes("Can't reach database server")) {
      userMsg = "กรุณาใส่ DATABASE_URL จริงจาก Supabase ในไฟล์ .env";
    } else if (msg.includes("does not exist")) {
      userMsg = "ยังไม่ได้สร้างตารางในฐานข้อมูล กรุณารันคำสั่ง npx prisma db push";
    }
    return NextResponse.json(
      { error: userMsg },
      { status: 500 }
    );
  }
}
