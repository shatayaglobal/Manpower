import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import authService from "@/lib/redux/auth-api";
import type {
  User,
  AuthError,
  AuthState,
  LoginCredentials,
  RegisterData,
  GoogleAuthData,
  ChangePasswordData,
  VerifyEmailResponse,
  ResendVerificationResponse,
} from "@/lib/types";

interface ApiErrorResponse {
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
  error_type?: string;
  google_login_required?: boolean;
}

interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
  message?: string;
}

const extractErrorInfo = (error: unknown): AuthError => {
  const axiosError = error as AxiosErrorResponse;
  const fieldErrors = axiosError?.response?.data?.errors;
  let errorMessage =
    axiosError?.response?.data?.message ||
    axiosError?.response?.data?.detail ||
    axiosError?.response?.data?.non_field_errors?.[0] ||
    axiosError?.message ||
    "An unexpected error occurred";
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    const firstErrorKey = Object.keys(fieldErrors)[0];
    errorMessage = fieldErrors[firstErrorKey][0];
  }

  return {
    message: errorMessage,
    status: axiosError?.response?.status || 500,
    errors: fieldErrors || {},
    errorType: axiosError?.response?.data?.error_type,
    googleLoginRequired:
      axiosError?.response?.data?.google_login_required || false,
  };
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isLoginLoading: false,
  isRegisterLoading: false,
  isProfileLoading: false,
  isProfileUpdateLoading: false,
  isPasswordResetLoading: false,
  isChangePasswordLoading: false,
  isGoogleAuthLoading: false,
  passwordResetSuccess: false,
  changePasswordSuccess: false,
  googleAuthSuccess: false,
  registerSuccess: false,
  isVerifyEmailLoading: false,
  isResendVerificationLoading: false,
  verifyEmailSuccess: false,
  resendVerificationSuccess: false,

  isRequestPasswordResetLoading: false,
  isConfirmPasswordResetLoading: false,
  requestPasswordResetSuccess: false,
  confirmPasswordResetSuccess: false,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const result = await authService.refreshToken(refreshToken);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const getCurrentUserThunk = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getCurrentUser();
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const updateCurrentUserThunk = createAsyncThunk(
  "auth/updateCurrentUser",
  async (userData: User, { rejectWithValue }) => {
    try {
      const result = await authService.updateCurrentUser(userData);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("persist:root");
    }
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.accessToken;
      if (token) {
        await authService.logout();
      }
    } catch {
      throw new Error("Logout failed");
    }

    return true;
  }
);
export const googleAuthThunk = createAsyncThunk(
  "auth/googleAuth",
  async (googleData: GoogleAuthData, { rejectWithValue }) => {
    try {
      const result = await authService.googleAuth(googleData);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const passwordResetThunk = createAsyncThunk(
  "auth/passwordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const result = await authService.passwordReset(email);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (passwordData: ChangePasswordData, { rejectWithValue }) => {
    try {
      const result = await authService.changePassword(passwordData);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const googleSignInThunk = createAsyncThunk(
  "auth/googleSignIn",
  async (credential: string, { rejectWithValue }) => {
    try {
      const result = await authService.googleSignIn(credential);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const result = await authService.verifyEmail(token);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const resendVerificationThunk = createAsyncThunk(
  "auth/resendVerification",
  async (email: string, { rejectWithValue }) => {
    try {
      const result = await authService.resendVerification(email);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const requestPasswordResetThunk = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const result = await authService.requestPasswordReset(email);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

export const confirmPasswordResetThunk = createAsyncThunk(
  "auth/confirmPasswordReset",
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await authService.confirmPasswordReset(token, newPassword);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorInfo(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetLoadingStates: (state) => {
      state.isLoginLoading = false;
      state.isRegisterLoading = false;
      state.isGoogleAuthLoading = false;
      state.isLoading = false;
      state.isProfileLoading = false;
      state.isProfileUpdateLoading = false;
      state.isPasswordResetLoading = false;
      state.isChangePasswordLoading = false;

      state.isRequestPasswordResetLoading = false;
      state.isConfirmPasswordResetLoading = false;
    },
    clearSuccessStates: (state) => {
      state.passwordResetSuccess = false;
      state.changePasswordSuccess = false;
      state.googleAuthSuccess = false;
      state.registerSuccess = false;
      state.verifyEmailSuccess = false;
      state.resendVerificationSuccess = false;

      state.requestPasswordResetSuccess = false;
      state.confirmPasswordResetSuccess = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    refreshTokenSuccess: (state, action: PayloadAction<{ access: string }>) => {
      state.accessToken = action.payload.access;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoginLoading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        state.isLoginLoading = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoginLoading = false;
        state.isLoading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(registerThunk.pending, (state) => {
        state.isRegisterLoading = true;
        state.isLoading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isRegisterLoading = false;
        state.isLoading = false;
        state.error = null;
        state.registerSuccess = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isRegisterLoading = false;
        state.isLoading = false;
        state.error = action.payload as AuthError;
        state.registerSuccess = false;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      .addCase(getCurrentUserThunk.pending, (state) => {
        state.isProfileLoading = true;
      })
      .addCase(getCurrentUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isProfileLoading = false;
        state.error = null;
      })
      .addCase(getCurrentUserThunk.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(updateCurrentUserThunk.pending, (state) => {
        state.isProfileUpdateLoading = true;
        state.error = null;
      })
      .addCase(updateCurrentUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isProfileUpdateLoading = false;
        state.error = null;
      })
      .addCase(updateCurrentUserThunk.rejected, (state, action) => {
        state.isProfileUpdateLoading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      })
      .addCase(googleAuthThunk.pending, (state) => {
        state.isGoogleAuthLoading = true;
        state.error = null;
        state.googleAuthSuccess = false;
      })
      .addCase(googleAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        state.isGoogleAuthLoading = false;
        state.googleAuthSuccess = true;
        state.error = null;
      })
      .addCase(googleAuthThunk.rejected, (state, action) => {
        state.isGoogleAuthLoading = false;
        state.googleAuthSuccess = false;
        state.error = action.payload as AuthError;
      })
      .addCase(passwordResetThunk.pending, (state) => {
        state.isPasswordResetLoading = true;
        state.error = null;
        state.passwordResetSuccess = false;
      })
      .addCase(passwordResetThunk.fulfilled, (state) => {
        state.isPasswordResetLoading = false;
        state.passwordResetSuccess = true;
        state.error = null;
      })
      .addCase(passwordResetThunk.rejected, (state, action) => {
        state.isPasswordResetLoading = false;
        state.passwordResetSuccess = false;
        state.error = action.payload as AuthError;
      })
      .addCase(changePasswordThunk.pending, (state) => {
        state.isChangePasswordLoading = true;
        state.error = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.isChangePasswordLoading = false;
        state.changePasswordSuccess = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isChangePasswordLoading = false;
        state.changePasswordSuccess = false;
        state.error = action.payload as AuthError;
      })
      .addCase(verifyEmailThunk.pending, (state) => {
        state.isVerifyEmailLoading = true;
        state.error = null;
        state.verifyEmailSuccess = false;
      })
      .addCase(verifyEmailThunk.fulfilled, (state, action) => {
        state.isVerifyEmailLoading = false;
        state.verifyEmailSuccess = true;
        state.error = null;
        // Optionally update user if returned
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(verifyEmailThunk.rejected, (state, action) => {
        state.isVerifyEmailLoading = false;
        state.verifyEmailSuccess = false;
        state.error = action.payload as AuthError;
      })
      .addCase(resendVerificationThunk.pending, (state) => {
        state.isResendVerificationLoading = true;
        state.error = null;
        state.resendVerificationSuccess = false;
      })
      .addCase(resendVerificationThunk.fulfilled, (state) => {
        state.isResendVerificationLoading = false;
        state.resendVerificationSuccess = true;
        state.error = null;
      })
      .addCase(resendVerificationThunk.rejected, (state, action) => {
        state.isResendVerificationLoading = false;
        state.resendVerificationSuccess = false;
        state.error = action.payload as AuthError;
      })
      .addCase(requestPasswordResetThunk.pending, (state) => {
        state.isRequestPasswordResetLoading = true;
        state.error = null;
        state.requestPasswordResetSuccess = false;
      })
      .addCase(requestPasswordResetThunk.fulfilled, (state) => {
        state.isRequestPasswordResetLoading = false;
        state.requestPasswordResetSuccess = true;
        state.error = null;
      })
      .addCase(requestPasswordResetThunk.rejected, (state, action) => {
        state.isRequestPasswordResetLoading = false;
        state.requestPasswordResetSuccess = false;
        state.error = action.payload as AuthError;
      })
      .addCase(confirmPasswordResetThunk.pending, (state) => {
        state.isConfirmPasswordResetLoading = true;
        state.error = null;
        state.confirmPasswordResetSuccess = false;
      })
      .addCase(confirmPasswordResetThunk.fulfilled, (state) => {
        state.isConfirmPasswordResetLoading = false;
        state.confirmPasswordResetSuccess = true;
        state.error = null;
      })
      .addCase(confirmPasswordResetThunk.rejected, (state, action) => {
        state.isConfirmPasswordResetLoading = false;
        state.confirmPasswordResetSuccess = false;
        state.error = action.payload as AuthError;
      })
  },
});

export const {
  clearError,
  resetLoadingStates,
  clearSuccessStates,
  updateUser,
  refreshTokenSuccess,
} = authSlice.actions;
export default authSlice.reducer;
