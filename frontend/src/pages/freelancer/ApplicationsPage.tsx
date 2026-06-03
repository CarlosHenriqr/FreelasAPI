import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { Card, EmptyState, Select } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { freelancerNav } from '@/lib/nav';
import { applicationsApi } from '@/lib/api/applications.api';
import { formatRelativeDate } from '@/lib/utils';
import type { ApplicationStatus } from '@/types/api';

export function FreelancerApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');

  const query = useQuery({
    queryKey: ['my-applications', statusFilter],
    queryFn: () =>
      applicationsApi.myApplications(statusFilter || undefined),
  });

  const apps = query.data ?? [];

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title="Meus trabalhos"
      description="Acompanhe todas as suas candidaturas e contratos."
    >
      <PageTransition>
        <Card className="mb-5 p-4">
          <Select
            className="sm:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | '')}
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="REVIEWED">Em análise</option>
            <option value="ACCEPTED">Aceita</option>
            <option value="REJECTED">Recusada</option>
            <option value="COMPLETED">Concluída</option>
            <option value="CANCELLED">Cancelada</option>
          </Select>
        </Card>

        {query.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {query.isError && <ErrorState onRetry={() => query.refetch()} />}
        {!query.isLoading && apps.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhuma candidatura"
            description="Explore projetos e envie sua primeira proposta."
            action={
              <Link to="/freelancer/vagas">
                <span className="text-sm font-semibold text-primary hover:underline">
                  Buscar projetos
                </span>
              </Link>
            }
          />
        )}
        <div className="space-y-3">
          {apps.map((a) => (
            <Link key={a.id} to={`/freelancer/trabalhos/${a.id}`}>
              <Card className="flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-surface-muted/50">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.job?.title ?? 'Projeto'}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.job?.company?.name} · {formatRelativeDate(a.createdAt)}
                  </p>
                </div>
                <ApplicationStatusBadge status={a.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      </PageTransition>
    </AppShell>
  );
}
