-- CreateEnum
CREATE TYPE "PlanAudience" AS ENUM ('USER', 'COMPANY');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "audience" "PlanAudience" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceLabel" TEXT NOT NULL,
    "limits" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "company_subscriptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "plans_audience_code_key" ON "plans"("audience", "code");
CREATE UNIQUE INDEX "user_subscriptions_userId_key" ON "user_subscriptions"("userId");
CREATE INDEX "user_subscriptions_planId_idx" ON "user_subscriptions"("planId");
CREATE UNIQUE INDEX "company_subscriptions_companyId_key" ON "company_subscriptions"("companyId");
CREATE INDEX "company_subscriptions_planId_idx" ON "company_subscriptions"("planId");

ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed plan catalog
INSERT INTO "plans" ("id", "audience", "code", "name", "description", "priceLabel", "limits", "sortOrder", "isActive", "updatedAt") VALUES
  (gen_random_uuid()::text, 'USER', 'FREE', 'Free', 'Perfil completo, candidaturas e recomendações essenciais.', 'Grátis', '{"maxApplicationsPerMonth":15,"matchingJobLimit":10,"matchingCandidateLimit":0,"profileBoostWeight":0}'::jsonb, 1, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'USER', 'PRO', 'Pro', 'Mais candidaturas por mês e leve destaque no matching.', 'Em breve', '{"maxApplicationsPerMonth":50,"matchingJobLimit":30,"matchingCandidateLimit":0,"profileBoostWeight":5}'::jsonb, 2, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'COMPANY', 'STARTER', 'Starter', 'Publique vagas e gerencie candidatos no fluxo principal.', 'Grátis', '{"maxActiveJobs":2,"maxApplicationsPerMonth":null,"matchingCandidateLimit":5,"matchingJobLimit":0,"profileBoostWeight":0}'::jsonb, 1, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'COMPANY', 'PRO', 'Growth', 'Mais vagas ativas e matching ampliado de candidatos.', 'Em breve', '{"maxActiveJobs":10,"maxApplicationsPerMonth":null,"matchingCandidateLimit":20,"matchingJobLimit":0,"profileBoostWeight":0}'::jsonb, 2, true, CURRENT_TIMESTAMP);

-- Default subscriptions for existing accounts
INSERT INTO "user_subscriptions" ("id", "userId", "planId", "status", "startsAt", "updatedAt")
SELECT gen_random_uuid()::text, u."id", p."id", 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users" u
CROSS JOIN "plans" p
WHERE p."audience" = 'USER' AND p."code" = 'FREE'
  AND NOT EXISTS (SELECT 1 FROM "user_subscriptions" us WHERE us."userId" = u."id");

INSERT INTO "company_subscriptions" ("id", "companyId", "planId", "status", "startsAt", "updatedAt")
SELECT gen_random_uuid()::text, c."id", p."id", 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "companies" c
CROSS JOIN "plans" p
WHERE p."audience" = 'COMPANY' AND p."code" = 'STARTER'
  AND NOT EXISTS (SELECT 1 FROM "company_subscriptions" cs WHERE cs."companyId" = c."id");
