import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Chip, Field, TextArea, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { freelancerNav } from '@/lib/nav';
import { profileApi } from '@/lib/api/profile.api';
import { technologiesApi } from '@/lib/api/technologies.api';
import { mapApiErrors, SKILL_LEVEL_LABELS } from '@/lib/utils';
import type { Experience, PortfolioItem, SkillLevel } from '@/types/api';

export function FreelancerProfilePage() {
  const queryClient = useQueryClient();
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.me(),
  });

  const techQuery = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.list(),
  });

  useEffect(() => {
    if (profileQuery.data) {
      setBio(profileQuery.data.bio ?? '');
      setPhone(profileQuery.data.phone ?? '');
      setAvatarUrl(profileQuery.data.avatarUrl ?? '');
    }
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () => profileApi.updateUser({ bio, phone, avatarUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Perfil atualizado.');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const profile = profileQuery.data;
  const techs = techQuery.data ?? [];

  const handleTechToggle = async (technologyId: string, level: SkillLevel) => {
    const current = profile?.techStack ?? [];
    const exists = current.find((s) => s.technology.id === technologyId);
    const skills = exists
      ? current
          .filter((s) => s.technology.id !== technologyId)
          .map((s) => ({ technologyId: s.technology.id, level: s.level }))
      : [
          ...current.map((s) => ({ technologyId: s.technology.id, level: s.level })),
          { technologyId, level },
        ];
    try {
      await profileApi.updateTechStack(skills);
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Stack atualizada.');
    } catch (err) {
      toast.error(mapApiErrors(err).message);
    }
  };

  if (profileQuery.isLoading) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Meu currículo" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Meu currículo" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <ErrorState onRetry={() => profileQuery.refetch()} />
      </AppShell>
    );
  }

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title="Meu currículo"
      description="Mantenha seu perfil técnico atualizado para melhores matches."
      actions={
        <Btn size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
          <Save className="h-3.5 w-3.5" /> Salvar perfil
        </Btn>
      }
    >
      <PageTransition>
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-display font-semibold">Dados pessoais</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Bio">
                <TextArea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
              </Field>
              <div className="space-y-4">
                <Field label="Telefone">
                  <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
                <Field label="URL do avatar">
                  <TextInput value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
                </Field>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold">Stack tecnológica</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em uma tecnologia para adicionar com nível intermediário.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {techs.map((t) => {
                const inStack = profile?.techStack?.find((s) => s.technology.id === t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTechToggle(t.id, 'INTERMEDIARIO')}
                    className={`rounded-md border px-2 py-1 text-xs font-medium ${
                      inStack ? 'border-primary bg-primary/10 text-primary' : 'bg-surface-muted'
                    }`}
                  >
                    {t.name}
                    {inStack && ` · ${SKILL_LEVEL_LABELS[inStack.level]}`}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile?.techStack?.map((s) => (
                <Chip key={s.technology.id}>{s.technology.name}</Chip>
              ))}
            </div>
          </Card>

          <ExperienceSection experiences={profile?.experiences ?? []} onChange={() => profileQuery.refetch()} />
          <PortfolioSection items={profile?.portfolio ?? []} onChange={() => profileQuery.refetch()} />
        </div>
      </PageTransition>
    </AppShell>
  );
}

function ExperienceSection({
  experiences,
  onChange,
}: {
  experiences: Experience[];
  onChange: () => void;
}) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');

  const add = async () => {
    try {
      await profileApi.createExperience({
        title,
        company,
        startDate: new Date(startDate).toISOString(),
        description,
        current: false,
      });
      toast.success('Experiência adicionada.');
      setTitle('');
      setCompany('');
      setStartDate('');
      setDescription('');
      onChange();
    } catch (err) {
      toast.error(mapApiErrors(err).message);
    }
  };

  const remove = async (id: string) => {
    try {
      await profileApi.deleteExperience(id);
      toast.success('Experiência removida.');
      onChange();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold">Experiências</h3>
      <div className="mt-4 space-y-4">
        {experiences.map((e) => (
          <div key={e.id} className="flex items-start justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.company}</p>
            </div>
            <Btn size="sm" variant="ghost" onClick={() => remove(e.id)}>
              <Trash2 className="h-4 w-4" />
            </Btn>
          </div>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput placeholder="Cargo" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextInput placeholder="Empresa" value={company} onChange={(e) => setCompany(e.target.value)} />
          <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <TextArea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <Btn size="sm" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar experiência
        </Btn>
      </div>
    </Card>
  );
}

function PortfolioSection({
  items,
  onChange,
}: {
  items: PortfolioItem[];
  onChange: () => void;
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const add = async () => {
    try {
      await profileApi.createPortfolio({ title, url, description });
      toast.success('Item adicionado ao portfólio.');
      setTitle('');
      setUrl('');
      setDescription('');
      onChange();
    } catch (err) {
      toast.error(mapApiErrors(err).message);
    }
  };

  const remove = async (id: string) => {
    try {
      await profileApi.deletePortfolio(id);
      toast.success('Item removido.');
      onChange();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold">Portfólio</h3>
      <div className="mt-4 space-y-4">
        {items.map((p) => (
          <div key={p.id} className="flex items-start justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{p.title}</p>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-primary">
                  {p.url}
                </a>
              )}
            </div>
            <Btn size="sm" variant="ghost" onClick={() => remove(p.id)}>
              <Trash2 className="h-4 w-4" />
            </Btn>
          </div>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextInput placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <TextArea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <Btn size="sm" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar ao portfólio
        </Btn>
      </div>
    </Card>
  );
}
