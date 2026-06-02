import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiRequestError } from '@/lib/api/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dias`;
  return d.toLocaleDateString('pt-BR');
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  PAUSED: 'Pausada',
  CLOSED: 'Encerrada',
  CANCELLED: 'Cancelada',
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  REVIEWED: 'Em análise',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export const SKILL_LEVEL_LABELS: Record<string, string> = {
  BASICO: 'Básico',
  INTERMEDIARIO: 'Intermediário',
  AVANCADO: 'Avançado',
  ESPECIALISTA: 'Especialista',
};

export function mapApiErrors(err: unknown): { message: string; fields: Record<string, string> } {
  if (err instanceof ApiRequestError) {
    const fields: Record<string, string> = {};
    if (err.errors) {
      for (const [key, msgs] of Object.entries(err.errors)) {
        fields[key] = msgs[0] ?? '';
      }
    }
    return { message: err.message, fields };
  }
  return { message: 'Ocorreu um erro. Tente novamente.', fields: {} };
}
