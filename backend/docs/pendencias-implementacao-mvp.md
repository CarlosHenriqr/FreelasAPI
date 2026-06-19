# Pendências de Implementação — MVP FreelasAPI

Documento de acompanhamento do que **ainda falta implementar** no backend para fechar o MVP.

## Critério de prioridade

- **P0**: bloqueia fluxo principal do MVP.
- **P1**: importante para operação e integração frontend.
- **P2**: evolução relevante, mas não bloqueante imediato.

---

## P0 — Itens críticos

## 1) Banco/Migrações Prisma

- [x] Criar e aplicar migração para mudanças recentes de skills/stacks:
  - `SkillLevel` em `UserTechnology`;
  - `JobTechnologyType` em `JobTechnology`;
  - índices novos.
  - migration: `20260507144842_migrationhomo`
- [ ] Validar consistência entre `prisma/schema.prisma` e histórico de migrations (rodar `npm run prisma:migrate` no ambiente).

## 2) Candidaturas — ciclo completo

- [x] Implementar `PATCH /applications/:id/status` (empresa altera status).
- [x] Implementar `GET /applications/me` (freelancer vê suas candidaturas).
- [x] Implementar `PATCH /applications/:id/cancel` (freelancer cancela candidatura).
- [x] Regras de transição de status:
  - empresa: `PENDING -> REVIEWED | ACCEPTED | REJECTED`; `REVIEWED -> ACCEPTED | REJECTED`
  - freelancer: `PENDING | REVIEWED -> CANCELLED`
  - migration enum: `20260520120000_application_cancelled_status`

## 3) Vagas — status explícito

- [x] Implementar endpoint dedicado para status da vaga (`PATCH /vagas/:id/status`) com:
  - aberta;
  - pausada;
  - encerrada;
  - cancelada.
- [x] Bloquear candidatura por status de vaga (não só `isActive/expiresAt/isFilled`).

---

## P1 — Itens importantes

## 4) Comunicação inicial

- [ ] Implementar listagem real de mensagens por vaga (`GET /vagas/:id/messages`) — hoje retorna `501`.
- [ ] Criar endpoints de conversa/mensagem assíncrona (sem WebSocket obrigatório no MVP):
  - criação de conversa com vínculo de vaga/candidatura;
  - envio de mensagem;
  - listagem de conversas;
  - marcação lida/não lida.

## 5) Notificações internas

- [x] Implementar módulo completo de notificações:
  - `GET /notifications`;
  - `PATCH /notifications/:id/read`;
  - `GET /notifications/unread-count`.
- [x] Disparar eventos automáticos:
  - nova candidatura;
  - mudança de status de candidatura;
  - nova mensagem.

## 6) Perfis públicos

- [x] Implementar visualização pública de perfil de freelancer.
- [x] Implementar visualização pública de perfil de empresa.

## 7) Tratamento de erros/contrato de API

- [x] Padronizar contrato de erro para frontend (`status` vs `success`).
- [x] Definir padrão final de validação (`400` vs `422`) e aplicar de forma uniforme.

---

## P2 — Evolução de MVP

## 8) Avaliações

- [x] Criar modelagem + endpoints para avaliações entre freelancer/empresa.
- [x] Garantir vínculo obrigatório antes de avaliar.
- [x] Evitar duplicidade de avaliação por vínculo.

## 9) Matching

- [x] Expor endpoints dedicados de matching para empresa e freelancer.
- [ ] Persistir/reaproveitar score quando necessário (se virar requisito).

---

## Fora do escopo MVP (não implementar agora)

- [ ] Pagamento real de anúncios
- [ ] Assinaturas/planos pagos (gateway + webhook)
- [ ] Gateway/webhook financeiro
- [ ] Reembolso/chargeback

---

## Planos — fase soft (implementado)

Objetivo: preparar monetização por **volume e escala** sem paywall no fluxo principal do marketplace.

### Regras de negócio

- **Freelancer Free (default)**: perfil completo, 15 candidaturas/mês, até 10 vagas recomendadas por consulta.
- **Freelancer Pro (simulado)**: 50 candidaturas/mês, destaque leve no matching (+5 pts no score, sem excluir free).
- **Empresa Starter (default)**: 2 vagas ativas (OPEN + PAUSED), top 5 candidatos recomendados por vaga.
- **Empresa Growth/Pro (simulado)**: 10 vagas ativas, top 20 candidatos por vaga.

### O que nunca entra em plano pago

- Cadastro, login, candidatura básica, publicação da 1ª vaga, notificações de status, avaliação pós-`COMPLETED`.

### API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/plans` | não | Catálogo público (`?audience=USER\|COMPANY`) |
| GET | `/plans/me` | sim | Plano efetivo + uso atual |
| POST | `/plans/mock-upgrade` | sim | Troca plano sem pagamento (TCC/dev) |

Erro de limite: `403` + `code: PLAN_LIMIT_REACHED` + `details: { limit, current, planCode, metric, upgradeAudience }`.

### Pendente (evolução)

- [ ] Integração Stripe ou Mercado Pago
- [ ] Webhooks de assinatura, cancelamento e grace period

---

## Checklist de validação final do MVP

- [x] Fluxo freelancer: cadastro -> login -> perfil com skills -> candidatura.
- [x] Fluxo empresa: cadastro -> login -> criar vaga com required/desirable -> analisar candidaturas.
- [x] Segurança: JWT, RBAC por tipo, rate limit, hash de senha.
- [x] Observabilidade mínima: logs de erro e respostas padronizadas.
- [x] Documentação atualizada para frontend (rotas + exemplos + erros).
