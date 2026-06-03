# Taskio — Frontend

Interface web da plataforma TASKIO (TCC). React + TypeScript + Tailwind CSS + Vite.

## Stack

- **React 19** + **TypeScript**
- **Vite 7** + **React Router 7**
- **TanStack Query** (dados da API)
- **Tailwind CSS 4** (Design System OKLCH)
- **Framer Motion** (animações)
- **Recharts** (dashboards)
- **Sonner** (toasts)
- **React Hook Form** + **Zod** (formulários)

## Início rápido

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```

A API deve estar rodando em `http://localhost:3333` (repositório [Taskio-API](https://github.com/CarlosHenriqr/Taskio-API)).

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API (padrão: proxy `/api` no dev) |

## Estrutura

```
frontend/src/
├── components/
│   ├── taskio/       # Design System (AppShell, Logo, UI primitives)
│   ├── layout/       # Rotas protegidas, transições
│   ├── feedback/     # Loading, erros
│   └── shared/       # JobCard, StatusBadge
├── contexts/         # AuthContext
├── lib/
│   ├── api/          # Cliente HTTP + endpoints
│   └── nav.ts        # Navegação por perfil
├── pages/
│   ├── public/       # Landing, login, cadastro, recuperar senha
│   ├── empresa/      # Dashboard, projetos, candidatos, notificações
│   ├── freelancer/   # Vagas, trabalhos, currículo, matching
│   └── admin/        # Moderação
├── types/            # Tipos alinhados ao backend
└── router/           # React Router
```

## Perfis e rotas

| Perfil | Prefixo | Funcionalidades |
|--------|---------|-----------------|
| Público | `/`, `/login`, `/cadastro/*` | Landing, auth, registro |
| Empresa | `/empresa/*` | Vagas, candidatos, notificações |
| Freelancer | `/freelancer/*` | Busca, candidaturas, perfil |
| Admin | `/admin/*` | Usuários e vagas |

## Scripts

- `npm run dev` — desenvolvimento (porta 5173)
- `npm run build` — build de produção
- `npm run preview` — preview do build

## Design System

Tokens em `src/styles.css`: paleta OKLCH, tipografia Inter/Geist, sombras, radius e variantes semânticas (`primary`, `success`, `warning`, `destructive`).

Componentes reutilizáveis em `src/components/taskio/ui.tsx`: `Btn`, `Card`, `Badge`, `StatCard`, `EmptyState`, `Field`, inputs.
