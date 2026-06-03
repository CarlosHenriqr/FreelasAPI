import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { AppShell } from '@/components/taskio/AppShell';
import { EmptyState } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { CardSkeleton } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { JobCard } from '@/components/shared/JobCard';
import { freelancerNav } from '@/lib/nav';
import { matchingApi } from '@/lib/api/matching.api';

export function FreelancerRecommendedPage() {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['matching', 'jobs'],
    queryFn: () => matchingApi.recommendedJobs(20),
  });

  const jobs = query.data ?? [];

  return (
    <AppShell
      nav={freelancerNav}
      subtitle="Freelancer"
      primaryAction={{ label: 'Ver vagas', to: '/freelancer/vagas' }}
      title="Vagas recomendadas"
      description="Projetos com maior compatibilidade com seu perfil técnico."
    >
      <PageTransition>
        {query.isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {query.isError && <ErrorState onRetry={() => query.refetch()} />}
        {!query.isLoading && jobs.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="Nenhuma recomendação"
            description="Complete seu perfil e stack técnica para receber matches."
          />
        )}
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              detailPath={`/freelancer/vagas/${job.id}`}
              matchPercent={job.matchPercent}
              showApply
              onApply={() => navigate(`/freelancer/vagas/${job.id}`)}
            />
          ))}
        </div>
      </PageTransition>
    </AppShell>
  );
}
