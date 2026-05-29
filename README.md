# Taskio-API

API backend da plataforma de freelancers, construída com Node.js, TypeScript, Express, Prisma e PostgreSQL.

## Visão geral

O projeto atende o MVP com dois perfis principais:
- **Freelancer** (`user`)
- **Empresa / contratante** (`company`)

Também possui papel **admin** (`role=admin`) para moderação básica.

## Stack técnica

- **Node.js** + **TypeScript**
- **Express**
- **Prisma ORM**
- **PostgreSQL** (com suporte a Supabase)
- **Zod** para validação
- **JWT** (access + refresh token)
- **bcryptjs** para hash de senha
- **Helmet** + **express-rate-limit**
- **nodemailer** para envio de código de recuperação de senha

## Funcionalidades implementadas (MVP atual)F

- Autenticação de freelancer e empresa:
  - cadastro, login, refresh token e logout
- Recuperação de senha de freelancer por código via e-mail:
  - solicitar código
  - validar código
  - redefinir senha
- Perfil autenticado:
  - `/profile/me`
  - experiências, portfólio, currículo e tech stack
- Perfis públicos:
  - `GET /profile/users/:id`
  - `GET /profile/companies/:id`
- Vagas:
  - CRUD básico
  - status explícito (`OPEN`, `PAUSED`, `CLOSED`, `CANCELLED`)
  - candidatura bloqueada quando vaga indisponível
- Candidaturas:
  - candidatura em vaga
  - listagem por empresa e por freelancer
  - transições de status (inclui `COMPLETED`)
  - cancelamento por freelancer
- Notificações internas:
  - listagem
  - marcar como lida
  - contador de não lidas
  - eventos automáticos de candidatura/status
- Reviews:
  - criação de avaliação por vínculo concluído (`COMPLETED`)
  - listagem recebida
  - resumo (média e distribuição)
- Matching:
  - vagas recomendadas para freelancer
  - candidatos recomendados para empresa
- Administração básica:
  - listar, bloquear e desbloquear usuários/empresas
  - listar e moderar/remover vagas
  - trilha de auditoria mínima (`admin_audit_logs`)

## Changelog recente

- **Status explícito de vagas**
  - `PATCH /vagas/:id/status` com regras de transição e bloqueio de candidatura quando vaga não está `OPEN`.
- **Notificações internas**
  - módulo completo com `GET /notifications`, `PATCH /notifications/:id/read`, `GET /notifications/unread-count`.
- **Perfis públicos**
  - `GET /profile/users/:id` e `GET /profile/companies/:id`.
- **Contrato de erro**
  - padronização para `{ success: false, message, code?, errors? }` e validação Zod com `400`.
- **Reviews + conclusão de vínculo**
  - fluxo de avaliação condicionado a candidatura `COMPLETED`.
- **Matching dedicado**
  - endpoints separados para recomendações de vagas e candidatos.
- **Admin básico**
  - papel `admin` no JWT, guard de role, moderação de usuários e vagas com auditoria.
- **Recuperação de senha por e-mail**
  - fluxo `forgot -> verify-code -> reset` com código de 6 dígitos, expiração e limite de tentativas.

## Segurança e contrato de API

- Middleware de autenticação JWT + guards por tipo/papel
- Ownership checks em service layer
- Rate limits globais e por rotas sensíveis
- Contrato de erro padronizado:
  - `{ success: false, message, code?, errors? }`
- Validação de payload com Zod (`400` para erro de validação)

## Estrutura do projeto

```bash
FreelasAPI/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── notifications/
│   │   ├── reviews/
│   │   ├── matching/
│   │   └── admin/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── docs/
│   ├── mvp-escopo.md
│   ├── endpoints-teste.md
│   ├── pendencias-implementacao-mvp.md
│   └── postman/
│       └── freelasapi.postman_collection.json
├── package.json
└── tsconfig.json
```

## Configuração rápida

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente no `.env`:
- Banco: `DATABASE_URL`, `DIRECT_URL`
- JWT: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, expirations
- Segurança: `MAX_LOGIN_ATTEMPTS`, `BLOCK_DURATION_MINUTES`
- Recuperação de senha:
  - `PASSWORD_RESET_CODE_TTL_MINUTES`
  - `PASSWORD_RESET_MAX_ATTEMPTS`
- SMTP:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`

3. Gerar client Prisma:
```bash
npm run prisma:generate
```

4. Rodar migrações:
```bash
npm run prisma:migrate
```

5. Subir API:
```bash
npm run dev
```

## Scripts úteis

- `npm run dev` - sobe API em desenvolvimento
- `npm run build` - compila TypeScript
- `npm run start` - roda build em produção
- `npm run prisma:generate` - regenera Prisma Client
- `npm run prisma:migrate` - executa migrações locais
- `npm run prisma:studio` - abre Prisma Studio

## Documentação

- Escopo do MVP: `docs/mvp-escopo.md`
- Endpoints para teste: `docs/endpoints-teste.md`
- Pendências do MVP: `docs/pendencias-implementacao-mvp.md`
- Collection Postman: `docs/postman/freelasapi.postman_collection.json`
# FreelasAPI

API backend da plataforma de freelancers, construída com Node.js, TypeScript, Express, Prisma e PostgreSQL.

## Visão geral

O projeto atende o MVP com dois perfis principais:
- **Freelancer** (`user`)
- **Empresa / contratante** (`company`)

Também possui papel **admin** (`role=admin`) para moderação básica.

## Stack técnica

- **Node.js** + **TypeScript**
- **Express**
- **Prisma ORM**
- **PostgreSQL** (com suporte a Supabase)
- **Zod** para validação
- **JWT** (access + refresh token)
- **bcryptjs** para hash de senha
- **Helmet** + **express-rate-limit**
- **nodemailer** para envio de código de recuperação de senha

## Funcionalidades implementadas (MVP atual)

- Autenticação de freelancer e empresa:
  - cadastro, login, refresh token e logout
- Recuperação de senha de freelancer por código via e-mail:
  - solicitar código
  - validar código
  - redefinir senha
- Perfil autenticado:
  - `/profile/me`
  - experiências, portfólio, currículo e tech stack
- Perfis públicos:
  - `GET /profile/users/:id`
  - `GET /profile/companies/:id`
- Vagas:
  - CRUD básico
  - status explícito (`OPEN`, `PAUSED`, `CLOSED`, `CANCELLED`)
  - candidatura bloqueada quando vaga indisponível
- Candidaturas:
  - candidatura em vaga
  - listagem por empresa e por freelancer
  - transições de status (inclui `COMPLETED`)
  - cancelamento por freelancer
- Notificações internas:
  - listagem
  - marcar como lida
  - contador de não lidas
  - eventos automáticos de candidatura/status
- Reviews:
  - criação de avaliação por vínculo concluído (`COMPLETED`)
  - listagem recebida
  - resumo (média e distribuição)
- Matching:
  - vagas recomendadas para freelancer
  - candidatos recomendados para empresa
- Administração básica:
  - listar, bloquear e desbloquear usuários/empresas
  - listar e moderar/remover vagas
  - trilha de auditoria mínima (`admin_audit_logs`)

## Segurança e contrato de API

- Middleware de autenticação JWT + guards por tipo/papel
- Ownership checks em service layer
- Rate limits globais e por rotas sensíveis
- Contrato de erro padronizado:
  - `{ success: false, message, code?, errors? }`
- Validação de payload com Zod (`400` para erro de validação)

## Estrutura do projeto

```bash
FreelasAPI/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── notifications/
│   │   ├── reviews/
│   │   ├── matching/
│   │   └── admin/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── docs/
│   ├── mvp-escopo.md
│   ├── endpoints-teste.md
│   ├── pendencias-implementacao-mvp.md
│   └── postman/
│       └── freelasapi.postman_collection.json
├── package.json
└── tsconfig.json
```

## Configuração rápida

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente no `.env`:
- Banco: `DATABASE_URL`, `DIRECT_URL`
- JWT: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, expirations
- Segurança: `MAX_LOGIN_ATTEMPTS`, `BLOCK_DURATION_MINUTES`
- Recuperação de senha:
  - `PASSWORD_RESET_CODE_TTL_MINUTES`
  - `PASSWORD_RESET_MAX_ATTEMPTS`
- SMTP:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`

3. Gerar client Prisma:
```bash
npm run prisma:generate
```

4. Rodar migrações:
```bash
npm run prisma:migrate
```

5. Subir API:
```bash
npm run dev
```

## Scripts úteis

- `npm run dev` - sobe API em desenvolvimento
- `npm run build` - compila TypeScript
- `npm run start` - roda build em produção
- `npm run prisma:generate` - regenera Prisma Client
- `npm run prisma:migrate` - executa migrações locais
- `npm run prisma:studio` - abre Prisma Studio

## Documentação

- Escopo do MVP: `docs/mvp-escopo.md`
- Endpoints para teste: `docs/endpoints-teste.md`
- Pendências do MVP: `docs/pendencias-implementacao-mvp.md`
- Collection Postman: `docs/postman/freelasapi.postman_collection.json`
# FreelasAPI

API backend para uma plataforma de freelancers, desenvolvida com **Node.js**, **TypeScript**, **Express**, **Prisma** e **PostgreSQL**.

O projeto atende o fluxo principal do MVP com dois perfis:

- **Freelancer** (`user`)
- **Empresa / contratante** (`company`)

## Tecnologias utilizadas

- **Node.js**
- **TypeScript**
- **Express**
- **Prisma ORM**
- **PostgreSQL**
- **Zod** para validacao de dados
- **JWT** para autenticacao
- **bcryptjs** para hash de senhas
- **Helmet** para reforco de seguranca HTTP
- **express-rate-limit** para protecao contra abuso de requisicoes
- **Supabase** (dependencias presentes no projeto)
- **dotenv** para configuracao de ambiente

## Escopo MVP (estado atual)

### Implementado
- Cadastro e login de freelancer/empresa
- JWT com access/refresh token (rotacao + logout)
- Perfil do usuario logado (`/profile/me`) e atualizacao de perfil
- Gestao de curriculo, experiencias e portfolio do freelancer
- Stack de skills do freelancer por tecnologias pre-cadastradas com nivel:
  - `BASICO`
  - `INTERMEDIARIO`
  - `AVANCADO`
  - `ESPECIALISTA`
- Catalogo de tecnologias com endpoint de seed padrao
- Vagas: criar, listar, detalhar, atualizar e desativar (soft delete)
- Candidaturas: candidatura em vaga e listagem por vaga
- Matching simples baseado em tecnologias obrigatorias/desejaveis
- Seguranca com helmet, rate limit e validacoes com Zod
- Health check (`/health`)

### Parcial (em evolucao)
- Ciclo completo de candidaturas (cancelar e mudanca de status dedicada)
- Comunicacao inicial/mensagens (rota existe, implementacao parcial)
- Notificacoes internas completas
- Avaliacoes entre usuarios
- Administracao basica (perfil admin e moderacao)

### Fora do escopo MVP
- Pagamentos reais, assinaturas e integracoes financeiras

## Estrutura do projeto

```bash
FreelasAPI/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── docs/
│   ├── mvp-escopo.md
│   ├── endpoints-teste.md
│   ├── pendencias-implementacao-mvp.md
│   └── postman/
│       └── freelasapi.postman_collection.json
├── package.json
└── tsconfig.json
```

## Scripts uteis

- `npm run dev` - sobe API em desenvolvimento
- `npm run build` - compila TypeScript
- `npm run prisma:generate` - regenera Prisma Client
- `npm run prisma:migrate` - executa migracoes locais

## Documentacao

- Escopo do MVP: `docs/mvp-escopo.md`
- Endpoints para teste: `docs/endpoints-teste.md`
- Pendencias do MVP: `docs/pendencias-implementacao-mvp.md`
- Collection Postman: `docs/postman/freelasapi.postman_collection.json`
# FreelasAPI

API backend para uma plataforma de freelancers, desenvolvida com **Node.js**, **TypeScript**, **Express**, **Prisma** e **PostgreSQL**.

O projeto foi estruturado para atender o fluxo inicial de autenticação da plataforma, permitindo cadastro e login de dois perfis distintos:

- **Freelancer** (`user`)
- **Empresa / contratante** (`company`)

## Tecnologias utilizadas

- **Node.js**
- **TypeScript**
- **Express**
- **Prisma ORM**
- **PostgreSQL**
- **Zod** para validação de dados
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Helmet** para reforço de segurança HTTP
- **express-rate-limit** para proteção contra abuso de requisições
- **Supabase** (dependências presentes no projeto)
- **dotenv** para configuração de ambiente

## Objetivo do projeto

A proposta da API é servir como backend de uma plataforma de conexão entre freelancers e empresas, começando pelo módulo de autenticação e base estrutural do sistema.

Atualmente, o projeto já possui:

- Cadastro de freelancer com validação de **CPF**
- Cadastro de empresa com validação de **CNPJ**
- Login para ambos os perfis
- Geração de **access token** e **refresh token**
- Rotação de refresh token
- Logout com revogação de token
- Proteção de rotas com middleware JWT
- Rate limit global e por rotas sensíveis
- Health check da aplicação

## Estrutura do projeto

```bash
FreelasAPI/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── docs/
│   ├── middlewares/
│   ├── modules/
│   │   └── auth/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── package.json
└── tsconfig.json
