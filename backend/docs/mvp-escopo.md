# Escopo do MVP — FreelasAPI

## Visão geral

O MVP da plataforma FreelasAPI deve validar o fluxo principal entre empresas e freelancers dentro da própria plataforma: empresas publicam vagas e analisam candidatos; freelancers configuram perfil, buscam vagas e se candidatam.

Fluxo principal do MVP:
1. cadastro;
2. autenticação;
3. configuração de perfil;
4. publicação de vaga;
5. listagem de vagas;
6. candidatura;
7. análise de candidatos;
8. comunicação inicial;
9. notificações internas;
10. avaliações;
11. matching simples.

Critério de leitura deste documento:
- **Implementado no código**: já existe rota e comportamento funcional no backend atual;
- **Parcial/no backlog do MVP**: existe base de rota/schema/modelo, mas falta implementação completa;
- **Futuro/Fora do MVP**: não deve bloquear o MVP atual.

Pagamentos:
- qualquer fluxo de pagamento (gateway, assinatura, webhook, cobrança real) está **fora do escopo do MVP**;
- se necessário, tratar como mock, flag futura ou documentação de evolução.

Planos (fase soft — implementado):
- catálogos independentes para **freelancer** (`USER`: Free / Pro) e **empresa** (`COMPANY`: Starter / Growth);
- limites no backend (`maxActiveJobs`, `maxApplicationsPerMonth`, caps de matching) com erro `PLAN_LIMIT_REACHED`;
- plano default generoso no core: cadastro, perfil completo, 1ª vaga, candidatura básica e avaliações **sempre gratuitos**;
- `GET /plans`, `GET /plans/me`, `POST /plans/mock-upgrade` (simulação TCC, sem cobrança);
- upgrade real (Stripe/Mercado Pago) permanece evolução futura.

---

## 1. Autenticação e segurança

### Obrigatório no MVP
- cadastro de freelancer;
- cadastro de empresa;
- login;
- logout;
- autenticação com JWT;
- refresh token (quando disponível);
- hash de senha com bcrypt;
- validação de payload com Zod;
- middleware de autenticação;
- middleware de autorização por tipo de usuário;
- bloqueio de acesso para usuário inativo/bloqueado;
- recuperação de senha como item desejável quando ainda não implementado.

### Regras de negócio obrigatórias
- e-mail único;
- CPF único por freelancer;
- CNPJ único por empresa;
- senha nunca salva sem hash;
- JWT não deve expor dados sensíveis.

### Estado atual do código
- **Implementado no código**
  - `POST /auth/register/user`
  - `POST /auth/register/company`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - autenticação JWT (`authenticate`) e autorização por tipo (`requireType`)
  - rate limit global e por endpoints de auth
  - middleware global de erro
- **Parcial/no backlog do MVP**
  - recuperação de senha
  - padronização explícita de resposta de erro para 400 (hoje validação usa 422)

---

## 2. Perfis

### Obrigatório no MVP
- configuração de perfil do freelancer;
- configuração de perfil da empresa;
- edição de perfil;
- visualização pública de perfil;
- cadastro de habilidades;
- cadastro de área de atuação;
- descrição profissional;
- avatar/logo (inicialmente URL).

### Regras
- usuário só edita o próprio perfil;
- freelancer não edita dados de empresa;
- empresa não edita dados de freelancer.

### Estado atual do código
- **Implementado no código**
  - `GET /profile/me`
  - `PUT /profile/me`
  - `PUT /profile/me/password`
  - `PATCH /profile/user/me`
  - `PUT /profile/user/me/resume`
  - `DELETE /profile/user/me/resume`
  - `PATCH /profile/user/me/tech-stack`
  - `PATCH /profile/company/me`
  - experiências e portfólio em `/profile/me/experiences` e `/profile/me/portfolio`
- **Parcial/no backlog do MVP**
  - endpoints públicos para visualização de perfil por terceiros

---

## 3. Vagas

### Obrigatório no MVP
- publicação de vaga por empresa;
- edição de vaga;
- arquivamento/encerramento/cancelamento;
- listagem de vagas;
- detalhe de vaga;
- filtros básicos;
- status da vaga.

### Status recomendados
- aberta;
- pausada;
- encerrada;
- cancelada.

### Filtros básicos recomendados
- título;
- categoria;
- modalidade;
- faixa de orçamento;
- status;
- data de publicação;
- habilidades exigidas.

### Regras
- apenas empresa cria vaga;
- freelancer não cria vaga;
- apenas empresa dona da vaga edita/exclui;
- vaga encerrada não aceita novas candidaturas.

### Estado atual do código
- **Implementado no código**
  - `GET /vagas`
  - `POST /vagas` (empresa)
- **Parcial/no backlog do MVP**
  - `GET /vagas/:id`
  - `PUT /vagas/:id`
  - `DELETE /vagas/:id`
  - política completa de status de vaga (aberta/pausada/encerrada/cancelada)
  - filtros avançados

---

## 4. Candidaturas

### Obrigatório no MVP
- freelancer se candidatar;
- freelancer ver suas candidaturas;
- empresa ver candidatos de uma vaga;
- empresa alterar status da candidatura;
- freelancer cancelar candidatura.

### Status recomendados
- enviada;
- em análise;
- aceita;
- recusada;
- cancelada.

### Regras
- impedir candidatura duplicada na mesma vaga;
- empresa não pode se candidatar;
- candidatura bloqueada para vaga encerrada/pausada/cancelada;
- empresa só altera candidatura das próprias vagas.

### Estado atual do código
- **Parcial/no backlog do MVP**
  - rota existe: `POST /vagas/:id/apply`
  - rotas existem: `GET /vagas/:id/applications` e `GET /vagas/:id/candidates`
  - falta implementação funcional dessas operações em controller/service

---

## 5. Matching simples

### Obrigatório ou desejável no MVP
- sugestão de vagas para freelancer;
- sugestão de candidatos para empresa;
- compatibilidade por habilidades;
- compatibilidade por área/categoria;
- score simples de compatibilidade.

Exemplo:
- vaga exige `Node.js`, `PostgreSQL`, `TypeScript`;
- freelancer possui `Node.js` e `TypeScript`;
- score de compatibilidade: `66%`.

### Diretriz
- algoritmo deve ser simples, transparente e explicável;
- não implementar motor complexo nesta fase.

### Estado atual do código
- **Parcial/no backlog do MVP**
  - existe utilitário de recomendação, mas sem módulo/endpoints consolidados de matching

---

## 6. Comunicação inicial

### Obrigatório no MVP
- criação de conversa entre empresa e freelancer;
- envio de mensagem;
- listagem de conversas;
- listagem de mensagens;
- marcação lida/não lida.

### Regras
- conversa só com vínculo de vaga/candidatura;
- no MVP, sem WebSocket obrigatório;
- API REST assíncrona é suficiente.

### Estado atual do código
- **Parcial/no backlog do MVP**
  - rota declarada: `GET /vagas/:id/messages`
  - modelo de mensagens existe no banco
  - falta implementação de fluxo completo (criar/listar conversa e mensagens)

---

## 7. Notificações internas

### Obrigatório no MVP
- notificar nova candidatura;
- notificar alteração de status;
- notificar nova mensagem;
- listar notificações;
- marcar como lida;
- contador de não lidas.

### Regras
- notificação interna persistida no banco;
- e-mail/push/WhatsApp fora do MVP, salvo decisão explícita.

### Estado atual do código
- **Parcial/no backlog do MVP**
  - estrutura de dados existe (modelo);
  - não há módulo completo de rotas/controller/service de notificações no backend atual.

---

## 8. Avaliações

### Obrigatório ou desejável no MVP
- empresa avaliar freelancer;
- freelancer avaliar empresa;
- nota de 1 a 5;
- comentário opcional;
- listagem no perfil.

### Regras
- só após vínculo válido (candidatura aceita/projeto concluído);
- bloquear avaliação sem vínculo;
- evitar avaliações duplicadas para o mesmo vínculo quando definido.

### Estado atual do código
- **Parcial/no backlog do MVP**
  - documentação prevê o módulo;
  - backend atual não possui implementação completa exposta por rotas.

---

## 9. Documentação da API para o front-end

Para cada endpoint, documentar:
- método HTTP;
- rota;
- autenticação;
- tipo de usuário;
- body;
- query params;
- resposta de sucesso;
- erros comuns;
- exemplo de request;
- exemplo de response.

### Padrão de status HTTP recomendado
- `200` sucesso;
- `201` criação;
- `400` validação de negócio/formato;
- `401` não autenticado;
- `403` sem permissão;
- `404` não encontrado;
- `409` conflito;
- `500` erro interno.

Observação de aderência:
- no backend atual, erros de validação Zod retornam `422`. Para alinhamento com front-end, decidir se mantém `422` ou adapta para `400` em camada de contrato.

### Contrato por endpoint (encontrado e esperado)

Notas:
- `Auth`: público | JWT;
- `Perfil`: público | freelancer | empresa | empresa dona | dono da notificação;
- `Status`: implementado | parcial (rota sem regra completa) | esperado (backlog MVP).

#### Autenticação
- `POST /auth/register/user` | Auth: público | Perfil: público | Body: dados freelancer (`name`, `email`, `password`, `cpf`) | Query: - | Sucesso: `201` + usuário criado | Erros: `400/409/422` | Status: implementado.
- `POST /auth/register/company` | Auth: público | Perfil: público | Body: dados empresa (`name`, `email`, `password`, `cnpj`) | Query: - | Sucesso: `201` + empresa criada | Erros: `400/409/422` | Status: implementado.
- `POST /auth/login` | Auth: público | Perfil: público | Body: `email`, `password`, `type` | Query: - | Sucesso: `200` + `accessToken`/`refreshToken` | Erros: `401/403/422` | Status: implementado.
- `POST /auth/refresh` | Auth: público (token no body) | Perfil: público | Body: `refreshToken` | Query: - | Sucesso: `200` + novo par de tokens | Erros: `401/422` | Status: implementado.
- `POST /auth/logout` | Auth: JWT | Perfil: autenticado | Body: `refreshToken` | Query: - | Sucesso: `200` | Erros: `401/422` | Status: implementado.

#### Perfil
- `GET /profile/me` | Auth: JWT | Perfil: freelancer/empresa | Body: - | Query: - | Sucesso: `200` + perfil logado | Erros: `401/404` | Status: implementado.
- `PUT /profile/me` | Auth: JWT | Perfil: freelancer/empresa | Body: dados básicos do próprio perfil | Query: - | Sucesso: `200` | Erros: `400/401/422` | Status: implementado.
- `PUT /profile/me/password` | Auth: JWT | Perfil: freelancer/empresa | Body: senha atual/nova senha | Query: - | Sucesso: `200` | Erros: `400/401/422` | Status: implementado.
- `PATCH /profile/user/me` | Auth: JWT | Perfil: freelancer | Body: campos específicos de freelancer | Query: - | Sucesso: `200` | Erros: `401/403/422` | Status: implementado.
- `PATCH /profile/company/me` | Auth: JWT | Perfil: empresa | Body: campos específicos da empresa | Query: - | Sucesso: `200` | Erros: `401/403/422` | Status: implementado.
- `PUT /profile/user/me/resume` | Auth: JWT | Perfil: freelancer | Body: URL/metadata de currículo | Query: - | Sucesso: `200` | Erros: `401/403/422` | Status: implementado.
- `DELETE /profile/user/me/resume` | Auth: JWT | Perfil: freelancer | Body: - | Query: - | Sucesso: `200` | Erros: `401/403` | Status: implementado.
- `PATCH /profile/user/me/tech-stack` | Auth: JWT | Perfil: freelancer | Body: lista de tecnologias/skills | Query: - | Sucesso: `200` | Erros: `401/403/422` | Status: implementado.
- `GET /profile/me/experiences` | Auth: JWT | Perfil: freelancer | Body: - | Query: paginação opcional | Sucesso: `200` + lista | Erros: `401/403` | Status: implementado.
- `POST /profile/me/experiences` | Auth: JWT | Perfil: freelancer | Body: experiência | Query: - | Sucesso: `201` | Erros: `401/403/422` | Status: implementado.
- `PUT /profile/me/experiences/:id` | Auth: JWT | Perfil: freelancer | Body: atualização experiência | Query: - | Sucesso: `200` | Erros: `401/403/404/422` | Status: implementado.
- `DELETE /profile/me/experiences/:id` | Auth: JWT | Perfil: freelancer | Body: - | Query: - | Sucesso: `200` | Erros: `401/403/404` | Status: implementado.
- `GET /profile/me/portfolio` | Auth: JWT | Perfil: freelancer | Body: - | Query: paginação opcional | Sucesso: `200` + lista | Erros: `401/403` | Status: implementado.
- `POST /profile/me/portfolio` | Auth: JWT | Perfil: freelancer | Body: item portfólio | Query: - | Sucesso: `201` | Erros: `401/403/422` | Status: implementado.
- `PUT /profile/me/portfolio/:id` | Auth: JWT | Perfil: freelancer | Body: atualização item | Query: - | Sucesso: `200` | Erros: `401/403/404/422` | Status: implementado.
- `DELETE /profile/me/portfolio/:id` | Auth: JWT | Perfil: freelancer | Body: - | Query: - | Sucesso: `200` | Erros: `401/403/404` | Status: implementado.
- `GET /profile/users/:id` | Auth: público | Perfil: público | Body: - | Query: - | Sucesso: `200` + perfil público freelancer | Erros: `404` | Status: esperado.
- `GET /profile/companies/:id` | Auth: público | Perfil: público | Body: - | Query: - | Sucesso: `200` + perfil público empresa | Erros: `404` | Status: esperado.

#### Vagas
- `GET /vagas` | Auth: público | Perfil: público | Body: - | Query: `search`, `active`, filtros de categoria/modalidade/orçamento/status/data/habilidades | Sucesso: `200` + lista | Erros: `400/422` | Status: implementado (filtros parciais).
- `POST /vagas` | Auth: JWT | Perfil: empresa | Body: título, descrição, categoria, orçamento, modalidade, prazo, skills | Query: - | Sucesso: `201` | Erros: `401/403/422` | Status: implementado.
- `GET /vagas/:id` | Auth: público | Perfil: público | Body: - | Query: - | Sucesso: `200` + detalhe vaga | Erros: `404` | Status: parcial.
- `PUT /vagas/:id` | Auth: JWT | Perfil: empresa dona | Body: campos editáveis da vaga | Query: - | Sucesso: `200` | Erros: `401/403/404/422` | Status: parcial.
- `DELETE /vagas/:id` | Auth: JWT | Perfil: empresa dona | Body: - | Query: - | Sucesso: `200`/`204` | Erros: `401/403/404` | Status: parcial.
- `PATCH /vagas/:id/status` | Auth: JWT | Perfil: empresa dona | Body: `status` (`aberta|pausada|encerrada|cancelada`) | Query: - | Sucesso: `200` | Erros: `401/403/404/422` | Status: esperado.

#### Candidaturas
- `POST /vagas/:id/apply` | Auth: JWT | Perfil: freelancer | Body: dados da candidatura/apresentação | Query: - | Sucesso: `201` | Erros: `401/403/404/409/422` | Status: parcial.
- `GET /applications/me` | Auth: JWT | Perfil: freelancer | Body: - | Query: paginação/status | Sucesso: `200` + candidaturas do freelancer | Erros: `401/403` | Status: esperado.
- `PATCH /applications/:id/cancel` | Auth: JWT | Perfil: freelancer dono | Body: motivo opcional | Query: - | Sucesso: `200` | Erros: `401/403/404/409` | Status: esperado.
- `GET /vagas/:id/applications` | Auth: JWT | Perfil: empresa dona | Body: - | Query: paginação/status | Sucesso: `200` + candidaturas da vaga | Erros: `401/403/404` | Status: parcial.
- `GET /vagas/:id/candidates` | Auth: JWT | Perfil: empresa dona | Body: - | Query: `scoreMin`, paginação | Sucesso: `200` + candidatos | Erros: `401/403/404` | Status: parcial.
- `PATCH /applications/:id/status` | Auth: JWT | Perfil: empresa dona | Body: `status` (`em_analise|aceita|recusada`) | Query: - | Sucesso: `200` | Erros: `401/403/404/422` | Status: esperado.

#### Matching
- `GET /matching/jobs/suggestions` | Auth: JWT | Perfil: freelancer | Body: - | Query: paginação/score mínimo | Sucesso: `200` + vagas sugeridas com score | Erros: `401/403` | Status: esperado.
- `GET /matching/jobs/:id/candidates` | Auth: JWT | Perfil: empresa dona | Body: - | Query: paginação/score mínimo | Sucesso: `200` + candidatos sugeridos | Erros: `401/403/404` | Status: esperado.

#### Comunicação inicial
- `GET /vagas/:id/messages` | Auth: JWT | Perfil: empresa dona | Body: - | Query: paginação | Sucesso: `200` + mensagens | Erros: `401/403/404` | Status: parcial.
- `POST /conversations` | Auth: JWT | Perfil: freelancer/empresa com vínculo | Body: `vagaId`, `participantId` | Query: - | Sucesso: `201` + conversa criada | Erros: `401/403/404/409` | Status: esperado.
- `GET /conversations` | Auth: JWT | Perfil: freelancer/empresa | Body: - | Query: paginação/filtro lidas | Sucesso: `200` + conversas | Erros: `401` | Status: esperado.
- `GET /conversations/:id/messages` | Auth: JWT | Perfil: participante da conversa | Body: - | Query: paginação | Sucesso: `200` + mensagens | Erros: `401/403/404` | Status: esperado.
- `POST /conversations/:id/messages` | Auth: JWT | Perfil: participante da conversa | Body: `content` | Query: - | Sucesso: `201` | Erros: `401/403/404/422` | Status: esperado.
- `PATCH /conversations/:id/messages/read` | Auth: JWT | Perfil: participante da conversa | Body: ids/flag de leitura | Query: - | Sucesso: `200` | Erros: `401/403/404` | Status: esperado.

#### Notificações
- `GET /notifications` | Auth: JWT | Perfil: autenticado | Body: - | Query: paginação/tipo/lida | Sucesso: `200` + notificações | Erros: `401` | Status: esperado.
- `PATCH /notifications/:id/read` | Auth: JWT | Perfil: dono da notificação | Body: `read=true` | Query: - | Sucesso: `200` | Erros: `401/403/404` | Status: esperado.
- `GET /notifications/unread-count` | Auth: JWT | Perfil: autenticado | Body: - | Query: - | Sucesso: `200` + contador | Erros: `401` | Status: esperado.

#### Avaliações
- `POST /reviews` | Auth: JWT | Perfil: freelancer/empresa com vínculo válido | Body: `targetId`, `applicationId`, `rating`, `comment` | Query: - | Sucesso: `201` | Erros: `401/403/404/409/422` | Status: esperado.
- `GET /users/:id/reviews` | Auth: público | Perfil: público | Body: - | Query: paginação | Sucesso: `200` + avaliações | Erros: `404` | Status: esperado.

### Exemplo de request/response (login)

Request:
```http
POST /auth/login
Content-Type: application/json

{
  "email": "empresa@acme.com",
  "password": "SenhaForte123!",
  "type": "company"
}
```

Response `200`:
```json
{
  "status": "success",
  "message": "Login realizado com sucesso.",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<refresh>"
  }
}
```

---

## 11. Tratamento de erros

### Obrigatório no MVP
- middleware global de erro;
- resposta padronizada;
- tratamento de validação;
- tratamento de token inválido;
- tratamento de permissão;
- tratamento de recurso não encontrado;
- tratamento de conflitos (e-mail/CPF/CNPJ duplicados);
- não expor erro interno de banco ao front-end.

### Padrão de resposta de erro (contrato recomendado)
```json
{
  "success": false,
  "message": "E-mail já cadastrado",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

### Observação de aderência ao backend atual
- implementação atual usa formato:
```json
{
  "status": "error",
  "message": "Mensagem de erro",
  "code": "OPCIONAL"
}
```
- erro de validação retorna `errors` por campo.

Recomendação:
- manter um padrão único para front-end (ou `status`, ou `success`), documentando explicitamente o contrato oficial adotado.

---

## Matriz rápida de aderência (Notion x Código)

- **Autenticação e segurança**: aderente e implementado.
- **Perfis**: aderente em boa parte, faltando perfil público.
- **Vagas**: parcialmente aderente (create/list OK; restante pendente).
- **Candidaturas**: parcial (rotas declaradas, implementação pendente).
- **Matching**: parcial (base utilitária sem módulo completo).
- **Comunicação**: parcial (base/modelo/rota, sem fluxo completo).
- **Notificações**: parcial (modelo sem API completa).
- **Avaliações**: pendente/parcial conforme planejamento.
- **Pagamentos**: fora do MVP (manter somente como evolução/mock).
- **Planos soft**: implementado — limites + UI de upgrade simulado; pagamento real pendente.
