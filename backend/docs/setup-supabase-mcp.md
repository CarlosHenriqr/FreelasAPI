# Supabase — FreelasAPI (MCP + Prisma)

## Prisma ORM (já configurado no projeto)

O FreelasAPI **já usa Prisma**. Não é necessário rodar `prisma init` de novo.

| Item | Status |
|------|--------|
| `prisma` + `@prisma/client` | Instalados em `package.json` |
| `prisma/schema.prisma` | `url` + `directUrl` para Supabase |
| Variáveis | `DATABASE_URL` e `DIRECT_URL` no `.env` |

### Formato das URLs (projeto **Taskio** `otoyxzygsehrnlaslyuf`, região `us-west-2`)

Copie de **Supabase Dashboard → Project Settings → Database → Connection string** e substitua `[YOUR-PASSWORD]`:

```env
# Runtime (API / Prisma Client) — Transaction pooler, porta 6543
DATABASE_URL="postgresql://postgres.otoyxzygsehrnlaslyuf:[YOUR-PASSWORD]@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Migrações (prisma migrate) — Session pooler, porta 5432
DIRECT_URL="postgresql://postgres.otoyxzygsehrnlaslyuf:[YOUR-PASSWORD]@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

> **Não use** `db.otoyxzygsehrnlaslyuf.supabase.co` na `DIRECT_URL` se der P1001 no Windows (DNS/IPv6). Use sempre o **Session pooler** na porta **5432**.

> **Não coloque** a porta 5432 na `DATABASE_URL` — ela é só para `DIRECT_URL`. Runtime usa **6543** + `pgbouncer=true`.

> Este projeto usa **`.env`** (não `.env.local`). O `dotenv` carrega `.env` ao iniciar a API.

### Comandos úteis

```bash
npm run prisma:generate
npm run prisma:migrate
npx prisma migrate status
```

Template sem senha: `.env.example`

### Erro P1000 (Authentication failed)

1. **Dashboard** → projeto **Freelas** (`ssxygfazpdsywavsfrkc`) → **Settings** → **Database**
2. Copie a senha atual ou use **Reset database password**
3. Cole em `DATABASE_URL` e `DIRECT_URL` (substitua `[YOUR-PASSWORD]`)
4. Senha com `@`, `#`, `%` etc. → [URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) na connection string

| Variável | Porta | Uso |
|----------|-------|-----|
| `DATABASE_URL` | **6543** + `?pgbouncer=true` | API / Prisma Client |
| `DIRECT_URL` | **5432** (Session pooler) | `prisma migrate` |

### Erro P1001 (Can't reach database server)

Causas comuns neste projeto:

1. **`DATABASE_URL` na porta errada** — se estiver em `5432`, troque runtime para **6543** + `pgbouncer=true`.
2. **Host `db.*.supabase.co`** — rede sem IPv6 no Windows; use Session pooler (`aws-1-us-west-2.pooler.supabase.com:5432`) na `DIRECT_URL`.
3. **Conexão intermitente** da rede local ao pooler — tente de novo, use VPN off/on, ou rode `npx prisma migrate deploy` no **Render** (preDeploy), onde a conexão costuma ser estável.
4. **Senha com caracteres especiais** — faça URL-encode na connection string ou resete a senha no dashboard.

---

# Supabase MCP — FreelasAPI

Configuração do servidor MCP remoto do Supabase para uso no **Cursor** (e referência para Claude Code CLI).

## 1. Configuração no projeto (Cursor)

Arquivo: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=ssxygfazpdsywavsfrkc"
    }
  }
}
```

Equivalente ao comando Claude Code:

```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=ssxygfazpdsywavsfrkc"
```

## 2. Autenticação (Cursor)

1. Abra **Cursor Settings** → **Tools & MCP** (ou **MCP**).
2. Localize o servidor **supabase** e clique em **Authenticate** / **Login**.
3. Conclua o login no navegador (OAuth do Supabase).
4. Reinicie o Cursor ou recarregue a janela se as ferramentas não aparecerem.

No **Claude Code CLI** (terminal externo, não no IDE):

```bash
claude /mcp
```

Depois selecione `supabase` → **Authenticate**.

## 3. Agent Skills (opcional)

```bash
npx skills add supabase/agent-skills
```

No Cursor, as skills do Supabase também podem vir do plugin instalado em **Extensions / Plugins**.

## 4. Conferir se está funcionando

Peça ao agente, por exemplo:

> Liste as tabelas do banco usando o MCP do Supabase.

Ferramentas úteis: `list_tables`, `list_migrations`, `apply_migration`, `execute_sql`, `get_logs`.

## 5. Alinhar `project_ref` com o `.env`

O `project_ref` na URL do MCP deve ser o **mesmo projeto** usado em `DATABASE_URL` / `DIRECT_URL` no `.env`.

- MCP configurado: `ssxygfazpdsywavsfrkc`
- Se o host do Postgres no `.env` usar outro ref (ex.: `wjvvbcwyvwcizkkwiuno`), atualize um dos dois para apontar ao mesmo projeto no [dashboard Supabase](https://supabase.com/dashboard).

## 6. Segurança (recomendado)

- Use apenas em ambiente de **desenvolvimento**.
- Considere `?read_only=true` na URL se for só consulta.
- Mantenha aprovação manual de cada tool call no Cursor.
