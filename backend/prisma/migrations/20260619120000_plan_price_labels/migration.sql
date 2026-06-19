-- Preços de referência de mercado (BR): freelancer Pro ~R$39 (99Freelas/Workeet); empresa Growth ~R$79 (SMB job boards)

UPDATE "plans"
SET "priceLabel" = 'R$ 39/mês', "updatedAt" = CURRENT_TIMESTAMP
WHERE "audience" = 'USER' AND "code" = 'PRO';

UPDATE "plans"
SET "priceLabel" = 'R$ 79/mês', "updatedAt" = CURRENT_TIMESTAMP
WHERE "audience" = 'COMPANY' AND "code" = 'PRO';
