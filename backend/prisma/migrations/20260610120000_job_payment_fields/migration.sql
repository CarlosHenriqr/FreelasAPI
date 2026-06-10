-- CreateEnum
CREATE TYPE "JobPaymentType" AS ENUM ('FIXED_RANGE', 'HOURLY');

-- AlterTable
ALTER TABLE "jobs"
ADD COLUMN "paymentType" "JobPaymentType",
ADD COLUMN "budgetMin" DECIMAL(12,2),
ADD COLUMN "budgetMax" DECIMAL(12,2),
ADD COLUMN "hourlyRate" DECIMAL(12,2),
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'BRL';
