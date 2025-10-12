import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { applicationsApi } from "./applications-api";
import { JobApplication, PaginatedResponse } from "@/lib/types";

export interface ApplicationsState {
  applications: JobApplication[];
  selectedApplication: JobApplication | null;
  loading: boolean;
  error: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

const initialState: ApplicationsState = {
  applications: [],
  selectedApplication: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 0,
    hasNext: false,
    hasPrevious: false,
  },
};

export const submitJobApplication = createAsyncThunk<JobApplication, FormData>(
  "applications/submitApplication",
  async (formData) => {
    return await applicationsApi.submitApplication(formData);
  }
);
export const fetchUserApplications = createAsyncThunk<JobApplication[], void>(
  "applications/fetchUserApplications",
  async () => {
    return await applicationsApi.getUserApplications();
  }
);

export const fetchJobApplications = createAsyncThunk<
  PaginatedResponse<JobApplication>,
  { jobId: string; page?: number }
>("applications/fetchJobApplications", async ({ jobId, page = 1 }) => {
  return await applicationsApi.getJobApplications(jobId, page);
});

export const updateApplicationStatus = createAsyncThunk<
  JobApplication,
  { id: string; status: string }
>("applications/updateApplicationStatus", async ({ id, status }) => {
  return await applicationsApi.updateApplicationStatus(id, status );
});

export const fetchBusinessApplications = createAsyncThunk<JobApplication[], void>(
  'applications/fetchBusinessApplications',
  async () => {
    return await applicationsApi.getBusinessApplications();
  }
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitJobApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitJobApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications.unshift(action.payload);
      })
      // In applicationsSlice.ts, update the rejected case:
      .addCase(submitJobApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit application";
      })

      .addCase(fetchUserApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchUserApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch applications";
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.applications = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          currentPage: state.pagination.currentPage,
          hasNext: Boolean(action.payload.next),
          hasPrevious: Boolean(action.payload.previous),
        };
        state.loading = false;
      })
      .addCase(fetchJobApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch applications";
      })
      .addCase(fetchBusinessApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchBusinessApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch business applications";
      })

  },
});

export const { clearError } = applicationsSlice.actions;
export default applicationsSlice.reducer;
