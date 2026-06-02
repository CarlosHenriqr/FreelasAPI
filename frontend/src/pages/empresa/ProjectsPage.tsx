import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, FilePlus2, Users, Pause, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, EmptyState, Select, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { empresaNav } from '@/lib/nav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCompanyJobs } from '@/lib/companyJobs';
import { jobsApi } from '@/lib/api/jobs.api';
import { formatRelativeDate } from '@/lib/utils';
import type { JobStatus } from '@/types/api';

export function EmpresaProjectsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchInit = searchParams.get('search') ?? '';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(searchInit);
  const [statusFilter, setStatusFilter] = useState('');

  const jobsQuery = useQuery({
    queryKey: ['company', 'jobs', user?.id],
    queryFn: () => fetchCompanyJobs(user!.id),
    enabled: !!user?.id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      jobsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'jobs'] });
      toast.success('Status atualizado.');
    },
    onError: () => toast.error('Erro ao atualizar status.'),
  });

  const jobs = (jobsQuery.data ?? []).filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppShell
      nav={empresaNav}
      subtitle="Empresa"
      primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      title="Meus projetos"
      description="Acompanhe status, candidatos e orçamentos."
      actions={
        <Link to="/empresa/publicar">
          <Btn size="sm">
            <FilePlus2 className="h-3.5 w-3.5" /> Novo projeto
          </Btn>
        </Link>
      }
    >
      <PageTransition>
        <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <TextInput
            placeholder="Buscar por título, stack..."
            className="sm:max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="OPEN">Aberta</option>
            <option value="PAUSED">Pausada</option>
            <option value="CLOSED">Encerrada</option>
            <option value="CANCELLED">Cancelada</option>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground">{jobs.length} projetos</span>
        </Card>

        {jobsQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {jobsQuery.isError && (
          <ErrorState onRetry={() => jobsQuery.refetch()} />
        )}
        {!jobsQuery.isLoading && !jobsQuery.isError && jobs.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhum projeto publicado"
            description="Crie sua primeira vaga e receba candidatos compatíveis em minutos."
            action={
              <Link to="/empresa/publicar">
                <Btn>Publicar projeto</Btn>
              </Link>
            }
          />
        )}
        {!jobsQuery.isLoading && jobs.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map((p) => {
              const stack = p.technologies?.map((t) => t.technology.name) ?? [];
              return (
                <Card
                  key={p.id}
                  className="flex flex-col p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <JobStatusBadge status={p.status} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeDate(p.createdAt)}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {stack.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-md border bg-surface-muted px-2 py-0.5 text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Candidatos
                      </p>
                      <p className="text-sm font-semibold">{p._count?.applications ?? 0}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Link to={`/empresa/candidatos?jobId=${p.id}`}>
                        <Btn size="sm" variant="secondary">
                          <Users className="h-3.5 w-3.5" />
                          {p._count?.applications ?? 0}
                        </Btn>
                      </Link>
                      {p.status === 'OPEN' && (
                        <Btn
                          size="sm"
                          variant="secondary"
                          onClick={() => statusMutation.mutate({ id: p.id, status: 'PAUSED' })}
                          title="Pausar"
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </Btn>
                      )}
                      {p.status !== 'CLOSED' && p.status !== 'CANCELLED' && (
                        <Btn
                          size="sm"
                          variant="ghost"
                          onClick={() => statusMutation.mutate({ id: p.id, status: 'CLOSED' })}
                          title="Encerrar"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Btn>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageTransition>
    </AppShell>
  );
}