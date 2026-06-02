import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, EmptyState, Select } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { TableSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { adminNav } from '@/lib/nav';
import { adminApi } from '@/lib/api/admin.api';
import { formatRelativeDate } from '@/lib/utils';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'user' | 'company'>('user');

  const query = useQuery({
    queryKey: ['admin', 'users', type],
    queryFn: () => adminApi.listUsers({ type, limit: 50 }),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      blocked ? adminApi.unblockUser(id, type) : adminApi.blockUser(id, type),
    onSuccess: (_, { blocked }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(blocked ? 'Usuário desbloqueado.' : 'Usuário bloqueado.');
    },
    onError: () => toast.error('Erro na operação.'),
  });

  const users = query.data ?? [];

  return (
    <AppShell
      nav={adminNav}
      subtitle="Admin"
      title="Usuários"
      description="Gerencie freelancers e empresas da plataforma."
      showSearch={false}
    >
      <PageTransition>
        <Card className="mb-5 p-4">
          <Select
            className="sm:w-48"
            value={type}
            onChange={(e) => setType(e.target.value as 'user' | 'company')}
          >
            <option value="user">Freelancers</option>
            <option value="company">Empresas</option>
          </Select>
        </Card>

        {query.isLoading && <TableSkeleton />}
        {query.isError && <ErrorState onRetry={() => query.refetch()} />}
        {!query.isLoading && users.length === 0 && (
          <EmptyState icon={Users} title="Nenhum usuário" />
        )}
        {!query.isLoading && users.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-surface-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Nome</th>
                    <th className="px-5 py-3">E-mail</th>
                    <th className="px-5 py-3">Cadastro</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="px-5 py-3 font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatRelativeDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            u.isBlocked
                              ? 'text-destructive font-medium'
                              : 'text-success font-medium'
                          }
                        >
                          {u.isBlocked ? 'Bloqueado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Btn
                          size="sm"
                          variant={u.isBlocked ? 'secondary' : 'danger'}
                          onClick={() =>
                            blockMutation.mutate({ id: u.id, blocked: u.isBlocked })
                          }
                          disabled={blockMutation.isPending}
                        >
                          {u.isBlocked ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" /> Desbloquear
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" /> Bloquear
                            </>
                          )}
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
