import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Select } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { empresaNav } from '@/lib/nav';
import { useAuth } from '@/contexts/AuthContext';
import { findCompanyApplication } from '@/lib/companyJobs';
import { applicationsApi } from '@/lib/api/applications.api';
import { profileApi } from '@/lib/api/profile.api';
import { getInitials, formatRelativeDate } from '@/lib/utils';
import type { ApplicationStatus } from '@/types/api';

export function EmpresaCandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ['company', 'application', id],
    queryFn: () => findCompanyApplication(user!.id, id!),
    enabled: !!user?.id && !!id,
  });

  const application = detailQuery.data?.application;
  const job = detailQuery.data?.job;

  const profileQuery = useQuery({
    queryKey: ['profile', 'public', application?.userId],
    queryFn: () => profileApi.getPublicUser(application!.userId),
    enabled: !!application?.userId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) =>
      applicationsApi.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Status atualizado.');
      detailQuery.refetch();
    },
    onError: () => toast.error('Erro ao atualizar status.'),
  });

  if (detailQuery.isLoading) {
    return (
      <AppShell nav={empresaNav} subtitle="Empresa" title="Candidato" primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (detailQuery.isError || !application) {
    return (
      <AppShell nav={empresaNav} subtitle="Empresa" title="Candidato" primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}>
        <ErrorState title="Candidatura não encontrada" onRetry={() => detailQuery.refetch()} />
      </AppShell>
    );
  }

  const profile = profileQuery.data;

  return (
    <AppShell
      nav={empresaNav}
      subtitle="Empresa"
      primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      title="Perfil do candidato"
      actions={
        <>
          <Link to="/empresa/candidatos">
            <Btn variant="secondary" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </Btn>
          </Link>
          <Select
            className="h-9 w-44"
            value={application.status}
            onChange={(e) => statusMutation.mutate(e.target.value as ApplicationStatus)}
          >
            <option value="REVIEWED">Em análise</option>
            <option value="ACCEPTED">Aceitar</option>
            <option value="REJECTED">Recusar</option>
            <option value="COMPLETED">Concluir</option>
          </Select>
        </>
      }
    >
      <PageTransition>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid h-20 w-20 place-items-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                  {getInitials(application.user?.name ?? '?')}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl font-bold tracking-tight">
                      {application.user?.name ?? 'Candidato'}
                    </h2>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{job?.title}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {application.user?.email}
                    </span>
                    <span>Candidatura {formatRelativeDate(application.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {application.coverLetter && (
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">Carta de apresentação</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </Card>
            )}

            {profile?.bio && (
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">Sobre</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              </Card>
            )}

            {profile?.experiences && profile.experiences.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">Experiência profissional</h3>
                <ol className="mt-4 space-y-5 border-l-2 border-border pl-5">
                  {profile.experiences.map((e) => (
                    <li key={e.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-primary" />
                      <p className="font-display font-semibold">
                        {e.roleTitle ?? 'Cargo não informado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.companyName} ·{' '}
                        {new Date(e.startDate).getFullYear()}
                        {e.endDate ? ` — ${new Date(e.endDate).getFullYear()}` : ' — Presente'}
                      </p>
                      {e.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground">{e.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </div>

          <aside className="space-y-5">
            <Card className="p-6">
              <h3 className="font-display font-semibold">Vaga</h3>
              <p className="mt-2 font-medium">{job?.title}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-4">{job?.description}</p>
            </Card>
            {profile?.techStack && profile.techStack.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Stack</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.techStack.map((s) => (
                    <span
                      key={s.technology.id}
                      className="rounded-md border bg-surface-muted px-2 py-0.5 text-xs font-medium"
                    >
                      {s.technology.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}
            {profile?.portfolio && profile.portfolio.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Portfólio</h3>
                <div className="mt-3 space-y-2">
                  {profile.portfolio.map((p) => (
                    <div key={p.id} className="rounded-lg border p-3">
                      <p className="font-semibold text-sm">{p.title}</p>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Ver projeto
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </PageTransition>
    </AppShell>
  );
}
