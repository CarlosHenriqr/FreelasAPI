import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, RefreshCw, Sparkles, Star, ArrowUpRight } from 'lucide-react';
import {
  Bar,
  BarChart,
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
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { freelancerNav } from '@/lib/nav';
import { applicationsApi } from '@/lib/api/applications.api';
import { matchingApi } from '@/lib/api/matching.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { formatRelativeDate } from '@/lib/utils';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function buildChartData(apps: { createdAt: string }[]) {
  const counts = new Array(7).fill(0);
  const now = new Date();
  apps.forEach((a) => {
    const diffDays = Math.floor((now.getTime() - new Date(a.createdAt).getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) counts[6 - diffDays]++;
  });
  return DAYS.map((day, i) => ({ day, propostas: counts[i] }));
}

export function FreelancerDashboardPage() {
  const appsQuery = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsApi.myApplications(),
  });

  const recommendedQuery = useQuery({
    queryKey: ['matching', 'jobs', 5],
    queryFn: () => matchingApi.recommendedJobs(5),
  });

  const reviewsQuery = useQuery({
    queryKey: ['reviews', 'summary'],
    queryFn: () => reviewsApi.summary(),
  });

  const apps = appsQuery.data ?? [];
  const inProgress = apps.filter((a) => a.status === 'ACCEPTED').length;
  const chartData = buildChartData(apps);
  const rating = reviewsQuery.data?.averageRating?.toFixed(1) ?? '—';

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title="Dashboard"
      description="Acompanhe candidaturas, propostas e ganhos."
      actions={
        <Link to="/freelancer/perfil/editar">
          <Btn size="sm">
            <ArrowUpRight className="h-3.5 w-3.5" /> Atualizar perfil
          </Btn>
        </Link>
      }
    >
      <PageTransition>
        {appsQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {appsQuery.isError && <ErrorState onRetry={() => appsQuery.refetch()} />}
        {!appsQuery.isLoading && !appsQuery.isError && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Candidaturas enviadas" value={apps.length} icon={Briefcase} />
              <StatCard
                label="Serviços em andamento"
                value={inProgress}
                deltaTone="neutral"
                icon={RefreshCw}
              />
              <StatCard
                label="Projetos recomendados"
                value={recommendedQuery.data?.length ?? 0}
                icon={Sparkles}
              />
              <StatCard
                label="Avaliação média"
                value={rating}
                delta={
                  reviewsQuery.data
                    ? `${reviewsQuery.data.totalReviews} reviews`
                    : undefined
                }
                deltaTone="neutral"
                icon={Star}
              />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold tracking-tight">Atividade da semana</h2>
                <p className="text-sm text-muted-foreground">Candidaturas enviadas.</p>
                <div className="mt-4 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="oklch(0.925 0.008 80)" vertical={false} />
                      <XAxis dataKey="day" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 6,
                          border: '1px solid oklch(0.925 0.008 80)',
                          fontSize: 12,
                          fontFamily: 'Plus Jakarta Sans',
                        }}
                      />
                      <Bar dataKey="propostas" fill="oklch(0.52 0.14 175)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold tracking-tight">Vagas recomendadas</h2>
                  <Link
                    to="/freelancer/recomendadas"
                    className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary link-underline"
                  >
                    Ver todas
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  {(recommendedQuery.data ?? []).slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      to={`/freelancer/vagas/${p.id}`}
                      className="block rounded-md border bg-surface p-4 transition-all duration-150 hover:bg-surface-muted/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold leading-tight">{p.title}</p>
                        {p.matchPercent !== undefined && (
                          <Badge tone="success">{p.matchPercent}% compatível</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.company?.name}</p>
                    </Link>
                  ))}
                  {!recommendedQuery.data?.length && (
                    <p className="text-sm text-muted-foreground">
                      Complete seu perfil para receber recomendações.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <Card className="mt-6 overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <h2 className="font-display text-lg font-semibold tracking-tight">Candidaturas recentes</h2>
                <Link
                  to="/freelancer/trabalhos"
                  className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary link-underline"
                >
                  Ver todas
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t bg-muted/40 text-left">
                      <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Projeto</th>
                      <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Empresa</th>
                      <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Data</th>
                      <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.slice(0, 5).map((a) => (
                      <tr key={a.id} className="border-t transition-colors hover:bg-muted/20">
                        <td className="px-5 py-3 font-medium">
                          <Link
                            to={`/freelancer/trabalhos/${a.id}`}
                            className="link-underline hover:text-primary"
                          >
                            {a.job?.title ?? '—'}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {a.job?.company?.name ?? '—'}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                          {formatRelativeDate(a.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <ApplicationStatusBadge status={a.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {apps.length === 0 && (
                  <p className="p-5 text-sm text-muted-foreground">Nenhuma candidatura ainda.</p>
                )}
              </div>
            </Card>
          </>
        )}
      </PageTransition>
    </AppShell>
  );
}
