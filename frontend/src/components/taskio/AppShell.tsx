import { Link, useLocation, useNavigate } from 'react-router-dom';
import { type LucideIcon, Bell, Search, Settings, LogOut, Plus, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Logo } from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/lib/api/notifications.api';
import { getInitials } from '@/lib/utils';

export type NavItem = { label: string; to: string; icon: LucideIcon; badge?: string };

export function AppShell({
  nav,
  subtitle,
  primaryAction,
  title,
  description,
  actions,
  children,
  showSearch = true,
}: {
  nav: NavItem[];
  subtitle: string;
  primaryAction?: { label: string; to: string };
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  showSearch?: boolean;
}) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30000,
  });

  const unreadCount = unread?.count ?? 0;
  const isActive = (to: string) => pathname === to || (to !== '/' && pathname.startsWith(to + '/'));

  const navWithBadges = nav.map((item) =>
    item.to.includes('notificacoes') && unreadCount > 0
      ? { ...item, badge: String(unreadCount) }
      : item,
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.type === 'user') {
      navigate(`/freelancer/vagas?search=${encodeURIComponent(search)}`);
    } else if (user?.type === 'company') {
      navigate(`/empresa/projetos?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-surface/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo subtitle={subtitle} />
        <button
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-md border bg-surface"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      <div className="lg:flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-sidebar transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-5">
            <Logo subtitle={subtitle} />
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-md hover:bg-sidebar-accent lg:hidden"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Workspace
            </p>
            {navWithBadges.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  )}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-sidebar-border p-3">
            {primaryAction && (
              <Link
                to={primaryAction.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> {primaryAction.label}
              </Link>
            )}
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.35_0.2_268)] text-xs font-semibold text-primary-foreground">
                {user ? getInitials(user.name) : '?'}
              </div>
              <div className="flex-1 overflow-hidden text-sm">
                <p className="truncate font-medium">{user?.name ?? 'Usuário'}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent"
                aria-label="Configurações"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </aside>

        {open && (
          <button
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden"
            aria-label="Fechar menu"
          />
        )}

        <main className="min-w-0 flex-1">
          {showSearch && (
            <div className="sticky top-0 z-20 hidden border-b bg-surface/80 backdrop-blur lg:block">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-4 px-8 py-4"
              >
                <div className="relative max-w-md flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar projetos, candidatos, vagas..."
                    className="h-9 w-full rounded-md border border-input bg-surface-muted pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:bg-surface focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <Link
                  to={
                    user?.type === 'company'
                      ? '/empresa/notificacoes'
                      : '/freelancer/dashboard'
                  }
                  className="relative grid h-9 w-9 place-items-center rounded-md border bg-surface transition-colors hover:bg-accent"
                  aria-label="Notificações"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </form>
            </div>
          )}

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
