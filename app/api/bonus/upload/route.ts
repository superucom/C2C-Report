import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DailyBonusSummaryRecord } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { summaries, meta } = body;

    if (!Array.isArray(summaries) || !meta) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const items = summaries as DailyBonusSummaryRecord[];

    // Upsert each daily summary
    await prisma.$transaction(
      items.map((item) =>
        prisma.dailyBonusSummary.upsert({
          where: { dateKey: item.dateKey },
          update: {
            bonusAmount: item.bonusAmount,
          },
          create: {
            dateKey: item.dateKey,
            bonusAmount: item.bonusAmount,
          },
        })
      )
    );

    // Get final count of daily summary records
    const totalDaysCount = await prisma.dailyBonusSummary.count();

    // Upsert metadata
    await prisma.fileMeta.upsert({
      where: { type: "bonus" },
      update: {
        fileName: meta.fileName,
        rowCount: meta.rowCount || totalDaysCount,
        uploadedAt: new Date(meta.uploadedAt),
      },
      create: {
        type: "bonus",
        fileName: meta.fileName,
        rowCount: meta.rowCount || totalDaysCount,
        uploadedAt: new Date(meta.uploadedAt),
      },
    });

    return NextResponse.json({ success: true, count: totalDaysCount });
  } catch (error: unknown) {
    console.error("Error uploading bonus data:", error);
    const msg = error instanceof Error ? error.message : String(error);
    let userMsg = "ไม่สามารถบันทึกข้อมูลโบนัสลงฐานข้อมูลได้";
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
