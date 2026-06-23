import { create } from 'zustand';
import {
  cancelJob,
  createJob,
  fetchJob,
  fetchJobs,
} from '@url-checker/api/jobs.api';
import {
  POLL_INTERVAL_MS,
  TERMINAL_JOB_STATUSES,
  type JobDetailOutputDto,
  type JobSummaryOutputDto,
} from '@url-checker/types/job.types';

interface JobStore {
  jobs: JobSummaryOutputDto[];
  activeJobId: string | null;
  activeJobDetail: JobDetailOutputDto | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  isCreating: boolean;
  isCancelling: boolean;
  error: string | null;
  pollToken: number;

  fetchJobs: () => Promise<void>;
  selectJob: (id: string) => Promise<void>;
  createJob: (urls: string[]) => Promise<void>;
  cancelActiveJob: () => Promise<void>;
}

const pollLoop = (
  jobId: string,
  token: number,
  getState: () => JobStore,
  setState: (partial: Partial<JobStore>) => void,
): void => {
  const tick = async (): Promise<void> => {
    const state = getState();

    if (state.pollToken !== token || state.activeJobId !== jobId) {
      return;
    }

    setState({ isLoadingDetail: true });

    try {
      const detail = await fetchJob(jobId);

      if (getState().pollToken !== token || getState().activeJobId !== jobId) {
        return;
      }

      setState({
        activeJobDetail: detail,
        isLoadingDetail: false,
        error: null,
      });

      if (TERMINAL_JOB_STATUSES.includes(detail.status)) {
        await getState().fetchJobs();
        return;
      }
    } catch (error) {
      if (getState().pollToken !== token || getState().activeJobId !== jobId) {
        return;
      }

      setState({
        isLoadingDetail: false,
        error: error instanceof Error ? error.message : 'Failed to load job',
      });
      return;
    }

    setTimeout(() => {
      void tick();
    }, POLL_INTERVAL_MS);
  };

  void tick();
};

const startPolling = (
  jobId: string,
  getState: () => JobStore,
  setState: (partial: Partial<JobStore>) => void,
): void => {
  const token = getState().pollToken + 1;
  setState({ pollToken: token });
  pollLoop(jobId, token, getState, setState);
};

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  activeJobId: null,
  activeJobDetail: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isCreating: false,
  isCancelling: false,
  error: null,
  pollToken: 0,

  async fetchJobs(): Promise<void> {
    set({ isLoadingList: true, error: null });
    try {
      const jobs = await fetchJobs();
      set({ jobs, isLoadingList: false });
    } catch (error) {
      set({
        isLoadingList: false,
        error: error instanceof Error ? error.message : 'Failed to load jobs',
      });
    }
  },

  async selectJob(id: string): Promise<void> {
    set({
      activeJobId: id,
      activeJobDetail: null,
      error: null,
      pollToken: get().pollToken + 1,
    });
    startPolling(id, get, set);
  },

  async createJob(urls: string[]): Promise<void> {
    set({
      isCreating: true,
      error: null,
      pollToken: get().pollToken + 1,
    });

    try {
      const { id } = await createJob(urls);
      await get().fetchJobs();
      set({
        isCreating: false,
        activeJobId: id,
        activeJobDetail: null,
      });
      startPolling(id, get, set);
    } catch (error) {
      set({
        isCreating: false,
        error: error instanceof Error ? error.message : 'Failed to create job',
      });
    }
  },

  async cancelActiveJob(): Promise<void> {
    const { activeJobId } = get();
    if (!activeJobId) {
      return;
    }

    set({ isCancelling: true, error: null });

    try {
      await cancelJob(activeJobId);

      if (get().activeJobId !== activeJobId) {
        return;
      }

      const detail = await fetchJob(activeJobId);
      await get().fetchJobs();

      if (get().activeJobId !== activeJobId) {
        return;
      }

      set({
        activeJobDetail: detail,
        isCancelling: false,
      });
    } catch (error) {
      if (get().activeJobId !== activeJobId) {
        return;
      }

      set({
        isCancelling: false,
        error: error instanceof Error ? error.message : 'Failed to cancel job',
      });
    }
  },
}));
