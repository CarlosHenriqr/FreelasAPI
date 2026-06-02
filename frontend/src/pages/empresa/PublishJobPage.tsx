import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Info, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Chip, Field, TextArea, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { empresaNav } from '@/lib/nav';
import { jobsApi } from '@/lib/api/jobs.api';
import { technologiesApi } from '@/lib/api/technologies.api';
import { mapApiErrors } from '@/lib/utils';
import type { Technology } from '@/types/api';

export function EmpresaPublishPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [requiredIds, setRequiredIds] = useState<string[]>([]);
  const [desirableIds, setDesirableIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const techQuery = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      jobsApi.create({
        title,
        description,
        requirements: requirements || undefined,
        deadline: new Date(deadline).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        requiredTechnologyIds: requiredIds,
        desirableTechnologyIds: desirableIds,
      }),
    onSuccess: () => {
      toast.success('Vaga publicada com sucesso!');
      navigate('/empresa/projetos');
    },
    onError: (err) => {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    },
  });

  const techs = techQuery.data ?? [];

  const toggleTech = (id: string, type: 'required' | 'desirable') => {
    if (type === 'required') {
      setRequiredIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
      setDesirableIds((prev) => prev.filter((x) => x !== id));
    } else {
      setDesirableIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
      setRequiredIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const selectedTechs = (ids: string[]) =>
    ids.map((id) => techs.find((t) => t.id === id)).filter(Boolean) as Technology[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  if (techQuery.isLoading) return <PageLoader />;

  return (
    <AppShell
      nav={empresaNav}
      subtitle="Empresa"
      primaryAction={{ label: 'Novo projeto', to: '/empresa/publicar' }}
      title="Publicar projeto"
      description="Defina escopo e requisitos para receber candidatos compatíveis."
      actions={
        <>
          <Link to="/empresa/projetos">
            <Btn variant="secondary" size="sm">
              Cancelar
            </Btn>
          </Link>
          <Btn
            size="sm"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            Publicar projeto <ArrowRight className="h-3.5 w-3.5" />
          </Btn>
        </>
      }
    >
      <PageTransition>
        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <Card className="flex gap-3 border-primary/20 bg-primary/5 p-4 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">Publicação otimizada</p>
                <p className="mt-0.5 text-muted-foreground">
                  Quanto mais detalhada a descrição, melhor o match algorítmico.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Informações principais</h3>
              <div className="mt-4 grid gap-4">
                <Field label="Título da vaga" error={errors.title}>
                  <TextInput
                    placeholder="Ex: Engenheiro de Software Sênior (React/Node)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Prazo de entrega" error={errors.deadline}>
                    <TextInput
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Data de expiração" error={errors.expiresAt}>
                    <TextInput
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <Field label="Stack tecnológica (obrigatória)" hint="Clique para marcar como obrigatória">
                  <div className="flex flex-wrap gap-2">
                    {techs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTech(t.id, 'required')}
                        className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                          requiredIds.includes(t.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'bg-surface-muted hover:bg-accent'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedTechs(requiredIds).map((t) => (
                      <Chip key={t.id} onRemove={() => toggleTech(t.id, 'required')}>
                        {t.name}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field label="Stack desejável">
                  <div className="flex flex-wrap gap-2">
                    {techs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTech(t.id, 'desirable')}
                        className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                          desirableIds.includes(t.id)
                            ? 'border-info bg-info/10 text-info'
                            : 'bg-surface-muted hover:bg-accent'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Descrição & requisitos</h3>
              <div className="mt-4 grid gap-4">
                <Field label="Descrição da vaga" error={errors.description}>
                  <TextArea
                    placeholder="Descreva contexto, desafios técnicos e expectativas..."
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Requisitos e diferenciais" error={errors.requirements}>
                  <TextArea
                    placeholder="Habilidades essenciais, anos de experiência..."
                    rows={4}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  />
                </Field>
              </div>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="p-6">
              <h3 className="font-display font-semibold">Pré-visualização</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Como freelancers verão sua vaga.
              </p>
              <div className="mt-4 rounded-lg border bg-surface-muted p-4">
                <p className="text-xs font-semibold text-primary">Rascunho</p>
                <p className="mt-1 font-display text-base font-bold">
                  {title || 'Título da vaga'}
                </p>
                <p className="text-xs text-muted-foreground">Sua empresa</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedTechs(requiredIds)
                    .slice(0, 4)
                    .map((t) => (
                      <span
                        key={t.id}
                        className="rounded border bg-surface px-2 py-0.5 text-[10px] font-medium"
                      >
                        {t.name}
                      </span>
                    ))}
                </div>
              </div>
            </Card>
          </aside>
        </form>
      </PageTransition>
    </AppShell>
  );
}
