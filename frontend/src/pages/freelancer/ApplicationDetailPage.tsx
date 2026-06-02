import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Star } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Field, TextArea } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { freelancerNav } from '@/lib/nav';
import { applicationsApi } from '@/lib/api/applications.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { formatRelativeDate, mapApiErrors } from '@/lib/utils';

export function FreelancerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const appsQuery = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsApi.myApplications(),
  });

  const application = appsQuery.data?.find((a) => a.id === id);

  const cancelMutation = useMutation({
    mutationFn: () => applicationsApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Candidatura cancelada.');
      appsQuery.refetch();
    },
    onError: () => toast.error('Erro ao cancelar candidatura.'),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        applicationId: id!,
        rating,
        comment: comment || undefined,
      }),
    onSuccess: () => {
      toast.success('Avaliação enviada!');
      setComment('');
    },
    onError: (err) => {
      const { message } = mapApiErrors(err);
      toast.error(message);
    },
  });

  if (appsQuery.isLoading) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Trabalho" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (!application) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Trabalho" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <ErrorState title="Candidatura não encontrada" onRetry={() => appsQuery.refetch()} />
      </AppShell>
    );
  }

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title={application.job?.title ?? 'Candidatura'}
      description={application.job?.company?.name}
      actions={
        <Link to="/freelancer/trabalhos">
          <Btn variant="secondary" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Btn>
        </Link>
      }
    >
      <PageTransition>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <ApplicationStatusBadge status={application.status} />
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(application.createdAt)}
              </span>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">{application.job?.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
              {application.job?.description}
            </p>
            {application.coverLetter && (
              <>
                <h3 className="mt-6 font-semibold">Sua carta de apresentação</h3>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </>
            )}
            {application.status === 'PENDING' && (
              <Btn
                className="mt-6"
                variant="danger"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                Cancelar candidatura
              </Btn>
            )}
          </Card>

          {application.status === 'COMPLETED' && (
            <Card className="p-6">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" /> Avaliar empresa
              </h3>
              <form
                className="mt-4 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  reviewMutation.mutate();
                }}
              >
                <Field label="Nota (1-5)">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                  />
                </Field>
                <Field label="Comentário">
                  <TextArea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Como foi trabalhar neste projeto?"
                  />
                </Field>
                <Btn type="submit" disabled={reviewMutation.isPending}>
                  Enviar avaliação
                </Btn>
              </form>
            </Card>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
