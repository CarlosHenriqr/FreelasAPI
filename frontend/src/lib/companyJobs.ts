import { jobsApi } from '@/lib/api/jobs.api';
import type { Application, Job } from '@/types/api';

export async function fetchCompanyJobs(companyId: string): Promise<Job[]> {
  const all = await jobsApi.list();
  return all.filter((j) => j.companyId === companyId);
}

export async function findCompanyApplication(
  companyId: string,
  applicationId: string,
): Promise<{ application: Application; job: Job } | null> {
  const jobs = await fetchCompanyJobs(companyId);
  for (const job of jobs) {
    const apps = (await jobsApi.listApplications(job.id)) as Application[];
    const found = apps.find((a) => a.id === applicationId);
    if (found) return { application: found, job };
  }
  return null;
}
