import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, EmptyState } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { TableSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { adminNav } from '@/lib/nav';
import { adminApi } from '@/lib/api/admin.api';
import { formatRelativeDate } from '@/lib/utils';

export function AdminJobsPage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: () => adminApi.listJobs(1, 50),
  });

  const moderateMutation = useMutation({
    mutationFn: (id: string) => adminApi.moderateRemoveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      toast.success('Vaga removida pela moderação.');
    },
    onError: () => toast.error('Erro ao moderar vaga.'),
  });

  const jobs = query.data ?? [];

  return (
    <AppShell
      nav={adminNav}
      subtitle="Admin"
      title="Vagas"
      description="Modere vagas publicadas na plataforma."
      showSearch={false}
    >
      <PageTransition>
        {query.isLoading && <TableSkeleton />}
        {query.isError && <ErrorState onRetry={() => query.refetch()} />}
        {!query.isLoading && jobs.length === 0 && (
          <EmptyState icon={Briefcase} title="Nenhuma vaga" />
        )}
        {!query.isLoading && jobs.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-surface-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Título</th>
                    <th className="px-5 py-3">Empresa</th>
                    <th className="px-5 py-3">Publicada</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b">
                      <td className="px-5 py-3 font-medium">{j.title}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {j.company?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatRelativeDate(j.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <JobStatusBadge status={j.status} />
                      </td>
                      <td className="px-5 py-3">
                        <Btn
                          size="sm"
                          variant="danger"
                          onClick={() => moderateMutation.mutate(j.id)}
                          disabled={moderateMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remover
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </PageTransition>
    </AppShell>
  );
}
