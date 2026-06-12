-- CreateTable
CREATE TABLE "company_password_reset_codes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "company_password_reset_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_password_reset_codes_companyId_createdAt_idx" ON "company_password_reset_codes"("companyId", "createdAt");
CREATE INDEX "company_password_reset_codes_expiresAt_idx" ON "company_password_reset_codes"("expiresAt");
CREATE INDEX "company_password_reset_codes_usedAt_idx" ON "company_password_reset_codes"("usedAt");

-- AddForeignKey
ALTER TABLE "company_password_reset_codes"
ADD CONSTRAINT "company_password_reset_codes_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
