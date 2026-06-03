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
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { Logo } from '@/components/taskio/Logo';
import { Badge, Btn, Card } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';

const FAQ_ITEMS = [
  {
    q: 'O que é a TASKIO?',
    a: 'A TASKIO é uma plataforma que conecta empresas a profissionais de tecnologia verificados. Empresas publicam projetos com escopo e stack definidos; freelancers encontram vagas compatíveis e gerenciam candidaturas, entregas e avaliações em um único workspace.',
  },
  {
    q: 'A plataforma é gratuita?',
    a: 'Você pode criar conta e publicar sua primeira vaga sem custo inicial. Planos e limites adicionais podem variar conforme o volume de projetos e recursos da sua operação — consulte a seção de planos ou entre em contato para volumes corporativos.',
  },
  {
    q: 'Como funciona o matching de candidatos?',
    a: 'O motor de compatibilidade cruza a stack exigida no projeto com o perfil técnico do freelancer — tecnologias, experiência e histórico. Quanto mais completo o perfil e a descrição da vaga, mais precisos são os percentuais de match exibidos no painel.',
  },
  {
    q: 'Preciso de contas separadas para empresa e freelancer?',
    a: 'Sim. O login distingue tipo de conta (empresa ou freelancer) e cada perfil acessa um workspace próprio: publicação de vagas e triagem de candidatos para empresas; busca de vagas, candidaturas e portfólio para freelancers.',
  },
  {
    q: 'Como os perfis são verificados?',
    a: 'A verificação combina dados do perfil (bio, stack, experiência, portfólio) com validação técnica quando aplicável — por exemplo, repositórios públicos e critérios de aceite documentados no fluxo do projeto. O objetivo é reduzir ruído na triagem, não substituir a avaliação da sua equipe.',
  },
  {
    q: 'Posso cancelar uma candidatura depois de enviada?',
    a: 'Freelancers podem cancelar candidaturas enquanto o status estiver pendente, diretamente na área de trabalhos. Empresas gerenciam o funil (análise, aceite, recusa ou conclusão) pelo painel de candidatos de cada projeto.',
  },
  {
    q: 'Meus dados e projetos ficam seguros?',
    a: 'A plataforma utiliza comunicação criptografada e controles de acesso por tipo de conta. Informações sensíveis de projeto e credenciais de acesso devem ser compartilhadas apenas pelos canais acordados entre empresa e profissional contratado.',
  },
  {
    q: 'Quanto tempo leva para começar a usar?',
    a: 'O cadastro leva poucos minutos. Empresas podem publicar a primeira vaga em menos de cinco minutos; freelancers que completam bio, telefone e stack costumam receber recomendações mais rápido — em média, o onboarding até a primeira interação relevante fica em torno de 48 horas.',
  },
] as const;

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-border last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium tracking-tight transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
        <span className="pr-2">{question}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:text-primary" />
      </summary>
      <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
    </details>
  );
}

export function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Logo />
              <nav className="hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
                <a href="#produto" className="link-underline transition-colors hover:text-foreground">
                  Produto
                </a>
                <a href="#fluxo" className="link-underline transition-colors hover:text-foreground">
                  Como funciona
                </a>
                <a href="#garantias" className="link-underline transition-colors hover:text-foreground">
                  Garantias
                </a>
                <a href="#faq" className="link-underline transition-colors hover:text-foreground">
                  FAQ
                </a>
                <a href="#planos" className="link-underline transition-colors hover:text-foreground">
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

        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-mesh" />
          <div className="absolute inset-0 bg-dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="absolute inset-0 bg-noise" />
          <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:px-8 lg:py-32">
            <div className="animate-slide-up">
              <Badge tone="outline" className="px-2.5 py-1">
                <Sparkles className="h-3 w-3" /> Plataforma técnica
              </Badge>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[3.5rem]">
                Talentos técnicos{' '}
                <br className="hidden sm:block" />
                verificados{' '}
                <span className="text-gradient">para projetos sérios.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                TASKIO conecta empresas a engenheiros, designers e times especializados em um fluxo
                profissional — com matching algorítmico, critérios de aceite claros e auditoria de entregas.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
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
              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                {[
                  'Onboarding em 48h',
                  'Suporte com background técnico',
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="animate-slide-up [animation-delay:100ms]">
              <Card className="overflow-hidden">
                <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
                  </div>
                  <div className="ml-2 flex-1 rounded border bg-surface px-3 py-1 font-mono text-[10px] text-muted-foreground">
                    taskio.io/empresa/dashboard
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Visão geral{' '}
                    <span className="rounded border px-2 py-0.5 normal-case tracking-normal">
                      Últimos 30 dias
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: 'Projetos', v: '12', d: '+18%' },
                      { l: 'Candidatos', v: '148', d: '+24%' },
                      { l: 'Entregas', v: '03', d: 'em prazo' },
                    ].map((s) => (
                      <div key={s.l} className="rounded-md border bg-surface p-3">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {s.l}
                        </p>
                        <p className="mt-1 font-display text-xl font-bold tracking-tighter">{s.v}</p>
                        <p className="font-mono text-[9px] text-success">{s.d}</p>
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
          </div>
        </section>

        {/* Produto */}
        <section id="produto" className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Badge tone="outline">Produto</Badge>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Dois módulos. Um fluxo determinístico.
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Pensado para reduzir atrito operacional desde a publicação até o encerramento do projeto.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
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
                  className="group relative overflow-hidden p-8 transition-all duration-200 hover:-translate-y-px hover:border-primary/20"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/8 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  <Link
                    to={f.to}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary link-underline"
                  >
                    {f.cta}{' '}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Fluxo */}
        <section id="fluxo" className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
              <div>
                <Badge tone="outline">Fluxo operacional</Badge>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Linear, previsível, auditável.
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Quatro estágios para alinhar expectativas técnicas desde a concepção até a entrega
                  final.
                </p>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2">
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
                    t: 'Review & encerramento',
                    d: 'Validação contra critérios de aceite, feedback estruturado e arquivamento do projeto no histórico.',
                  },
                ].map((p) => (
                  <Card key={p.n} className="p-6">
                    <p className="font-display text-2xl font-bold tracking-tighter text-primary/60">{p.n}</p>
                    <h4 className="mt-2 font-display text-base font-semibold tracking-tight">{p.t}</h4>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.d}</p>
                  </Card>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Garantias */}
        <section id="garantias" className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Garantias do ecossistema
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
              Protocolos integrados para mitigação de riscos em projetos de engenharia.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                {
                  icon: Lock,
                  t: 'Histórico auditável',
                  d: 'Registro de milestones, reviews e status para rastreabilidade do projeto.',
                },
                {
                  icon: BarChart3,
                  t: 'Suporte técnico',
                  d: 'Equipe com background em engenharia de software.',
                },
              ].map((g) => (
                <Card key={g.t} className="p-6 transition-colors duration-150 hover:bg-surface-muted/50">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/6 text-primary">
                    <g.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 font-semibold tracking-tight">{g.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{g.d}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <Badge tone="outline">
                  <HelpCircle className="h-3 w-3" /> FAQ
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Dúvidas gerais
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Respostas rápidas sobre como a TASKIO funciona para empresas e freelancers.
                  Não encontrou o que precisa?{' '}
                  <a href="#" className="font-semibold text-primary link-underline">
                    Fale com o suporte
                  </a>
                  .
                </p>
              </div>
              <Card className="overflow-hidden px-6 sm:px-8">
                {FAQ_ITEMS.map((item) => (
                  <FaqItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="planos" className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <Card className="relative overflow-hidden p-10 lg:p-16">
              <div className="absolute inset-0 bg-mesh opacity-60" />
              <div className="absolute inset-0 bg-noise" />
              <div className="relative grid items-center gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Pronto para o próximo projeto?
                  </h2>
                  <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
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

        {/* Footer */}
        <footer className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <Logo />
            <p className="font-mono text-[10px] uppercase tracking-wider">&copy; 2026 TASKIO</p>
            <div className="flex gap-5">
              <a href="#" className="link-underline transition-colors hover:text-foreground">
                Docs
              </a>
              <a href="#" className="link-underline transition-colors hover:text-foreground">
                Status
              </a>
              <a href="#" className="link-underline transition-colors hover:text-foreground">
                Termos
              </a>
              <a href="#" className="link-underline transition-colors hover:text-foreground">
                Privacidade
              </a>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
