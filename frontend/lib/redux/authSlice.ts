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

  return {
    message:
      axiosError?.response?.data?.message ||
      axiosError?.response?.data?.detail ||
      axiosError?.response?.data?.non_field_errors?.[0] ||
      axiosError?.message ||
      "An unexpected error occurred",
    status: axiosError?.response?.status || 500,
    errors: axiosError?.response?.data?.errors || {},
    errorType: axiosError?.response?.data?.error_type,
    googleLoginRequired: axiosError?.response?.data?.google_login_required || false,
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
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("persist:root");
      }
      return true;
    } catch (error: unknown) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("persist:root");
      }
      return rejectWithValue(extractErrorInfo(error));
    }
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
    },
    clearSuccessStates: (state) => {
      state.passwordResetSuccess = false;
      state.changePasswordSuccess = false;
      state.googleAuthSuccess = false;
      state.registerSuccess = false;
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
      });
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
