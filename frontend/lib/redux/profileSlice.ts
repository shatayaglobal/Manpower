import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ProfileState,
  ProfileUpdateData,
  PendingJobApplication,
} from "@/lib/types";
import { profileAPI } from "./profile-helpers";

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  completionStatus: null,
  pendingJobApplication: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || fallback;
  }

  return fallback;
}

export const checkProfileCompletionThunk = createAsyncThunk(
  "profile/checkCompletion",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.checkComplete();
      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to check profile completion")
      );
    }
  }
);

export const getProfileThunk = createAsyncThunk(
  "profile/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getProfile();

      // Add debugging
      console.log('Raw API response:', response);
      console.log('Response structure:', Object.keys(response));

      return response.profile; // Keep your original code for now
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to get profile"));
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "profile/updateProfile",
  async (data: ProfileUpdateData, { rejectWithValue }) => {
    try {
      const response = await profileAPI.updateProfile(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update profile")
      );
    }
  }
);

export const deleteProfileThunk = createAsyncThunk(
  "profile/deleteProfile",
  async (profileId: string, { rejectWithValue }) => {
    try {
      await profileAPI.deleteProfile(profileId);
      return profileId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete profile")
      );
    }
  }
);

// Profile slice
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.completionStatus = null;
      state.error = null;
    },
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPendingJobApplication: (
      state,
      action: PayloadAction<PendingJobApplication>
    ) => {
      state.pendingJobApplication = action.payload;
    },
    clearPendingJobApplication: (state) => {
      state.pendingJobApplication = null;
    },
  },
  extraReducers: (builder) => {
    // Check profile completion
    builder
      .addCase(checkProfileCompletionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkProfileCompletionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.completionStatus = action.payload;
      })
      .addCase(checkProfileCompletionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get profile
    builder
      .addCase(getProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete profile
    builder
      .addCase(deleteProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfileThunk.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.completionStatus = null;
      })
      .addCase(deleteProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearProfileError,
  clearProfile,
  setProfileLoading,
  setPendingJobApplication,
  clearPendingJobApplication,
} = profileSlice.actions;
export default profileSlice.reducer;
