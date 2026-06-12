export const RESUME_ALLOWED_HOSTS = [
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'www.dropbox.com',
  'dl.dropboxusercontent.com',
  'onedrive.live.com',
  '1drv.ms',
  'linkedin.com',
  'www.linkedin.com',
] as const;

export const RESUME_URL_ERROR =
  'Use link público do Google Drive, Dropbox, OneDrive ou LinkedIn.';

export function isAllowedResumeHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return RESUME_ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

export function isValidResumeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return isAllowedResumeHost(parsed.hostname);
  } catch {
    return false;
  }
}
