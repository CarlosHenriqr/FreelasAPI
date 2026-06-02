import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, EmptyState } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { empresaNav } from '@/lib/nav';
import { notificationsApi } from '@/lib/api/notifications.api';
import { formatRelativeDate } from '@/lib/utils';

export function EmpresaNotificationsPage() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Notificação marcada como lida.');
    },
    onError: () => toast.error('Erro ao marcar notificação.'),
  });

  const notifications = listQuery.data ?? [];

  return (
    <AppShell
      nav={empresaNav}
      subtitle="Empresa"
      primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      title="Notificações"
      description="Acompanhe atualizações de candidaturas e projetos."
    >
      <PageTransition>
        {listQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {listQuery.isError && <ErrorState onRetry={() => listQuery.refetch()} />}
        {!listQuery.isLoading && notifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title="Nenhuma notificação"
            description="Você será avisado quando houver novidades."
          />
        )}
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start justify-between gap-4 p-4 ${!n.read ? 'border-primary/30 bg-primary/5' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatRelativeDate(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <Btn
                  size="sm"
                  variant="secondary"
                  onClick={() => markReadMutation.mutate(n.id)}
                  disabled={markReadMutation.isPending}
                >
                  Marcar lida
                </Btn>
              )}
            </Card>
          ))}
        </div>
      </PageTransition>
    </AppShell>
  );
}
