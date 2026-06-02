-- CreateTable
CREATE TABLE "user_password_reset_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_password_reset_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_password_reset_codes_userId_createdAt_idx" ON "user_password_reset_codes"("userId", "createdAt");
CREATE INDEX "user_password_reset_codes_expiresAt_idx" ON "user_password_reset_codes"("expiresAt");
CREATE INDEX "user_password_reset_codes_usedAt_idx" ON "user_password_reset_codes"("usedAt");

-- AddForeignKey
ALTER TABLE "user_password_reset_codes"
ADD CONSTRAINT "user_password_reset_codes_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
