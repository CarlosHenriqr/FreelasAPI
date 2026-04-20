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
