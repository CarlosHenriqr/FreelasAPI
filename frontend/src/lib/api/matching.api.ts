import { apiRequest } from '@/lib/api/client';
import type { MatchingCandidate, MatchingJob } from '@/types/api';

export const matchingApi = {
  recommendedJobs: (limit = 20) =>
    apiRequest<MatchingJob[]>(`/matching/jobs?limit=${limit}`),

  recommendedCandidates: (jobId: string, limit = 20) =>
    apiRequest<MatchingCandidate[]>(`/matching/jobs/${jobId}/candidates?limit=${limit}`),
};
