import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Clock, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Field, TextArea } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { freelancerNav } from '@/lib/nav';
import { jobsApi } from '@/lib/api/jobs.api';
import { mapApiErrors, formatRelativeDate } from '@/lib/utils';

export function FreelancerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const jobQuery = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () => jobsApi.apply(id!, { coverLetter: coverLetter || undefined }),
    onSuccess: () => {
      toast.success('Candidatura enviada com sucesso!');
      navigate('/freelancer/trabalhos');
    },
    onError: (err) => {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    },
  });

  const job = jobQuery.data;

  if (jobQuery.isLoading) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Vaga" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (jobQuery.isError || !job) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Vaga" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <ErrorState onRetry={() => jobQuery.refetch()} />
      </AppShell>
    );
  }

  const stack = job.technologies ?? [];

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title={job.title}
      description={job.company?.name}
      actions={
        <Link to="/freelancer/vagas">
          <Btn variant="secondary" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Btn>
        </Link>
      }
    >
      <PageTransition>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job.company?.name ?? 'Empresa'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatRelativeDate(job.createdAt)}
                </span>
                <JobStatusBadge status={job.status} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
              {job.requirements && (
                <>
                  <h3 className="mt-6 font-display font-semibold">Requisitos</h3>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {stack.map((t) => (
                  <span
                    key={t.technology.id}
                    className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                      t.type === 'REQUIRED' ? 'border-primary/30 bg-primary/5' : ''
                    }`}
                  >
                    {t.technology.name}
                    {t.type === 'REQUIRED' ? ' *' : ''}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <aside>
            {job.status === 'OPEN' && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Candidatar-se</h3>
                <form
                  className="mt-4 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyMutation.mutate();
                  }}
                >
                  <Field label="Carta de apresentação" error={errors.coverLetter}>
                    <TextArea
                      placeholder="Conte por que você é ideal para este projeto..."
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </Field>
                  <Btn className="w-full" type="submit" disabled={applyMutation.isPending}>
                    {applyMutation.isPending ? 'Enviando...' : 'Enviar candidatura'}
                  </Btn>
                </form>
              </Card>
            )}
            {job.status !== 'OPEN' && (
              <Card className="p-6 text-sm text-muted-foreground">
                Esta vaga não está aceitando candidaturas no momento.
              </Card>
            )}
          </aside>
        </div>
      </PageTransition>
    </AppShell>
  );
}
