import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { Card, EmptyState, Select } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { empresaNav } from '@/lib/nav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCompanyJobs } from '@/lib/companyJobs';
import { jobsApi } from '@/lib/api/jobs.api';
import { getInitials, formatRelativeDate } from '@/lib/utils';
import type { Application, ApplicationStatus } from '@/types/api';

export function EmpresaCandidatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdFilter = searchParams.get('jobId') ?? '';
  const [statusFilter, setStatusFilter] = useState('');

  const jobsQuery = useQuery({
    queryKey: ['company', 'jobs', user?.id],
    queryFn: () => fetchCompanyJobs(user!.id),
    enabled: !!user?.id,
  });

  const appsQuery = useQuery({
    queryKey: ['company', 'all-applications', user?.id, statusFilter, jobsQuery.data],
    queryFn: async () => {
      const jobs = jobsQuery.data ?? [];
      const result: Array<Application & { jobTitle: string }> = [];
      for (const job of jobs) {
        const apps = (await jobsApi.listApplications(
          job.id,
          statusFilter || undefined,
        )) as Application[];
        apps.forEach((a) => result.push({ ...a, jobTitle: job.title }));
      }
      return result;
    },
    enabled: !!jobsQuery.data,
  });

  const applications = (appsQuery.data ?? []).filter(
    (a) => !jobIdFilter || a.jobId === jobIdFilter,
  );

  return (
    <AppShell
      nav={empresaNav}
      subtitle="Empresa"
      primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      title="Candidatos"
      description="Gerencie candidaturas de todos os seus projetos."
    >
      <PageTransition>
        <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Select
            className="sm:w-56"
            value={jobIdFilter}
            onChange={(e) => {
              const v = e.target.value;
              navigate(v ? `/empresa/candidatos?jobId=${v}` : '/empresa/candidatos');
            }}
          >
            <option value="">Todas os projetos</option>
            {(jobsQuery.data ?? []).map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </Select>
          <Select
            className="sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | '')}
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="REVIEWED">Em análise</option>
            <option value="ACCEPTED">Aceita</option>
            <option value="REJECTED">Recusada</option>
            <option value="COMPLETED">Concluída</option>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground">
            {applications.length} candidaturas
          </span>
        </Card>

        {(jobsQuery.isLoading || appsQuery.isLoading) && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {(jobsQuery.isError || appsQuery.isError) && (
          <ErrorState onRetry={() => { jobsQuery.refetch(); appsQuery.refetch(); }} />
        )}
        {!jobsQuery.isLoading && !appsQuery.isLoading && applications.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhuma candidatura"
            description="Publique projetos para começar a receber candidatos."
          />
        )}
        <div className="space-y-3">
          {applications.map((a) => (
            <Link key={a.id} to={`/empresa/candidatos/${a.id}`}>
              <Card className="flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-surface-muted/50">
                <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  {getInitials(a.user?.name ?? '?')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.user?.name ?? 'Candidato'}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.jobTitle} · {formatRelativeDate(a.createdAt)}
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
