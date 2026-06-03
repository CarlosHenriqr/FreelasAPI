import {
  LayoutDashboard,
  FolderKanban,
  FilePlus2,
  Users,
  Bell,
  BriefcaseBusiness,
  Search,
  FileUser,
  Sparkles,
} from 'lucide-react';
import type { NavItem } from '@/components/taskio/AppShell';

export const empresaNav: NavItem[] = [
  { label: 'Dashboard', to: '/empresa/dashboard', icon: LayoutDashboard },
  { label: 'Meus projetos', to: '/empresa/projetos', icon: FolderKanban },
  { label: 'Publicar projeto', to: '/empresa/publicar', icon: FilePlus2 },
  { label: 'Candidatos', to: '/empresa/candidatos', icon: Users },
  { label: 'Notificações', to: '/empresa/notificacoes', icon: Bell },
];

export const freelancerNav: NavItem[] = [
  { label: 'Dashboard', to: '/freelancer/dashboard', icon: LayoutDashboard },
  { label: 'Buscar vagas', to: '/freelancer/vagas', icon: Search },
  { label: 'Recomendadas', to: '/freelancer/recomendadas', icon: Sparkles },
  { label: 'Meus trabalhos', to: '/freelancer/trabalhos', icon: BriefcaseBusiness },
  { label: 'Meu perfil', to: '/freelancer/perfil', icon: FileUser },
];

export const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Usuários', to: '/admin/usuarios', icon: Users },
  { label: 'Vagas', to: '/admin/vagas', icon: FolderKanban },
];

export function getDashboardPath(type: string, role?: string): string {
  if (role === 'admin') return '/admin/dashboard';
  if (type === 'company') return '/empresa/dashboard';
  return '/freelancer/dashboard';
}
