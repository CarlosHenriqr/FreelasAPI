import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Mail, Phone, Star, ExternalLink } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { Btn, Card, Badge } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { freelancerNav } from '@/lib/nav';
import { profileApi } from '@/lib/api/profile.api';
import { reviewsApi } from '@/lib/api/reviews.api';
import { getInitials } from '@/lib/utils';

export function MyProfileViewPage() {
  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.me(),
  });

  const reviewsSummaryQuery = useQuery({
    queryKey: ['reviews', 'summary'],
    queryFn: () => reviewsApi.summary(),
  });

  const reviewsQuery = useQuery({
    queryKey: ['reviews', 'received', 1],
    queryFn: () => reviewsApi.received(1, 5),
  });

  if (profileQuery.isLoading) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Meu perfil" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <PageLoader />
      </AppShell>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppShell nav={freelancerNav} subtitle="Freelancer" title="Meu perfil" primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}>
        <ErrorState onRetry={() => profileQuery.refetch()} />
      </AppShell>
    );
  }

  const profile = profileQuery.data!;
  const stack = profile.techStack ?? [];
  const experiences = profile.experiences ?? [];
  const portfolio = profile.portfolio ?? [];
  const summary = reviewsSummaryQuery.data;
  const recentReviews = reviewsQuery.data ?? [];

  const phoneDigits = (profile.phone ?? '').replace(/\D/g, '');
  const profileIncomplete =
    !profile.bio?.trim() ||
    profile.bio.trim().length < 10 ||
    phoneDigits.length < 10 ||
    stack.length === 0;

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title="Meu perfil"
      description="Como empresas e o sistema de matching enxergam seu perfil."
      actions={
        <Link to="/freelancer/perfil/editar">
          <Btn size="sm">
            <Pencil className="h-3.5 w-3.5" /> Editar perfil
          </Btn>
        </Link>
      }
    >
      <PageTransition>
        {profileIncomplete && (
          <Card className="mb-5 border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-foreground">
              Seu perfil ainda está incompleto.{' '}
              <Link to="/freelancer/perfil/editar" className="font-semibold text-primary hover:underline">
                Preencha bio, telefone e stack tecnológica
              </Link>{' '}
              (campos obrigatórios) para melhorar seus matches.
            </p>
          </Card>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            <Card className="overflow-hidden p-0">
              <div className="h-28 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
              <div className="relative px-6 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="-mt-14 shrink-0 sm:-mt-16">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt=""
                          className="h-20 w-20 rounded-lg border-4 border-card object-cover sm:h-24 sm:w-24"
                        />
                      ) : (
                        <div className="grid h-20 w-20 place-items-center rounded-lg border-4 border-card bg-primary text-xl font-bold text-primary-foreground sm:h-24 sm:w-24 sm:text-2xl">
                          {getInitials(profile.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 sm:pt-1">
                      <h2 className="font-display text-2xl font-bold tracking-tight">{profile.name}</h2>
                      {profile.bio && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {profile.bio.split('\n')[0]}
                        </p>
                      )}
                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-3">
                        {profile.email && (
                          <span className="inline-flex min-w-0 items-center gap-1 break-all">
                            <Mail className="h-3 w-3 shrink-0" /> {profile.email}
                          </span>
                        )}
                        {profile.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" /> {profile.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge tone="success" className="w-fit shrink-0">
                    Disponível
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold">Sobre mim</h3>
              {profile.bio?.trim() ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhuma bio cadastrada.{' '}
                  <Link to="/freelancer/perfil/editar" className="text-primary hover:underline">
                    Adicionar agora
                  </Link>
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold">Experiência profissional</h3>
              {experiences.length > 0 ? (
                <ol className="mt-4 space-y-5 border-l-2 border-border pl-5">
                  {experiences.map((e) => (
                    <li key={e.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-primary" />
                      <p className="font-display font-semibold">
                        {e.roleTitle ?? 'Cargo não informado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.companyName} · {new Date(e.startDate).getFullYear()}
                        {e.endDate
                          ? ` — ${new Date(e.endDate).getFullYear()}`
                          : !e.endDate
                            ? ' — Presente'
                            : ''}
                      </p>
                      {e.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground">{e.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhuma experiência cadastrada.{' '}
                  <Link to="/freelancer/perfil/editar" className="text-primary hover:underline">
                    Adicionar experiência
                  </Link>
                </p>
              )}
            </Card>

            {portfolio.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display text-lg font-semibold">Portfólio em destaque</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {portfolio.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border bg-surface-muted/50 p-4 transition-colors duration-150 hover:bg-muted/30"
                    >
                      <p className="font-semibold">{p.title}</p>
                      {p.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                      )}
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Ver projeto <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <aside className="space-y-5">
            <Card className="p-6">
              <h3 className="font-display font-semibold">Habilidades</h3>
              {stack.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {stack.map((s) => (
                    <span
                      key={s.technology.id}
                      className="rounded border bg-surface-muted px-2 py-0.5 font-mono text-[10px] font-medium"
                    >
                      {s.technology.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhuma tecnologia selecionada.{' '}
                  <Link to="/freelancer/perfil/editar" className="text-primary hover:underline">
                    Escolher stack
                  </Link>
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Avaliações</h3>
              {summary && summary.totalReviews > 0 ? (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex text-warning">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(summary.averageRating) ? 'fill-current' : 'opacity-30'}`}
                        />
                      ))}
                    </div>
                    <span className="font-display text-xl font-bold">
                      {summary.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({summary.totalReviews} avaliações)
                    </span>
                  </div>
                  {recentReviews.length > 0 && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      {recentReviews.slice(0, 3).map((r) => (
                        <div key={r.id}>
                          <div className="flex items-center gap-1 text-warning">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </div>
                          {r.comment && (
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              &quot;{r.comment}&quot;
                            </p>
                          )}
                          {r.reviewer?.name && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              — {r.reviewer.name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Você ainda não recebeu avaliações de empresas.
                </p>
              )}
            </Card>

            <Link to="/freelancer/perfil/editar" className="block">
              <Btn variant="secondary" className="w-full">
                <Pencil className="h-4 w-4" /> Editar perfil completo
              </Btn>
            </Link>
          </aside>
        </div>
      </PageTransition>
    </AppShell>
  );
}
