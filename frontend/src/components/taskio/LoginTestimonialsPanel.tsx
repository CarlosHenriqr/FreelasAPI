import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type TestimonialPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: string;
  initials: string;
  accentBg: string;
  position: TestimonialPosition;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Marina Reis',
    role: 'Head of Engineering · Nexo Financial',
    quote:
      'A TASKIO reduziu nosso tempo médio de contratação técnica de 6 semanas para 4 dias.',
    rating: '4.9',
    initials: 'MR',
    accentBg: 'bg-primary',
    position: 'top-right',
  },
  {
    name: 'Rafael Costa',
    role: 'Tech Lead · Freelancer',
    quote:
      'O matching com a stack do projeto e os critérios de aceite deixam cada proposta muito mais objetiva.',
    rating: '4.9',
    initials: 'RC',
    accentBg: 'bg-info',
    position: 'top-left',
  },
  {
    name: 'Camila Duarte',
    role: 'CTO · Arqbyte',
    quote:
      'Triagem de candidatos e validação por skills funcionam como um funil técnico, não só um mural de CVs.',
    rating: '4.8',
    initials: 'CD',
    accentBg: 'bg-warning',
    position: 'bottom-left',
  },
  {
    name: 'André Lima',
    role: 'PM · ScaleOps',
    quote:
      'Milestones e reviews no mesmo painel dão visibilidade real do andamento, sem planilhas paralelas.',
    rating: '4.9',
    initials: 'AL',
    accentBg: 'bg-success',
    position: 'bottom-right',
  },
];

const CARD_POSITION: Record<TestimonialPosition, string> = {
  'top-left': 'left-0 top-[18%] z-20 max-w-[200px]',
  'top-right': 'right-0 top-[8%] z-20 max-w-[210px]',
  'bottom-left': 'bottom-[12%] left-0 z-20 max-w-[200px]',
  'bottom-right': 'bottom-[8%] right-0 z-20 max-w-[210px]',
};

const CONNECTOR_PATHS: Record<TestimonialPosition, string> = {
  'top-left': 'M 22 38 Q 42 48 50 52',
  'top-right': 'M 78 28 Q 58 42 50 48',
  'bottom-left': 'M 20 72 Q 38 62 50 58',
  'bottom-right': 'M 80 78 Q 62 68 50 62',
};

function PhoneDashboardPreview() {
  return (
    <div className="h-full overflow-hidden bg-surface text-foreground">
      <div className="flex items-center gap-1.5 border-b bg-surface-muted px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-warning/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-success/60" />
        <div className="ml-1 flex-1 truncate rounded border bg-surface px-2 py-0.5 font-mono text-[6px] text-muted-foreground">
          taskio.io/empresa
        </div>
      </div>
      <div className="space-y-2 p-2.5">
        <p className="font-mono text-[6px] font-medium uppercase tracking-wider text-muted-foreground">
          Visão geral
        </p>
        <div className="grid grid-cols-3 gap-1">
          {[
            { l: 'Proj.', v: '12' },
            { l: 'Cand.', v: '148' },
            { l: 'Entr.', v: '03' },
          ].map((s) => (
            <div key={s.l} className="rounded border bg-surface p-1">
              <p className="font-mono text-[5px] text-muted-foreground">{s.l}</p>
              <p className="font-display text-[10px] font-bold leading-none">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {[
            { p: 'API Gateway', s: 'Ativo' },
            { p: 'OAuth2', s: 'Review' },
          ].map((r) => (
            <div
              key={r.p}
              className="flex items-center justify-between rounded border px-1.5 py-1 text-[7px]"
            >
              <span className="truncate font-medium">{r.p}</span>
              <span className="shrink-0 rounded bg-primary/10 px-1 font-mono text-[6px] text-primary">{r.s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div
      className={cn(
        'absolute rounded-lg border bg-card/95 p-3 backdrop-blur-sm',
        CARD_POSITION[t.position],
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'grid h-7 w-7 shrink-0 place-items-center rounded-md font-mono text-[9px] font-semibold text-white',
            t.accentBg,
          )}
        >
          {t.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-xs font-semibold text-foreground">{t.name}</p>
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-primary px-1 py-0.5 font-mono text-[8px] font-semibold text-primary-foreground">
              <Star className="h-2 w-2 fill-current" />
              {t.rating}
            </span>
          </div>
          <p className="font-mono text-[8px] text-muted-foreground">{t.role}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-muted-foreground">
        &quot;{t.quote}&quot;
      </p>
    </div>
  );
}

export function LoginTestimonialsPanel() {
  return (
    <div className="relative hidden min-h-screen overflow-hidden bg-foreground lg:block">
      <div className="absolute inset-0 bg-dot-grid opacity-15" />
      <div className="absolute inset-0 bg-mesh-strong" />

      <div className="relative flex h-full flex-col px-10 py-12 text-primary-foreground">
        <div className="relative z-10">
          <span className="inline-block rounded border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-white/70">
            Depoimentos
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white xl:text-5xl">
            O que dizem?
          </h2>
        </div>

        <div className="relative mx-auto mt-2 w-full max-w-lg flex-1">
          <div className="relative h-[min(560px,72vh)] w-full">
            <svg
              className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {(Object.keys(CONNECTOR_PATHS) as TestimonialPosition[]).map((pos) => (
                <path
                  key={pos}
                  d={CONNECTOR_PATHS[pos]}
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.15"
                  strokeWidth="0.4"
                />
              ))}
            </svg>

            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}

            <div className="absolute left-1/2 top-1/2 z-10 w-[200px] -translate-x-1/2 -translate-y-[42%]">
              <div className="rounded-[2.25rem] border border-white/10 bg-foreground p-1.5">
                <div className="overflow-hidden rounded-[1.75rem]">
                  <div className="mx-auto h-4 w-16 rounded-b-lg bg-foreground" />
                  <div className="h-[280px]">
                    <PhoneDashboardPreview />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
