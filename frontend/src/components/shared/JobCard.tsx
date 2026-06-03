import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Card, Btn, Badge } from '@/components/taskio/ui';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import type { Job } from '@/types/api';
import { formatRelativeDate } from '@/lib/utils';

export function JobCard({
  job,
  detailPath,
  showApply,
  onApply,
  matchPercent,
}: {
  job: Job;
  detailPath: string;
  showApply?: boolean;
  onApply?: () => void;
  matchPercent?: number;
}) {
  const stack =
    job.technologies?.map((t) => t.technology.name) ??
    [];

  return (
    <Card className="group p-5 transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-surface-muted/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {job.company?.name ?? 'Empresa'}
            </span>
            <span className="text-border">/</span>
            <Clock className="h-3 w-3" />
            {formatRelativeDate(job.createdAt)}
            {matchPercent !== undefined && matchPercent >= 70 && (
              <Badge tone="success">Match {matchPercent}%</Badge>
            )}
          </div>
          <Link
            to={detailPath}
            className="mt-1.5 block font-display text-lg font-semibold tracking-tight transition-colors hover:text-primary"
          >
            {job.title}
          </Link>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {job.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stack.slice(0, 5).map((s) => (
              <span
                key={s}
                className="rounded border bg-surface-muted px-2 py-0.5 font-mono text-[10px] font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <JobStatusBadge status={job.status} />
          <div className="mt-1 flex gap-2">
            <Link to={detailPath}>
              <Btn variant="secondary" size="sm">
                Detalhes
              </Btn>
            </Link>
            {showApply && job.status === 'OPEN' && (
              <Btn size="sm" onClick={onApply}>
                Candidatar-se
              </Btn>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
