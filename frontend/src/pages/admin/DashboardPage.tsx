import { useQuery } from '@tanstack/react-query';
import { Users, Building2, Briefcase, Shield } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { Card, StatCard } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { adminNav } from '@/lib/nav';
import { adminApi } from '@/lib/api/admin.api';

export function AdminDashboardPage() {
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.listUsers({ limit: 100 }),
  });

  const companiesQuery = useQuery({
    queryKey: ['admin', 'companies'],
    queryFn: () => adminApi.listUsers({ type: 'company', limit: 100 }),
  });

  const jobsQuery = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: () => adminApi.listJobs(1, 100),
  });

  const users = usersQuery.data ?? [];
  const companies = companiesQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const blocked = users.filter((u) => u.isBlocked).length;
  const isLoading = usersQuery.isLoading || jobsQuery.isLoading;

  return (
    <AppShell
      nav={adminNav}
      subtitle="Admin"
      title="Dashboard"
      description="Visão geral da plataforma TASKIO."
      showSearch={false}
    >
      <PageTransition>
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {(usersQuery.isError || jobsQuery.isError) && (
          <ErrorState
            onRetry={() => {
              usersQuery.refetch();
              jobsQuery.refetch();
            }}
          />
        )}
        {!isLoading && !usersQuery.isError && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Freelancers" value={users.length} icon={Users} />
              <StatCard label="Empresas" value={companies.length} icon={Building2} />
              <StatCard label="Vagas" value={jobs.length} icon={Briefcase} />
              <StatCard
                label="Usuários bloqueados"
                value={blocked}
                deltaTone={blocked > 0 ? 'danger' : 'neutral'}
                icon={Shield}
              />
            </div>
            <Card className="mt-6 p-6">
              <h2 className="font-display text-lg font-semibold">Moderação</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use o menu lateral para gerenciar usuários e vagas da plataforma.
              </p>
            </Card>
          </>
        )}
      </PageTransition>
    </AppShell>
  );
}
