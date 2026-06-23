import type {
  CreateJobResponseDto,
  JobDetailOutputDto,
  JobSummaryOutputDto,
} from '@url-checker/types/job.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const fetchJobs = (): Promise<JobSummaryOutputDto[]> =>
  apiFetch<JobSummaryOutputDto[]>('/jobs');

export const fetchJob = (id: string): Promise<JobDetailOutputDto> =>
  apiFetch<JobDetailOutputDto>(`/jobs/${id}`);

export const createJob = (urls: string[]): Promise<CreateJobResponseDto> =>
  apiFetch<CreateJobResponseDto>('/jobs', {
    method: 'POST',
    body: JSON.stringify({ urls }),
  });

export const cancelJob = (id: string): Promise<void> =>
  apiFetch<void>(`/jobs/${id}/cancel`, {
    method: 'PATCH',
  });
