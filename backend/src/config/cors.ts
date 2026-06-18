const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

/** Produção e previews Cloudflare Pages do projeto (task-io-7d3.pages.dev). */
const CLOUDFLARE_PAGES_ORIGIN =
  /^https:\/\/([a-z0-9-]+\.)?task-io-7d3\.pages\.dev$/i;

function configuredOrigins(): string[] {
  return (
    process.env.FRONTEND_URL?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? DEV_ORIGINS
  );
}

export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) return true;

  if (configuredOrigins().includes(origin)) return true;

  if (DEV_ORIGINS.includes(origin)) return true;

  if (CLOUDFLARE_PAGES_ORIGIN.test(origin)) return true;

  return false;
}
