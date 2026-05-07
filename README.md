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
