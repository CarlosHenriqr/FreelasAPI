-- Remove módulo administrativo (painel admin, auditoria e flag isAdmin)

DROP TABLE IF EXISTS "admin_audit_logs";

ALTER TABLE "users" DROP COLUMN IF EXISTS "isAdmin";
