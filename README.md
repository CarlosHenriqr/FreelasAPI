# Taskio

Plataforma de freelancers — projeto de TCC (Trabalho de Conclusão de Curso).

Conecta **freelancers** e **empresas** para publicação de vagas, candidaturas, matching e avaliações.

## Estrutura do repositório

```bash
Taskio-API/
├── backend/          # API REST (Node.js, Express, Prisma, PostgreSQL)
│   └── docs/         # Documentação técnica e Postman
├── render.yaml       # Blueprint de deploy no Render
└── README.md         # Este arquivo
```

| Pasta | Descrição |
|-------|-----------|
| [`backend/`](backend/) | API, banco de dados, migrações Prisma e documentação técnica da API |

> O frontend é um repositório separado. Este repo contém apenas o backend da API.

## Perfis do sistema (MVP)

- **Freelancer** — perfil, portfólio, candidaturas e recomendações de vagas
- **Empresa** — publicação de vagas, gestão de candidatos e matching
- **Admin** — moderação de usuários, empresas e vagas

## Início rápido

```bash
cd backend
npm install
# configure o arquivo .env (veja backend/README.md e backend/.env.example)
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Documentação completa da API: **[backend/README.md](backend/README.md)**

## Deploy (Render + Supabase)

A API roda no **Render**; o PostgreSQL e o Storage ficam no **Supabase**.

1. Configure `DATABASE_URL` e `DIRECT_URL` no Supabase (veja `backend/.env.example`).
2. No Render, crie um **Web Service** apontando para este repositório.
3. Defina **Root Directory** como `backend` (ou use o `render.yaml` na raiz).
4. Preencha as variáveis sensíveis no painel: `DATABASE_URL`, `DIRECT_URL`, `FRONTEND_URL`, chaves Supabase e SMTP.

Comandos usados no deploy (já definidos em `render.yaml`):

| Etapa | Comando |
|-------|---------|
| Build | `npm install && npm run build` |
| Pre-deploy | `npx prisma migrate deploy` |
| Start | `npm start` |

## Documentação da API

Arquivos em `backend/docs/`:

- [Escopo do MVP](backend/docs/mvp-escopo.md)
- [Endpoints para teste](backend/docs/endpoints-teste.md)
- [Pendências do MVP](backend/docs/pendencias-implementacao-mvp.md)
- [Setup Supabase](backend/docs/setup-supabase-mcp.md)
- [Collection Postman](backend/docs/postman/freelasapi.postman_collection.json)

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | Node.js, TypeScript, Express, Prisma, PostgreSQL (Supabase), Zod, JWT |
| Storage | Supabase Storage (avatars) |
| Deploy | Render (Web Service) |
