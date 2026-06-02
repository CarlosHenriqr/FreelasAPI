# Endpoints para Teste — FreelasAPI

Guia prático para testar os endpoints atuais da API via `curl`, Postman ou Insomnia.

## Configuração rápida

- Base URL local: `http://localhost:3333`
- Header JSON: `Content-Type: application/json`
- Header auth: `Authorization: Bearer <ACCESS_TOKEN>`

Sugestão de variáveis de ambiente no cliente de API:
- `baseUrl`
- `userAccessToken`
- `userRefreshToken`
- `companyAccessToken`
- `companyRefreshToken`
- `jobId`

---

## 1) Health check

### GET `/health`

```bash
curl -X GET "http://localhost:3333/health"
```

Esperado: `200` com status `ok`.

---

## 2) Autenticação

## 2.1 Cadastrar freelancer

### POST `/auth/register/user`

```bash
curl -X POST "http://localhost:3333/auth/register/user" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Freelancer",
    "email": "ana.freela@example.com",
    "password": "SenhaForte123!",
    "cpf": "52998224725"
  }'
```

Esperado: `201`.

## 2.2 Cadastrar empresa

### POST `/auth/register/company`

```bash
curl -X POST "http://localhost:3333/auth/register/company" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Tech",
    "email": "rh@acme.com",
    "password": "SenhaForte123!",
    "cnpj": "12345678000195"
  }'
```

Esperado: `201`.

## 2.3 Login freelancer

### POST `/auth/login`

```bash
curl -X POST "http://localhost:3333/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana.freela@example.com",
    "password": "SenhaForte123!",
    "type": "user"
  }'
```

Esperado: `200` com `accessToken` e `refreshToken`.

## 2.4 Login empresa

### POST `/auth/login`

```bash
curl -X POST "http://localhost:3333/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rh@acme.com",
    "password": "SenhaForte123!",
    "type": "company"
  }'
```

Esperado: `200` com `accessToken` e `refreshToken`.

## 2.5 Refresh token

### POST `/auth/refresh`

```bash
curl -X POST "http://localhost:3333/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<REFRESH_TOKEN>"
  }'
```

Esperado: `200` com novo par de tokens.

## 2.6 Logout

### POST `/auth/logout`

```bash
curl -X POST "http://localhost:3333/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "refreshToken": "<REFRESH_TOKEN>"
  }'
```

Esperado: `200`.

## 2.7 Solicitar código de recuperação

### POST `/auth/password/forgot`

```bash
curl -X POST "http://localhost:3333/auth/password/forgot" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana.freela@example.com"
  }'
```

Esperado: `200` com mensagem neutra (não expõe se e-mail existe).

## 2.8 Validar código de recuperação

### POST `/auth/password/verify-code`

```bash
curl -X POST "http://localhost:3333/auth/password/verify-code" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana.freela@example.com",
    "code": "123456"
  }'
```

Esperado: `200` quando o código estiver válido e não expirado.

## 2.9 Redefinir senha com código

### POST `/auth/password/reset`

```bash
curl -X POST "http://localhost:3333/auth/password/reset" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana.freela@example.com",
    "code": "123456",
    "newPassword": "NovaSenha123!",
    "confirmNewPassword": "NovaSenha123!"
  }'
```

Esperado: `200` e senha alterada.

---

## 3) Perfil (rotas autenticadas)

## 3.1 Ver perfil logado

### GET `/profile/me`

```bash
curl -X GET "http://localhost:3333/profile/me" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## 3.2 Atualizar perfil básico

### PUT `/profile/me`

```bash
curl -X PUT "http://localhost:3333/profile/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "name": "Ana Freelancer Silva",
    "phone": "11999998888",
    "avatarUrl": "https://exemplo.com/avatar.jpg"
  }'
```

## 3.3 Atualizar stack do freelancer

### PATCH `/profile/user/me/tech-stack`

```bash
curl -X PATCH "http://localhost:3333/profile/user/me/tech-stack" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
  -d '{
    "skills": [
      { "technologyId": "<TECH_ID_NODE>", "level": "INTERMEDIARIO" },
      { "technologyId": "<TECH_ID_REACT>", "level": "BASICO" },
      { "technologyId": "<TECH_ID_POSTGRES>", "level": "AVANCADO" }
    ]
  }'
```

Níveis aceitos:
- `BASICO`
- `INTERMEDIARIO`
- `AVANCADO`
- `ESPECIALISTA`

---

## 4) Tecnologias

## 4.1 Listar tecnologias

### GET `/technologies`

```bash
curl -X GET "http://localhost:3333/technologies"
```

## 4.2 Criar tecnologia (empresa)

### POST `/technologies`

```bash
curl -X POST "http://localhost:3333/technologies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>" \
  -d '{
    "name": "TypeScript"
  }'
```

Obs.: agora só são aceitas tecnologias do catálogo pré-definido.

## 4.3 Sincronizar catálogo padrão (empresa)

### POST `/technologies/seed-defaults`

```bash
curl -X POST "http://localhost:3333/technologies/seed-defaults" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>"
```

---

## 5) Vagas (implementado no P0)

## 5.1 Listar vagas

### GET `/vagas`

```bash
curl -X GET "http://localhost:3333/vagas?search=node&active=true"
```

## 5.2 Criar vaga (empresa)

### POST `/vagas`

```bash
curl -X POST "http://localhost:3333/vagas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>" \
  -d '{
    "title": "Backend Node.js Pleno",
    "description": "Projeto para evolucao de API REST com Node.js, Prisma e PostgreSQL.",
    "requirements": "Node.js, TypeScript, PostgreSQL",
    "deadline": "2026-08-01T00:00:00.000Z",
    "expiresAt": "2026-07-20T00:00:00.000Z",
    "requiredTechnologyIds": ["<TECH_ID_NODE>", "<TECH_ID_TS>"],
    "desirableTechnologyIds": ["<TECH_ID_POSTGRES>", "<TECH_ID_DOCKER>"]
  }'
```

Esperado: `201` com `id` da vaga.

## 5.3 Detalhar vaga

### GET `/vagas/:id`

```bash
curl -X GET "http://localhost:3333/vagas/<JOB_ID>"
```

## 5.4 Atualizar vaga (empresa dona)

### PUT `/vagas/:id`

```bash
curl -X PUT "http://localhost:3333/vagas/<JOB_ID>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>" \
  -d '{
    "title": "Backend Node.js Senior",
    "description": "Projeto atualizado para API REST e observabilidade.",
    "requirements": "Node.js, TypeScript, PostgreSQL, Docker",
    "deadline": "2026-08-15T00:00:00.000Z",
    "expiresAt": "2026-08-01T00:00:00.000Z",
    "requiredTechnologyIds": ["<TECH_ID_NODE>", "<TECH_ID_TS>", "<TECH_ID_POSTGRES>"],
    "desirableTechnologyIds": ["<TECH_ID_DOCKER>"]
  }'
```

## 5.5 Desativar vaga (soft delete)

### DELETE `/vagas/:id`

```bash
curl -X DELETE "http://localhost:3333/vagas/<JOB_ID>" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>"
```

Esperado: `200` com `isActive: false`.

## 5.6 Atualizar status da vaga (empresa dona)

### PATCH `/vagas/:id/status`

```bash
curl -X PATCH "http://localhost:3333/vagas/<JOB_ID>/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>" \
  -d '{ "status": "PAUSED" }'
```

Status aceitos:
- `OPEN` (também aceita `aberta`);
- `PAUSED` (também aceita `pausada`);
- `CLOSED` (também aceita `encerrada`);
- `CANCELLED` (também aceita `cancelada`).

---

## 6) Candidaturas (implementado no P0)

## 6.1 Candidatar em vaga (freelancer)

### POST `/vagas/:id/apply`

```bash
curl -X POST "http://localhost:3333/vagas/<JOB_ID>/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
  -d '{
    "resumeUrl": "https://exemplo.com/cv-ana.pdf",
    "coverLetter": "Tenho experiencia em Node.js e APIs com Prisma."
  }'
```

Erros esperados:
- `409` candidatura duplicada;
- `409` vaga não está `OPEN` ou está expirada/preenchida;
- `422` sem `resumeUrl` (quando o perfil também não possui currículo).

## 6.2 Listar candidaturas da vaga (empresa dona)

### GET `/vagas/:id/applications`

```bash
curl -X GET "http://localhost:3333/vagas/<JOB_ID>/applications?status=PENDING" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>"
```

## 6.3 Listar candidatos da vaga (empresa dona)

### GET `/vagas/:id/candidates`

```bash
curl -X GET "http://localhost:3333/vagas/<JOB_ID>/candidates?status=PENDING" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>"
```

## 6.4 Candidaturas do freelancer (ciclo P0)

### GET `/applications/me`

```bash
curl -X GET "http://localhost:3333/applications/me?status=PENDING" \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>"
```

### PATCH `/applications/:id/status` (empresa)

```bash
curl -X PATCH "http://localhost:3333/applications/<APPLICATION_ID>/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>" \
  -d '{ "status": "REVIEWED" }'
```

Status permitidos no body: `REVIEWED`, `ACCEPTED`, `COMPLETED`, `REJECTED`.

### PATCH `/applications/:id/cancel` (freelancer)

```bash
curl -X PATCH "http://localhost:3333/applications/<APPLICATION_ID>/cancel" \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>"
```

## 6.5 Mensagens da vaga (ainda não implementado)

### GET `/vagas/:id/messages` (legado por vaga)

```bash
curl -X GET "http://localhost:3333/vagas/<JOB_ID>/messages" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>"
```

Esperado no momento: `501 NOT_IMPLEMENTED`.

---

## 7) Notificações internas

Rotas autenticadas para `user` e `company`.

### GET `/notifications`

```bash
curl -X GET "http://localhost:3333/notifications?page=1&limit=20&read=false" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### PATCH `/notifications/:id/read`

```bash
curl -X PATCH "http://localhost:3333/notifications/<NOTIFICATION_ID>/read" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### GET `/notifications/unread-count`

```bash
curl -X GET "http://localhost:3333/notifications/unread-count" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 8) Perfis públicos

### GET `/profile/users/:id`

```bash
curl -X GET "http://localhost:3333/profile/users/<USER_ID>"
```

### GET `/profile/companies/:id`

```bash
curl -X GET "http://localhost:3333/profile/companies/<COMPANY_ID>"
```

---

## 9) Avaliações

### POST `/reviews`

```bash
curl -X POST "http://localhost:3333/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "applicationId": "<APPLICATION_ID>",
    "rating": 5,
    "comment": "Ótima experiência no projeto."
  }'
```

Regra: só permite avaliação quando a candidatura estiver em `COMPLETED`.

### GET `/reviews/received`

```bash
curl -X GET "http://localhost:3333/reviews/received?page=1&limit=20" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### GET `/reviews/summary`

```bash
curl -X GET "http://localhost:3333/reviews/summary" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 10) Matching

### GET `/matching/jobs` (freelancer)

```bash
curl -X GET "http://localhost:3333/matching/jobs?limit=20" \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>"
```

### GET `/matching/jobs/:jobId/candidates` (empresa dona da vaga)

```bash
curl -X GET "http://localhost:3333/matching/jobs/<JOB_ID>/candidates?limit=20" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>"
```

---

## 11) Administração básica

As rotas exigem `role=admin` no JWT (usuário admin).

### GET `/admin/users`

```bash
curl -X GET "http://localhost:3333/admin/users?type=user&page=1&limit=20" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

### PATCH `/admin/users/:id/block`

```bash
curl -X PATCH "http://localhost:3333/admin/users/<TARGET_ID>/block?type=user" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

### PATCH `/admin/users/:id/unblock`

```bash
curl -X PATCH "http://localhost:3333/admin/users/<TARGET_ID>/unblock?type=user" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

### GET `/admin/jobs`

```bash
curl -X GET "http://localhost:3333/admin/jobs?page=1&limit=20" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

### PATCH `/admin/jobs/:id/moderate-remove`

```bash
curl -X PATCH "http://localhost:3333/admin/jobs/<JOB_ID>/moderate-remove" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

---

## 12) Ordem recomendada de teste (smoke)

1. `GET /health`
2. cadastro freelancer + empresa
3. login freelancer + empresa
4. criar tecnologia
5. criar vaga
6. detalhar vaga
7. candidatura do freelancer
8. listar candidaturas e candidatos (empresa)
9. atualizar vaga
10. desativar vaga

---

## 13) Erros comuns

Contrato padrão de erro:

```json
{
  "success": false,
  "message": "Dados inválidos.",
  "code": "OPTIONAL_CODE",
  "errors": {
    "field": ["mensagem de validação"]
  }
}
```

- `401 UNAUTHORIZED` ou `INVALID_TOKEN`: token ausente/inválido.
- `403 FORBIDDEN`: tipo de usuário sem permissão.
- `404 *_NOT_FOUND`: recurso inexistente.
- `409 APPLICATION_ALREADY_EXISTS` ou `JOB_NOT_AVAILABLE`: conflito de regra de negócio.
- `400`: validação de payload (Zod).
- `422`: regra de negócio semântica.

---

## 14) Observações de escopo

- Pagamentos (gateway, assinatura, cobrança real, webhook financeiro) ficam fora do MVP.
- Use apenas fluxo interno de vagas/candidaturas para os testes do MVP atual.
