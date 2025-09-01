import { useAppDispatch } from './redux'
import {
  loginThunk,
  registerThunk,
  logoutThunk,
  getCurrentUserThunk,
  updateCurrentUserThunk,
  passwordResetThunk,
  changePasswordThunk,
  googleAuthThunk,
  clearError,
  resetLoadingStates,
  clearSuccessStates,
  googleSignInThunk
} from './authSlice'
import type { LoginCredentials, RegisterData, GoogleAuthData, ChangePasswordData, User } from '../types'

export const useAuthSlice = () => {
  const dispatch = useAppDispatch()
  const resetLoading = () => dispatch(resetLoadingStates())
  const login = async (credentials: LoginCredentials) => {

    const result = await dispatch(loginThunk(credentials))
    return {
      success: loginThunk.fulfilled.match(result),
      data: result.payload,
      error: loginThunk.rejected.match(result) ? result.payload : null
    }
  }

  const register = async (userData: RegisterData) => {
    const result = await dispatch(registerThunk(userData))
    return {
      success: registerThunk.fulfilled.match(result),
      data: result.payload,
      error: registerThunk.rejected.match(result) ? result.payload : null
    }
  }

  const logout = async () => {
    const result = await dispatch(logoutThunk())
    if (typeof window !== 'undefined') {
      window.location.href = '/home'
    }
    return {
      success: logoutThunk.fulfilled.match(result),
      data: result.payload,
      error: logoutThunk.rejected.match(result) ? result.payload : null
    }
  }

  const getCurrentUser = async () => {
    const result = await dispatch(getCurrentUserThunk())
    return {
      success: getCurrentUserThunk.fulfilled.match(result),
      data: result.payload,
      error: getCurrentUserThunk.rejected.match(result) ? result.payload : null
    }
  }

  const updateCurrentUser = async (userData: User) => {
    const result = await dispatch(updateCurrentUserThunk(userData))
    return {
      success: updateCurrentUserThunk.fulfilled.match(result),
      data: result.payload,
      error: updateCurrentUserThunk.rejected.match(result) ? result.payload : null
    }
  }

  const passwordReset = async (email: string) => {
    const result = await dispatch(passwordResetThunk(email))
    return {
      success: passwordResetThunk.fulfilled.match(result),
      data: result.payload,
      error: passwordResetThunk.rejected.match(result) ? result.payload : null
    }
  }

  const changePassword = async (passwordData: ChangePasswordData) => {
    const result = await dispatch(changePasswordThunk(passwordData))
    return {
      success: changePasswordThunk.fulfilled.match(result),
      data: result.payload,
      error: changePasswordThunk.rejected.match(result) ? result.payload : null
    }
  }

  const googleAuth = async (googleData: GoogleAuthData) => {
    const result = await dispatch(googleAuthThunk(googleData))
    return {
      success: googleAuthThunk.fulfilled.match(result),
      data: result.payload,
      error: googleAuthThunk.rejected.match(result) ? result.payload : null
    }
  }

  const googleSignIn = async (credential: string) => {
    const result = await dispatch(googleSignInThunk(credential))
    return {
      success: googleSignInThunk.fulfilled.match(result),
      data: result.payload,
      error: googleSignInThunk.rejected.match(result) ? result.payload : null
    }
  }


  const clearAuthError = () => dispatch(clearError())
  const clearAuthSuccessStates = () => dispatch(clearSuccessStates())

  return {
    login,
    register,
    logout,
    getCurrentUser,
    updateCurrentUser,
    passwordReset,
    changePassword,
    googleAuth,
    googleSignIn,
    clearAuthError,
    resetLoading,
    clearAuthSuccessStates,
  }
}

export const isTokenExpired = (token: string): boolean => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch {
    return true
  }
}


export const getTokenExpiry = (token: string): number | null => {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000
  } catch {
    return null
  }
}


export const getUserFromToken = (token: string) => {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.user_id,
      email: payload.email,

    }
  } catch {
    return null
  }
}
