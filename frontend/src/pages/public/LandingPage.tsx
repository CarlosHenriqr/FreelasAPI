import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  GitBranch,
  BarChart3,
  Lock,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '@/components/taskio/Logo';
import { Badge, Btn, Card } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';

export function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Logo />
              <nav className="hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
                <a href="#produto" className="hover:text-foreground">
                  Produto
                </a>
                <a href="#fluxo" className="hover:text-foreground">
                  Como funciona
                </a>
                <a href="#garantias" className="hover:text-foreground">
                  Garantias
                </a>
                <a href="#planos" className="hover:text-foreground">
                  Planos
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Btn variant="ghost" size="sm">
                  Entrar
                </Btn>
              </Link>
              <Link to="/cadastro/empresa">
                <Btn size="sm">
                  Começar grátis
                  <ArrowRight className="h-3.5 w-3.5" />
                </Btn>
              </Link>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-radial-fade" />
          <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <Badge tone="primary" className="px-3 py-1 text-xs">
                <Sparkles className="h-3 w-3" /> Plataforma técnica · v2.4
              </Badge>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                Talentos técnicos verificados{' '}
                <span className="text-gradient">para projetos sérios.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                TASKIO conecta empresas a engenheiros, designers e times especializados em um fluxo
                profissional — com matching algorítmico, escrow nativo e auditoria de entregas.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/cadastro/empresa">
                  <Btn size="lg">
                    Publicar um projeto <ArrowRight className="h-4 w-4" />
                  </Btn>
                </Link>
                <Link to="/cadastro/freelancer">
                  <Btn size="lg" variant="secondary">
                    Sou freelancer
                  </Btn>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                {[
                  'Onboarding em 48h',
                  'Pagamentos via escrow',
                  'Suporte com background técnico',
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {t}
                  </span>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden shadow-lg">
              <div className="flex items-center gap-2 border-b bg-surface-muted px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="ml-2 flex-1 rounded-md border bg-surface px-3 py-1 text-xs text-muted-foreground">
                  taskio.io/empresa/dashboard
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Visão geral{' '}
                  <span className="rounded-md border px-2 py-0.5 normal-case tracking-normal">
                    Últimos 30 dias
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: 'Vagas', v: '12', d: '+18%' },
                    { l: 'Candidatos', v: '148', d: '+24%' },
                    { l: 'Entregas', v: '03', d: 'em prazo' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg border bg-surface p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.l}
                      </p>
                      <p className="mt-1 font-display text-xl font-bold">{s.v}</p>
                      <p className="text-[10px] text-success">{s.d}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { p: 'Refatoração de API Gateway', s: 'Em andamento', tone: 'info' as const },
                    { p: 'Migração de banco de dados', s: 'Triagem', tone: 'warning' as const },
                    { p: 'Implementação OAuth2', s: 'Aguardando review', tone: 'neutral' as const },
                  ].map((r) => (
                    <div
                      key={r.p}
                      className="flex items-center justify-between rounded-md border bg-surface px-3 py-2 text-xs"
                    >
                      <span className="font-medium">{r.p}</span>
                      <Badge tone={r.tone}>{r.s}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section id="produto" className="border-b bg-surface-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Badge tone="outline">Produto</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Dois módulos. Um fluxo determinístico.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Pensado para reduzir atrito operacional desde a publicação até a liquidação.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {[
                {
                  icon: Users,
                  title: 'Módulo Empresa',
                  desc: 'Estruture requisitos, processe candidaturas triadas por compatibilidade e supervisione ciclos de entrega com auditoria nativa.',
                  cta: 'Acessar painel',
                  to: '/empresa/dashboard',
                },
                {
                  icon: GitBranch,
                  title: 'Módulo Freelancer',
                  desc: 'Gerencie seu perfil técnico, avalie escopos e submeta propostas focadas em viabilidade. Acompanhe entregas em um único lugar.',
                  cta: 'Acessar workspace',
                  to: '/freelancer/dashboard',
                },
              ].map((f) => (
                <Card
                  key={f.title}
                  className="group relative overflow-hidden p-7 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  <Link
                    to={f.to}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    {f.cta}{' '}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="fluxo" className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
              <div>
                <Badge tone="outline">Fluxo operacional</Badge>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Linear, previsível, auditável.
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Quatro estágios para alinhar expectativas técnicas desde a concepção até a entrega
                  final.
                </p>
              </div>
              <ol className="grid gap-5 sm:grid-cols-2">
                {[
                  {
                    n: '01',
                    t: 'Especificação de requisitos',
                    d: 'A empresa documenta escopo técnico, stack exigida e critérios de aceite em um formato estruturado.',
                  },
                  {
                    n: '02',
                    t: 'Match algorítmico',
                    d: 'O sistema cruza exigências com repositórios e avaliações prévias dos freelancers.',
                  },
                  {
                    n: '03',
                    t: 'Desenvolvimento & sync',
                    d: 'Integração com controle de versão e painéis de milestones para acompanhamento assíncrono.',
                  },
                  {
                    n: '04',
                    t: 'Review & liquidação',
                    d: 'Validação contra critérios de aceite e liberação automática via escrow.',
                  },
                ].map((p) => (
                  <Card key={p.n} className="p-6">
                    <p className="font-display text-2xl font-bold text-primary/80">{p.n}</p>
                    <h4 className="mt-2 font-display text-base font-semibold">{p.t}</h4>
                    <p className="mt-1.5 text-sm text-muted-foreground">{p.d}</p>
                  </Card>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="garantias" className="border-b bg-surface-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Garantias do ecossistema
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Protocolos integrados para mitigação de riscos em projetos de engenharia.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ShieldCheck,
                  t: 'Verificação de skills',
                  d: 'Validação via GitHub, GitLab e provas práticas.',
                },
                {
                  icon: Zap,
                  t: 'Onboarding rápido',
                  d: 'Média de 48h até a primeira contratação.',
                },
                { icon: Lock, t: 'Escrow nativo', d: 'Pagamentos retidos até aprovação documentada.' },
                {
                  icon: BarChart3,
                  t: 'Suporte técnico',
                  d: 'Equipe com background em engenharia de software.',
                },
              ].map((g) => (
                <Card key={g.t} className="p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <g.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 font-semibold">{g.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{g.d}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Card className="relative overflow-hidden p-10 lg:p-14">
              <div className="absolute inset-0 bg-radial-fade" />
              <div className="relative grid items-center gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Pronto para o próximo projeto?
                  </h2>
                  <p className="mt-3 max-w-xl text-muted-foreground">
                    Comece grátis. Publique sua primeira vaga em menos de 5 minutos.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <Link to="/cadastro/empresa">
                    <Btn size="lg">Sou empresa</Btn>
                  </Link>
                  <Link to="/cadastro/freelancer">
                    <Btn size="lg" variant="secondary">
                      Sou freelancer
                    </Btn>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <footer className="border-t bg-surface">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <Logo />
            <p>© 2026 TASKIO · v2.4.1 (Stable)</p>
            <div className="flex gap-5">
              <a href="#" className="hover:text-foreground">
                Docs
              </a>
              <a href="#" className="hover:text-foreground">
                Status
              </a>
              <a href="#" className="hover:text-foreground">
                Termos
              </a>
              <a href="#" className="hover:text-foreground">
                Privacidade
              </a>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
