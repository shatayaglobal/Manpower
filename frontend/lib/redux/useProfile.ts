import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  checkProfileCompletionThunk,
  getProfileThunk,
  updateProfileThunk,
  deleteProfileThunk,
  clearProfileError,
  clearProfile,
  setPendingJobApplication,
  clearPendingJobApplication,
} from "./profileSlice";
import { ProfileUpdateData } from "@/lib/types";
import type { AppDispatch, RootState } from "./store";
import { submitJobApplication } from "./applicationsSlice";
import React from "react";

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { profile, loading, error, completionStatus, pendingJobApplication } =
    useSelector((state: RootState) => state.profile);

  const isLoadingProfile = React.useRef(false);

  const getErrorMessage = useCallback(
    (error: unknown, fallback: string): string => {
      if (error instanceof Error) {
        return error.message;
      }
      if (typeof error === "string") {
        return error;
      }
      return fallback;
    },
    []
  );

  const checkProfileComplete = useCallback(async (): Promise<boolean> => {
    if (!user || !isAuthenticated || user.account_type !== "WORKER") {
      return true;
    }

    try {
      const result = await dispatch(checkProfileCompletionThunk()).unwrap();
      return result.is_complete;
    } catch {
      return false;
    }
  }, [dispatch, user, isAuthenticated]);

  const loadProfile = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    if (isLoadingProfile.current) return;

    isLoadingProfile.current = true;

    try {
      await dispatch(getProfileThunk()).unwrap();
      await dispatch(checkProfileCompletionThunk()).unwrap();
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      isLoadingProfile.current = false;
    }
  }, [dispatch, isAuthenticated]);

  // Update profile
  const updateProfile = useCallback(
    async (data: ProfileUpdateData): Promise<boolean> => {
      try {
        await dispatch(updateProfileThunk(data)).unwrap();
        toast.success("Profile updated successfully");
        return true;
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to update profile");
        toast.error(errorMessage);
        return false;
      }
    },
    [dispatch, getErrorMessage]
  );

  // Delete profile
  const deleteProfile = useCallback(
    async (profileId: string): Promise<boolean> => {
      try {
        await dispatch(deleteProfileThunk(profileId)).unwrap();
        toast.success("Profile deleted successfully");
        return true;
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to delete profile");
        toast.error(errorMessage);
        return false;
      }
    },
    [dispatch, getErrorMessage]
  );

  const handleApplyWithProfileCheck = useCallback(
    async (jobId: string, jobTitle?: string): Promise<void> => {
      if (!user || user.account_type !== "WORKER") {
        toast.error("Only workers can apply for jobs");
        return;
      }

      if (!jobId || jobId === "undefined") {
        toast.error("Cannot apply: Invalid job ID");
        return;
      }

      try {
        const isProfileComplete = await checkProfileComplete();

        if (!isProfileComplete) {
          dispatch(
            setPendingJobApplication({
              jobId,
              jobTitle,
              timestamp: new Date().toISOString(),
            })
          );
          toast.info("Please complete your profile first to apply for jobs", {
            description:
              "You need to add your personal information, skills, and experience.",
            duration: 4000,
          });
          router.push("/profile");
          return;
        }

        const applicationData = new FormData();
        applicationData.append("job", jobId);
        applicationData.append("user_id", user.id);
        applicationData.append("cover_letter", "Applied via profile check");
        applicationData.append("additional_info", "");

        await dispatch(submitJobApplication(applicationData)).unwrap();

        toast.success("Successfully applied for the job!", {
          description: jobTitle
            ? `Your application for "${jobTitle}" has been submitted.`
            : "Your application has been submitted.",
          duration: 5000,
        });
      } catch (error) {
        let errorMessage = "";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "object" && error !== null) {
          const errorObj = error as { message?: string };
          errorMessage = errorObj.message || "";
        }

        if (errorMessage === "You have already applied for this job") {
          toast.info("You have already applied for this job", {
            description:
              "You can only apply once per job. Check your applications to see the status.",
            duration: 4000,
          });
        } else {
          toast.error("Failed to submit application. Please try again.");
        }
      }
    },
    [user, checkProfileComplete, router, dispatch]
  );

  const handleProfileCompleted = useCallback((): void => {
    if (pendingJobApplication) {
      const { jobId } = pendingJobApplication;
      dispatch(clearPendingJobApplication());
      router.push(`/jobs/${jobId}/apply`);
    } else {
      router.push("/jobs");
    }
  }, [pendingJobApplication, dispatch, router]);

  const clearPendingApplication = useCallback((): void => {
    dispatch(clearPendingJobApplication());
  }, [dispatch]);

  const clearError = useCallback((): void => {
    dispatch(clearProfileError());
  }, [dispatch]);

  const clearProfileData = useCallback((): void => {
    dispatch(clearProfile());
  }, [dispatch]);

  return {
    profile,
    loading,
    error,
    completionStatus,
    pendingJobApplication,
    isWorker: user?.account_type === "WORKER",
    isAuthenticated,

    checkProfileComplete,
    loadProfile,
    updateProfile,
    deleteProfile,
    handleApplyWithProfileCheck,
    handleProfileCompleted,
    clearPendingApplication,
    clearError,
    clearProfileData,
  };
};
