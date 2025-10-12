import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { AppDispatch } from "./store";
import {
  submitJobApplication,
  fetchUserApplications,
  clearError,
  fetchJobApplications,
  fetchBusinessApplications,
  updateApplicationStatus as updateApplicationStatusAction,
} from "./applicationsSlice";

import { JobApplication } from "@/lib/types";

interface RootState {
  applications: {
    applications: JobApplication[];
    loading: boolean;
    error: string | null;
  };
}

export const useApplications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading, error } = useSelector(
    (state: RootState) => state.applications
  );

  const submitApplication = useCallback(
    (formData: FormData) => {
      return dispatch(submitJobApplication(formData));
    },
    [dispatch]
  );

  
  const loadUserApplications = useCallback(() => {
    return dispatch(fetchUserApplications());
  }, [dispatch]);

  const clearApplicationError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const loadJobApplications = useCallback(
    (jobId: string, page: number = 1) => {
      return dispatch(fetchJobApplications({ jobId, page }));
    },
    [dispatch]
  );

  const loadBusinessApplications = useCallback(() => {
    return dispatch(fetchBusinessApplications());
  }, [dispatch]);

  const updateApplicationStatus = useCallback(
    (applicationId: string, status: string) => {
      return dispatch(
        updateApplicationStatusAction({ id: applicationId, status })
      );
    },
    [dispatch]
  );

  return {
    applications,
    loading,
    error,
    submitApplication,
    loadUserApplications,
    clearApplicationError,
    loadJobApplications,
    loadBusinessApplications,
    updateApplicationStatus,
  };
};
