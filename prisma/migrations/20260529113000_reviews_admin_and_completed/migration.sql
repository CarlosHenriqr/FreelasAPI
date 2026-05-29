-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'COMPLETED';

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'COMPANY');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reviewerType" "ActorType" NOT NULL,
    "reviewerUserId" TEXT,
    "reviewerCompanyId" TEXT,
    "reviewedType" "ActorType" NOT NULL,
    "reviewedUserId" TEXT,
    "reviewedCompanyId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_reviewerType_reviewerUserId_reviewerCompanyId_reviewedT_key"
ON "reviews"("reviewerType", "reviewerUserId", "reviewerCompanyId", "reviewedType", "reviewedUserId", "reviewedCompanyId", "jobId");

-- CreateIndex
CREATE INDEX "reviews_reviewedType_reviewedUserId_reviewedCompanyId_createdAt_idx"
ON "reviews"("reviewedType", "reviewedUserId", "reviewedCompanyId", "createdAt");

-- CreateIndex
CREATE INDEX "reviews_applicationId_idx" ON "reviews"("applicationId");
CREATE INDEX "reviews_jobId_idx" ON "reviews"("jobId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_adminUserId_createdAt_idx" ON "admin_audit_logs"("adminUserId", "createdAt");
CREATE INDEX "admin_audit_logs_targetType_targetId_createdAt_idx" ON "admin_audit_logs"("targetType", "targetId", "createdAt");

-- AddConstraint
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_rating_range_check" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_reviewer_single_check" CHECK (num_nonnulls("reviewerUserId", "reviewerCompanyId") = 1);

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_reviewed_single_check" CHECK (num_nonnulls("reviewedUserId", "reviewedCompanyId") = 1);

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_reviewer_type_check" CHECK (
  ("reviewerType" = 'USER' AND "reviewerUserId" IS NOT NULL AND "reviewerCompanyId" IS NULL)
  OR
  ("reviewerType" = 'COMPANY' AND "reviewerCompanyId" IS NOT NULL AND "reviewerUserId" IS NULL)
);

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_reviewed_type_check" CHECK (
  ("reviewedType" = 'USER' AND "reviewedUserId" IS NOT NULL AND "reviewedCompanyId" IS NULL)
  OR
  ("reviewedType" = 'COMPANY' AND "reviewedCompanyId" IS NOT NULL AND "reviewedUserId" IS NULL)
);

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerCompanyId_fkey" FOREIGN KEY ("reviewerCompanyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewedUserId_fkey" FOREIGN KEY ("reviewedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewedCompanyId_fkey" FOREIGN KEY ("reviewedCompanyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
