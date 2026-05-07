# Pendências de Implementação — MVP FreelasAPI

Documento de acompanhamento do que **ainda falta implementar** no backend para fechar o MVP.

## Critério de prioridade

- **P0**: bloqueia fluxo principal do MVP.
- **P1**: importante para operação e integração frontend.
- **P2**: evolução relevante, mas não bloqueante imediato.

---

## P0 — Itens críticos

## 1) Banco/Migrações Prisma

- [ ] Criar e aplicar migração para mudanças recentes de skills/stacks:
  - `SkillLevel` em `UserTechnology`;
  - `JobTechnologyType` em `JobTechnology`;
  - índices novos.
- [ ] Validar consistência entre `prisma/schema.prisma` e histórico de migrations.

## 2) Candidaturas — ciclo completo

- [ ] Implementar `PATCH /applications/:id/status` (empresa altera status).
- [ ] Implementar `GET /applications/me` (freelancer vê suas candidaturas).
- [ ] Implementar `PATCH /applications/:id/cancel` (freelancer cancela candidatura).
- [ ] Definir regras de transição de status (ex.: `PENDING -> REVIEWED -> ACCEPTED/REJECTED`).

## 3) Vagas — status explícito

- [ ] Implementar endpoint dedicado para status da vaga (`PATCH /vagas/:id/status`) com:
  - aberta;
  - pausada;
  - encerrada;
  - cancelada.
- [ ] Bloquear candidatura por status de vaga (não só `isActive/expiresAt/isFilled`).

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

- [ ] Implementar módulo completo de notificações:
  - `GET /notifications`;
  - `PATCH /notifications/:id/read`;
  - `GET /notifications/unread-count`.
- [ ] Disparar eventos automáticos:
  - nova candidatura;
  - mudança de status de candidatura;
  - nova mensagem.

## 6) Perfis públicos

- [ ] Implementar visualização pública de perfil de freelancer.
- [ ] Implementar visualização pública de perfil de empresa.

## 7) Tratamento de erros/contrato de API

- [ ] Padronizar contrato de erro para frontend (`status` vs `success`).
- [ ] Definir padrão final de validação (`400` vs `422`) e aplicar de forma uniforme.

---

## P2 — Evolução de MVP

## 8) Avaliações

- [ ] Criar modelagem + endpoints para avaliações entre freelancer/empresa.
- [ ] Garantir vínculo obrigatório antes de avaliar.
- [ ] Evitar duplicidade de avaliação por vínculo.

## 9) Matching

- [ ] Expor endpoints dedicados de matching para empresa e freelancer.
- [ ] Persistir/reaproveitar score quando necessário (se virar requisito).

## 10) Administração básica

- [ ] Definir papel admin no modelo de autenticação/autorização.
- [ ] Endpoints mínimos de moderação:
  - usuários (listar, bloquear/desbloquear);
  - vagas (listar, moderar/remover).

---

## Fora do escopo MVP (não implementar agora)

- [ ] Pagamento real de anúncios
- [ ] Assinaturas/planos pagos
- [ ] Gateway/webhook financeiro
- [ ] Reembolso/chargeback

---

## Checklist de validação final do MVP

- [ ] Fluxo freelancer: cadastro -> login -> perfil com skills -> candidatura.
- [ ] Fluxo empresa: cadastro -> login -> criar vaga com required/desirable -> analisar candidaturas.
- [ ] Segurança: JWT, RBAC por tipo, rate limit, hash de senha.
- [ ] Observabilidade mínima: logs de erro e respostas padronizadas.
- [ ] Documentação atualizada para frontend (rotas + exemplos + erros).
