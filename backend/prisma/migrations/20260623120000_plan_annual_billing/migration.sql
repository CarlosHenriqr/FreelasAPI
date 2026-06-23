-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "plans" ADD COLUMN "annualPriceLabel" TEXT,
ADD COLUMN "annualMonthlyEquivalentLabel" TEXT,
ADD COLUMN "annualSavingsLabel" TEXT;

-- AlterTable
ALTER TABLE "user_subscriptions" ADD COLUMN "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "company_subscriptions" ADD COLUMN "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY';

-- Seed annual pricing (2 months free ≈ 17% off)
UPDATE "plans"
SET
  "annualPriceLabel" = 'R$ 390/ano',
  "annualMonthlyEquivalentLabel" = 'R$ 32,50',
  "annualSavingsLabel" = 'Economize 17%',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "audience" = 'USER' AND "code" = 'PRO';

UPDATE "plans"
SET
  "annualPriceLabel" = 'R$ 790/ano',
  "annualMonthlyEquivalentLabel" = 'R$ 65,83',
  "annualSavingsLabel" = 'Economize 17%',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "audience" = 'COMPANY' AND "code" = 'PRO';
