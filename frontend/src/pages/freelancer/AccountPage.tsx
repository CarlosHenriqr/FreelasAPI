import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { AvatarUpload } from '@/components/taskio/AvatarUpload';
import { Btn, Card, Field, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { freelancerNav } from '@/lib/nav';
import { profileApi } from '@/lib/api/profile.api';
import { isValidPhone, normalizePhoneDigits } from '@/lib/profileValidation';
import { mapApiErrors } from '@/lib/utils';

export function FreelancerAccountPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.me(),
  });

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name ?? '');
      setPhone(profileQuery.data.phone ?? '');
    }
  }, [profileQuery.data]);

  const saveProfileMutation = useMutation({
    mutationFn: () =>
      profileApi.updateUser({ name, phone: normalizePhoneDigits(phone) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Dados da conta atualizados.');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const passwordMutation = useMutation({
    mutationFn: () => profileApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Senha alterada com sucesso.');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    passwordMutation.mutate();
  };

  if (profileQuery.isLoading) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Configurar conta">
        <PageLoader />
      </AppShell>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Configurar conta">
        <ErrorState onRetry={() => profileQuery.refetch()} />
      </AppShell>
    );
  }

  const profile = profileQuery.data!;

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      title="Configurar conta"
      description="Gerencie seus dados de acesso e segurança."
    >
      <PageTransition>
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="p-6">
            <h3 className="font-display font-semibold">Foto e identidade</h3>
            <div className="mt-4">
              <AvatarUpload
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                onUpload={async (file) => {
                  const data = await profileApi.uploadUserAvatar(file);
                  await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
                  return data;
                }}
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Nome">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="E-mail">
                <TextInput value={profile.email ?? ''} disabled />
              </Field>
              <Field label="Telefone" className="sm:col-span-2" required hint="10 ou 11 dígitos (com DDD)">
                <TextInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="48999999999"
                  required
                />
              </Field>
            </div>
            <Btn
              className="mt-4"
              size="sm"
              onClick={() => {
                if (!isValidPhone(phone)) {
                  toast.error('Informe um telefone válido (10 ou 11 dígitos).');
                  return;
                }
                saveProfileMutation.mutate();
              }}
              disabled={saveProfileMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" /> Salvar dados
            </Btn>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold">Segurança</h3>
            <p className="mt-1 text-sm text-muted-foreground">Altere sua senha de acesso.</p>
            <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
              <Field label="Senha atual">
                <TextInput
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Field>
              <Field label="Nova senha" hint="Mínimo 8 caracteres">
                <TextInput
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field>
              <Field label="Confirmar nova senha">
                <TextInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>
              <Btn type="submit" size="sm" disabled={passwordMutation.isPending}>
                <Lock className="h-3.5 w-3.5" /> Alterar senha
              </Btn>
            </form>
          </Card>
        </div>
      </PageTransition>
    </AppShell>
  );
}
