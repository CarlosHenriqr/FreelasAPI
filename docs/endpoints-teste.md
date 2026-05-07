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
- `409` vaga inativa/expirada;
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

## 6.4 Mensagens da vaga (ainda não implementado)

### GET `/vagas/:id/messages`

```bash
curl -X GET "http://localhost:3333/vagas/<JOB_ID>/messages" \
  -H "Authorization: Bearer <COMPANY_ACCESS_TOKEN>"
```

Esperado no momento: `501 NOT_IMPLEMENTED`.

---

## 7) Ordem recomendada de teste (smoke)

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

## 8) Erros comuns

- `401 UNAUTHORIZED` ou `INVALID_TOKEN`: token ausente/inválido.
- `403 FORBIDDEN`: tipo de usuário sem permissão.
- `404 *_NOT_FOUND`: recurso inexistente.
- `409 APPLICATION_ALREADY_EXISTS` ou `JOB_NOT_AVAILABLE`: conflito de regra de negócio.
- `422`: validação de payload/regras de data.

---

## 9) Observações de escopo

- Pagamentos (gateway, assinatura, cobrança real, webhook financeiro) ficam fora do MVP.
- Use apenas fluxo interno de vagas/candidaturas para os testes do MVP atual.
