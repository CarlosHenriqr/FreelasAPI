import type { ApplicationStatus, JobStatus } from '@/types/api';
import { APPLICATION_STATUS_LABELS, JOB_STATUS_LABELS } from '@/lib/utils';
import { Badge } from '@/components/taskio/ui';

const jobTone: Record<JobStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
  OPEN: 'success',
  PAUSED: 'warning',
  CLOSED: 'neutral',
  CANCELLED: 'danger',
};

const appTone: Record<ApplicationStatus, 'success' | 'warning' | 'neutral' | 'danger' | 'info' | 'primary'> = {
  PENDING: 'warning',
  REVIEWED: 'info',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'primary',
  CANCELLED: 'neutral',
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge tone={jobTone[status]}>{JOB_STATUS_LABELS[status] ?? status}</Badge>;
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge tone={appTone[status]}>{APPLICATION_STATUS_LABELS[status] ?? status}</Badge>;
}
