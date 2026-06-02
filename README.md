# Taskio

Plataforma de freelancers — projeto de TCC (Trabalho de Conclusão de Curso).

Conecta **freelancers** e **empresas** para publicação de vagas, candidaturas, matching, avaliações e moderação administrativa.

## Estrutura do repositório

```bash
Taskio-API/
├── backend/          # API REST (Node.js, Express, Prisma, PostgreSQL)
│   └── docs/         # Documentação técnica e Postman
├── frontend/         # Interface web (a ser implementada)
└── README.md         # Este arquivo
```

| Pasta | Descrição |
|-------|-----------|
| [`backend/`](backend/) | API, banco de dados, migrações Prisma e documentação técnica da API |
| [`frontend/`](frontend/) | Aplicação React (Vite, Tailwind, integração completa com a API) |

## Perfis do sistema (MVP)

- **Freelancer** — perfil, portfólio, candidaturas e recomendações de vagas
- **Empresa** — publicação de vagas, gestão de candidatos e matching
- **Admin** — moderação de usuários, empresas e vagas

## Início rápido

### Backend

```bash
cd backend
npm install
# configure o arquivo .env (veja backend/README.md)
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Documentação completa da API: **[backend/README.md](backend/README.md)**

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # ou crie .env com VITE_API_URL=http://localhost:3333
npm run dev
```

Documentação completa: **[frontend/README.md](frontend/README.md)**

## Documentação da API

Arquivos em `backend/docs/`:

- [Escopo do MVP](backend/docs/mvp-escopo.md)
- [Endpoints para teste](backend/docs/endpoints-teste.md)
- [Pendências do MVP](backend/docs/pendencias-implementacao-mvp.md)
- [Collection Postman](backend/docs/postman/freelasapi.postman_collection.json)

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | Node.js, TypeScript, Express, Prisma, PostgreSQL, Zod, JWT |
| Frontend | React, TypeScript, Vite, Tailwind CSS 4, TanStack Query, Framer Motion |
