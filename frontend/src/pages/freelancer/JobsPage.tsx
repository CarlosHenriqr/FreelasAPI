import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Briefcase } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { Card, EmptyState, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobCard } from '@/components/shared/JobCard';
import { freelancerNav } from '@/lib/nav';
import { jobsApi } from '@/lib/api/jobs.api';

export function FreelancerJobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  const jobsQuery = useQuery({
    queryKey: ['jobs', 'list', search],
    queryFn: () => jobsApi.list({ search: search || undefined, active: true }),
  });

  const jobs = jobsQuery.data ?? [];

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title="Buscar vagas"
      description="Encontre projetos compatíveis com seu perfil técnico."
    >
      <PageTransition>
        <Card className="mb-5 p-4">
          <TextInput
            placeholder="Buscar por título, stack..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') jobsQuery.refetch();
            }}
          />
        </Card>

        {jobsQuery.isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {jobsQuery.isError && <ErrorState onRetry={() => jobsQuery.refetch()} />}
        {!jobsQuery.isLoading && jobs.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="Nenhuma vaga encontrada"
            description="Tente outros termos de busca ou volte mais tarde."
          />
        )}
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              detailPath={`/freelancer/vagas/${job.id}`}
              showApply
              onApply={() => navigate(`/freelancer/vagas/${job.id}`)}
            />
          ))}
        </div>
      </PageTransition>
    </AppShell>
  );
}
