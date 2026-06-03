export type UserType = 'user' | 'company';
export type UserRole = 'user' | 'company' | 'admin';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  type: UserType;
  role: UserRole;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type ApiSuccess<T> = {
  status: 'success';
  message?: string;
  data: T;
};

export type ApiError = {
  success?: false;
  status?: 'error';
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export type JobStatus = 'OPEN' | 'PAUSED' | 'CLOSED' | 'CANCELLED';

export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type SkillLevel = 'BASICO' | 'INTERMEDIARIO' | 'AVANCADO' | 'ESPECIALISTA';

export type Technology = {
  id: string;
  name: string;
  slug: string;
  category?: string;
};

export type JobTechnology = {
  type: 'REQUIRED' | 'DESIRABLE';
  technology: Technology;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  deadline: string;
  expiresAt: string;
  isActive: boolean;
  isFilled: boolean;
  status: JobStatus;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  technologies?: JobTechnology[];
  company?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  _count?: { applications: number };
};

export type Application = {
  id: string;
  status: ApplicationStatus;
  resumeUrl: string | null;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
  jobId: string;
  userId: string;
  job?: Job;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    bio?: string | null;
  };
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer?: { id: string; name: string };
};

export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  resumeUrl?: string | null;
  cpf?: string;
  cnpj?: string;
  segment?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  techStack?: Array<{
    level: SkillLevel;
    technology: Technology;
  }>;
  experiences?: Experience[];
  portfolio?: PortfolioItem[];
};

export type Experience = {
  id: string;
  companyName: string;
  roleTitle?: string | null;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
};

export type CreateExperiencePayload = {
  companyName: string;
  roleTitle: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
};

export type MatchingJob = Job & { matchScore?: number; matchPercent?: number };
export type MatchingCandidate = Application & { matchScore?: number; matchPercent?: number };

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isActive: boolean;
  createdAt: string;
};
