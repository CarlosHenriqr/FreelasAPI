-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'PAUSED', 'CLOSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "status" "JobStatus" NOT NULL DEFAULT 'OPEN';

-- Backfill
UPDATE "jobs"
SET "status" = CASE
  WHEN "isActive" = false THEN 'CANCELLED'::"JobStatus"
  WHEN "isFilled" = true OR "expiresAt" <= NOW() THEN 'CLOSED'::"JobStatus"
  ELSE 'OPEN'::"JobStatus"
END;

-- CreateIndex
CREATE INDEX "jobs_status_createdAt_idx" ON "jobs"("status", "createdAt");

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "companyId" TEXT;
ALTER TABLE "notifications" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_companyId_read_idx" ON "notifications"("companyId", "read");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddConstraint
ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_single_recipient_check"
CHECK (num_nonnulls("userId", "companyId") = 1);
