-- Baseline for the existing production schema.
-- This migration is marked as applied on the existing database and is not executed there.

CREATE TABLE "DailyDepositSummary" (
    "dateKey" TEXT NOT NULL,
    "c2cDeposit" DOUBLE PRECISION NOT NULL,
    "totalDeposit" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DailyDepositSummary_pkey" PRIMARY KEY ("dateKey")
);

CREATE TABLE "DailyBonusSummary" (
    "dateKey" TEXT NOT NULL,
    "bonusAmount" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DailyBonusSummary_pkey" PRIMARY KEY ("dateKey")
);

CREATE TABLE "FileMeta" (
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FileMeta_pkey" PRIMARY KEY ("type")
);
