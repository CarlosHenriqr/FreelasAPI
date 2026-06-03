import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Users,
  RefreshCw,
  Star,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { AppShell } from '@/components/taskio/AppShell';
import { Badge, Btn, Card, StatCard } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { empresaNav } from '@/lib/nav';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCompanyJobs } from '@/lib/companyJobs';
import { jobsApi } from '@/lib/api/jobs.api';
import { matchingApi } from '@/lib/api/matching.api';
import { getInitials, formatRelativeDate } from '@/lib/utils';
import type { Application, Job } from '@/types/api';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function buildChartData(applications: Application[]) {
  const counts = new Array(7).fill(0);
  const now = new Date();
  applications.forEach((a) => {
    const d = new Date(a.createdAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) {
      counts[6 - diffDays]++;
    }
  });
  return DAYS.map((day, i) => ({ day, candidatos: counts[i], propostas: Math.max(0, Math.floor(counts[i] * 0.6)) }));
}

export function EmpresaDashboardPage() {
  const { user } = useAuth();

  const jobsQuery = useQuery({
    queryKey: ['company', 'jobs', user?.id],
    queryFn: () => fetchCompanyJobs(user!.id),
    enabled: !!user?.id,
  });

  const appsQuery = useQuery({
    queryKey: ['company', 'applications', user?.id, jobsQuery.data?.map((j) => j.id)],
    queryFn: async () => {
      const jobs = jobsQuery.data ?? [];
      const all: Application[] = [];
      for (const job of jobs) {
        const apps = (await jobsApi.listApplications(job.id)) as Application[];
        all.push(...apps);
      }
      return all;
    },
    enabled: !!jobsQuery.data?.length,
  });

  const firstJobId = jobsQuery.data?.[0]?.id;
  const candidatesQuery = useQuery({
    queryKey: ['matching', 'candidates', firstJobId],
    queryFn: () => matchingApi.recommendedCandidates(firstJobId!, 4),
    enabled: !!firstJobId,
  });

  const jobs = jobsQuery.data ?? [];
  const applications = appsQuery.data ?? [];
  const openJobs = jobs.filter((j) => j.status === 'OPEN').length;
  const inProgress = applications.filter((a) => a.status === 'ACCEPTED').length;
  const chartData = buildChartData(applications);
  const isLoading = jobsQuery.isLoading;
  const isError = jobsQuery.isError;

  const content = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ErrorState
          description="Não foi possível carregar o dashboard."
          onRetry={() => jobsQuery.refetch()}
        />
      );
    }
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Projetos publicados" value={jobs.length} icon={Briefcase} />
          <StatCard
            label="Candidatos recebidos"
            value={applications.length}
            icon={Users}
          />
          <StatCard
            label="Em andamento"
            value={inProgress}
            delta={openJobs > 0 ? `${openJobs} vagas abertas` : undefined}
            deltaTone="neutral"
            icon={RefreshCw}
          />
          <StatCard label="Vagas abertas" value={openJobs} deltaTone="neutral" icon={Star} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight">Atividade da semana</h2>
                <p className="text-sm text-muted-foreground">Candidaturas recebidas.</p>
              </div>
            </div>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.52 0.14 175)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="oklch(0.52 0.14 175)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.925 0.008 80)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="oklch(0.52 0.02 80)"
                    fontSize={11}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.52 0.02 80)"
                    fontSize={11}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 6,
                      border: '1px solid oklch(0.925 0.008 80)',
                      fontSize: 12,
                      fontFamily: 'Plus Jakarta Sans',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="candidatos"
                    stroke="oklch(0.52 0.14 175)"
                    strokeWidth={2}
                    fill="url(#c1)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight">Projetos recentes</h2>
              <Link to="/empresa/projetos" className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary link-underline">
                Ver todas
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {jobs.slice(0, 3).map((p: Job) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between rounded-md border bg-surface p-3 transition-colors duration-150 hover:bg-surface-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {formatRelativeDate(p.createdAt)} &middot; {p._count?.applications ?? 0}{' '}
                      candidatos
                    </p>
                  </div>
                  <JobStatusBadge status={p.status} />
                </div>
              ))}
              {jobs.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum projeto publicado ainda.</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">Candidatos recomendados</h2>
              <p className="text-sm text-muted-foreground">
                Top matches gerados pelo motor de compatibilidade.
              </p>
            </div>
            <Link to="/empresa/candidatos" className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary link-underline">
              Ver todos
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(candidatesQuery.data ?? []).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-md border bg-surface p-4 transition-all duration-150 hover:bg-surface-muted/50"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                  {getInitials(c.user?.name ?? '?')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{c.user?.name ?? 'Candidato'}</p>
                    {c.matchPercent !== undefined && (
                      <Badge tone="success">{c.matchPercent}% match</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.job?.title}</p>
                </div>
                <Link to={`/empresa/candidatos/${c.id}`}>
                  <Btn size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Btn>
                </Link>
              </div>
            ))}
            {!candidatesQuery.data?.length && (
              <p className="col-span-2 text-sm text-muted-foreground">
                Publique um projeto para ver recomendações de candidatos.
              </p>
            )}
          </div>
        </Card>
      </>
    );
  };

  return (
    <AppShell
      nav={empresaNav}
      subtitle="Empresa"
      primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      title="Dashboard"
      description="Acompanhe o pulso dos seus projetos e candidaturas."
      actions={
        <Btn size="sm" variant="secondary" onClick={() => jobsQuery.refetch()}>
          <ArrowUpRight className="h-3.5 w-3.5" /> Atualizar
        </Btn>
      }
    >
      <PageTransition>{content()}</PageTransition>
    </AppShell>
  );
}
