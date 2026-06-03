import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Chip, Field, Select, TextArea, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { freelancerNav } from '@/lib/nav';
import { profileApi } from '@/lib/api/profile.api';
import { technologiesApi } from '@/lib/api/technologies.api';
import {
  DEFAULT_JOB_ROLE,
  JOB_ROLE_OTHER_VALUE,
  jobRolesByCategory,
  resolveRoleTitle,
} from '@/lib/jobRoles';
import { normalizePhoneDigits, validateFreelancerProfile } from '@/lib/profileValidation';
import { mapApiErrors } from '@/lib/utils';
import type {
  CreateExperiencePayload,
  Experience,
  PortfolioItem,
  SkillLevel,
  Technology,
} from '@/types/api';

const DEFAULT_SKILL_LEVEL: SkillLevel = 'BASICO';

export function FreelancerProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);

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
      setSelectedTechIds(
        profileQuery.data.techStack?.map((s) => s.technology.id) ?? [],
      );
    }
  }, [profileQuery.data]);

  const handleSave = () => {
    const err = validateFreelancerProfile(bio, phone, selectedTechIds.length);
    if (err) {
      toast.error(err);
      return;
    }
    saveMutation.mutate();
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const phoneDigits = normalizePhoneDigits(phone);
      await profileApi.updateUser({ bio: bio.trim(), phone: phoneDigits });
      const skills = selectedTechIds.map((technologyId) => ({
        technologyId,
        level: DEFAULT_SKILL_LEVEL,
      }));
      await profileApi.updateTechStack(skills);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Perfil atualizado.');
      navigate('/freelancer/perfil');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const profile = profileQuery.data;
  const techs = techQuery.data ?? [];

  const techByCategory = useMemo(() => {
    const groups = new Map<string, Technology[]>();
    for (const t of techs) {
      const cat = t.category ?? 'Outros';
      const list = groups.get(cat) ?? [];
      list.push(t);
      groups.set(cat, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [techs]);

  const toggleTech = (technologyId: string) => {
    setSelectedTechIds((prev) =>
      prev.includes(technologyId)
        ? prev.filter((id) => id !== technologyId)
        : [...prev, technologyId],
    );
  };

  const selectedTechNames = useMemo(() => {
    const idSet = new Set(selectedTechIds);
    return techs.filter((t) => idSet.has(t.id)).map((t) => t.name);
  }, [selectedTechIds, techs]);

  if (profileQuery.isLoading) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Editar perfil" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Editar perfil" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <ErrorState onRetry={() => profileQuery.refetch()} />
      </AppShell>
    );
  }

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title="Editar perfil"
      description="Atualize bio, stack, experiências e portfólio."
      actions={
        <>
          <Link to="/freelancer/perfil">
            <Btn variant="secondary" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Ver perfil
            </Btn>
          </Link>
          <Btn size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-3.5 w-3.5" /> Salvar perfil
          </Btn>
        </>
      }
    >
      <PageTransition>
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-display font-semibold">Dados pessoais</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Para alterar foto de perfil, use{' '}
              <Link to="/freelancer/conta" className="font-medium text-primary hover:underline">
                Configurar conta
              </Link>
              .
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Bio" className="sm:col-span-2" required hint="Mínimo 10 caracteres">
                <TextArea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} required />
              </Field>
              <Field label="Telefone" required hint="10 ou 11 dígitos (com DDD)">
                <TextInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="48999999999"
                  required
                />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold">
              Stack tecnológica <span className="text-destructive">*</span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione ao menos uma tecnologia. As alterações só são gravadas ao clicar em Salvar
              perfil.
            </p>
            {techQuery.isLoading && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-7 w-20 animate-pulse rounded-md bg-surface-muted" />
                ))}
              </div>
            )}
            {techQuery.isError && (
              <div className="mt-4">
                <ErrorState onRetry={() => techQuery.refetch()} />
              </div>
            )}
            {techQuery.isSuccess && techs.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhuma tecnologia disponível no catálogo. Tente recarregar a página.
              </p>
            )}
            {techQuery.isSuccess && techs.length > 0 && (
              <div className="mt-4 space-y-4">
                {techByCategory.map(([category, items]) => (
                  <div key={category}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((t) => {
                        const selected = selectedTechIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTech(t.id)}
                            className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                              selected
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'bg-surface-muted hover:border-primary/40'
                            }`}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedTechNames.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedTechNames.map((name) => (
                  <Chip key={name}>{name}</Chip>
                ))}
              </div>
            )}
          </Card>

          <ExperienceSection
            experiences={profile?.experiences ?? []}
            onChange={() => queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })}
          />
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
  const [rolePreset, setRolePreset] = useState(DEFAULT_JOB_ROLE);
  const [roleCustom, setRoleCustom] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');

  const roleGroups = jobRolesByCategory();

  const add = async () => {
    const roleTitle = resolveRoleTitle(rolePreset, roleCustom);
    if (!roleTitle) {
      toast.error('Informe o cargo.');
      return;
    }
    if (!company.trim()) {
      toast.error('Informe a empresa.');
      return;
    }
    if (!startDate) {
      toast.error('Informe a data de início.');
      return;
    }
    if (!isCurrent && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error('A data final não pode ser anterior à data de início.');
      return;
    }

    try {
      const payload: CreateExperiencePayload = {
        companyName: company.trim(),
        roleTitle,
        startDate: `${startDate}T12:00:00.000Z`,
        description: description.trim() || undefined,
      };
      if (!isCurrent && endDate) {
        payload.endDate = `${endDate}T12:00:00.000Z`;
      }

      await profileApi.createExperience(payload);
      toast.success('Experiência adicionada.');
      setRolePreset(DEFAULT_JOB_ROLE);
      setRoleCustom('');
      setCompany('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      setDescription('');
      onChange();
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      const fieldMsg = Object.values(fields).find(Boolean);
      toast.error(fieldMsg || message);
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
              <p className="font-semibold">{e.roleTitle ?? 'Cargo não informado'}</p>
              <p className="text-xs text-muted-foreground">{e.companyName}</p>
            </div>
            <Btn size="sm" variant="ghost" onClick={() => remove(e.id)}>
              <Trash2 className="h-4 w-4" />
            </Btn>
          </div>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Cargo">
            <Select
              value={rolePreset}
              onChange={(ev) => setRolePreset(ev.target.value)}
            >
              {roleGroups.map((g) => (
                <optgroup key={g.category} label={g.category}>
                  {g.roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={JOB_ROLE_OTHER_VALUE}>Outro (informar abaixo)</option>
            </Select>
          </Field>
          {rolePreset === JOB_ROLE_OTHER_VALUE && (
            <Field label="Cargo personalizado">
              <TextInput
                placeholder="Ex.: Analista de Negócios"
                value={roleCustom}
                onChange={(ev) => setRoleCustom(ev.target.value)}
              />
            </Field>
          )}
          <Field label="Empresa">
            <TextInput
              placeholder="Nome da empresa"
              value={company}
              onChange={(ev) => setCompany(ev.target.value)}
            />
          </Field>
          <Field label="Data de início">
            <TextInput
              type="date"
              value={startDate}
              onChange={(ev) => setStartDate(ev.target.value)}
            />
          </Field>
          <Field label="Data de término">
            <TextInput
              type="date"
              value={endDate}
              disabled={isCurrent}
              onChange={(ev) => setEndDate(ev.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(ev) => {
                setIsCurrent(ev.target.checked);
                if (ev.target.checked) setEndDate('');
              }}
              className="rounded border-input"
            />
            Trabalho atual (sem data de término)
          </label>
        </div>
        <Field label="Descrição">
          <TextArea
            placeholder="Principais responsabilidades e resultados"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            rows={2}
          />
        </Field>
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
