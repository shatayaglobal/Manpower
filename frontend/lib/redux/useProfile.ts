import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import {
  checkProfileCompletionThunk,
  getProfileThunk,
  updateProfileThunk,
  deleteProfileThunk,
  clearProfileError,
  clearProfile,
  setPendingJobApplication,
  clearPendingJobApplication
} from './profileSlice';
import { ProfileUpdateData } from '@/lib/types';
import type { AppDispatch, RootState } from './store';
import { submitJobApplication } from './applicationsSlice';

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const {
    profile,
    loading,
    error,
    completionStatus,
    pendingJobApplication
  } = useSelector((state: RootState) => state.profile);

  const getErrorMessage = useCallback((error: unknown, fallback: string): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return fallback;
  }, []);

  const checkProfileComplete = useCallback(async (): Promise<boolean> => {
    if (!user || !isAuthenticated || user.account_type !== 'WORKER') {
      return true;
    }

    try {
      const result = await dispatch(checkProfileCompletionThunk()).unwrap();
      return result.is_complete;
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Error checking profile completeness');
      console.error(errorMessage);
      return false;
    }
  }, [dispatch, user, isAuthenticated, getErrorMessage]);

  // Get user profile
  const loadProfile = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      await dispatch(getProfileThunk()).unwrap();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Error loading profile');
      console.error(errorMessage);
    }
  }, [dispatch, isAuthenticated, getErrorMessage]);

  // Update profile
  const updateProfile = useCallback(async (data: ProfileUpdateData): Promise<boolean> => {
    try {
      await dispatch(updateProfileThunk(data)).unwrap();
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update profile');
      toast.error(errorMessage);
      return false;
    }
  }, [dispatch, getErrorMessage]);

  // Delete profile
  const deleteProfile = useCallback(async (profileId: string): Promise<boolean> => {
    try {
      await dispatch(deleteProfileThunk(profileId)).unwrap();
      toast.success('Profile deleted successfully');
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to delete profile');
      toast.error(errorMessage);
      return false;
    }
  }, [dispatch, getErrorMessage]);

  // Handle apply with profile check - Updated to use Redux
  const handleApplyWithProfileCheck = useCallback(async (jobId: string, jobTitle?: string): Promise<void> => {
    if (!user || user.account_type !== 'WORKER') {
      toast.error('Only workers can apply for jobs');
      return;
    }

    try {
      const isProfileComplete = await checkProfileComplete();

      if (!isProfileComplete) {
        dispatch(setPendingJobApplication({
          jobId,
          jobTitle,
          timestamp: new Date().toISOString(),
        }));

        toast.info('Please complete your profile first to apply for jobs', {
          description: 'You need to add your personal information, skills, and experience.',
          duration: 4000,
        });

        router.push('/profile');
        return;
      }

      // Profile is complete - submit application
      const formData = new FormData();
      formData.append('job', jobId);

      await dispatch(submitJobApplication(formData)).unwrap();

      toast.success('Successfully applied for the job!', {
        description: jobTitle ? `Your application for "${jobTitle}" has been submitted.` : 'Your application has been submitted.',
        duration: 5000,
      });

    }  catch (error) {
      // Extract error message from different possible error structures
      let errorMessage = '';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as { message?: string };
        errorMessage = errorObj.message || '';
      }

      if (errorMessage === 'You have already applied for this job') {
        toast.info('You have already applied for this job', {
          description: 'You can only apply once per job. Check your applications to see the status.',
          duration: 4000,
        });
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    }
  }, [user, checkProfileComplete, router, dispatch]);


  const handleProfileCompleted = useCallback((): void => {
    if (pendingJobApplication) {
      const { jobId } = pendingJobApplication;
      dispatch(clearPendingJobApplication());
      router.push(`/jobs/${jobId}/apply`);
    } else {
      router.push('/jobs');
    }
  }, [pendingJobApplication, dispatch, router]);

  // Clear pending job application manually
  const clearPendingApplication = useCallback((): void => {
    dispatch(clearPendingJobApplication());
  }, [dispatch]);

  // Clear error
  const clearError = useCallback((): void => {
    dispatch(clearProfileError());
  }, [dispatch]);

  // Clear profile data
  const clearProfileData = useCallback((): void => {
    dispatch(clearProfile());
  }, [dispatch]);

  return {
    // State
    profile,
    loading,
    error,
    completionStatus,
    pendingJobApplication,
    isWorker: user?.account_type === 'WORKER',
    isAuthenticated,

    // Actions
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
