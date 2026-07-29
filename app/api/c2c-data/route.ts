import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [depositSummaries, bonusSummaries, metas] = await Promise.all([
      prisma.dailyDepositSummary.findMany({
        orderBy: { dateKey: "asc" },
      }),
      prisma.dailyBonusSummary.findMany({
        orderBy: { dateKey: "asc" },
      }),
      prisma.fileMeta.findMany(),
    ]);

    const depositMeta = metas.find((m) => m.type === "deposit") || null;
    const bonusMeta = metas.find((m) => m.type === "bonus") || null;

    return NextResponse.json({
      depositSummaries,
      bonusSummaries,
      depositMeta,
      bonusMeta,
    });
  } catch (error) {
    console.error("Error fetching C2C data:", error);
    return NextResponse.json({
      depositSummaries: [],
      bonusSummaries: [],
      depositMeta: null,
      bonusMeta: null,
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateKey = searchParams.get("dateKey");

    if (!dateKey) {
      return NextResponse.json({ error: "Missing dateKey query parameter" }, { status: 400 });
    }

    // Delete daily summary records for dateKey from both summary tables
    await prisma.$transaction([
      prisma.dailyDepositSummary.deleteMany({
        where: { dateKey },
      }),
      prisma.dailyBonusSummary.deleteMany({
        where: { dateKey },
      }),
    ]);

    // Recalculate summary record counts for metadata
    const [depositCount, bonusCount] = await Promise.all([
      prisma.dailyDepositSummary.count(),
      prisma.dailyBonusSummary.count(),
    ]);

    // Update file metadata with new row counts
    await Promise.all([
      prisma.fileMeta.updateMany({
        where: { type: "deposit" },
        data: { rowCount: depositCount },
      }),
      prisma.fileMeta.updateMany({
        where: { type: "bonus" },
        data: { rowCount: bonusCount },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting C2C data by day:", error);
    return NextResponse.json(
      { error: "Failed to delete daily data" },
      { status: 500 }
    );
  }
}
