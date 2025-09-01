import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'


export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()


export const useAuthState = () => {
  return useAppSelector((state) => {
    const authState = state.auth;
    return {
      user: authState.user,
      accessToken: authState.accessToken,
      refreshToken: authState.refreshToken,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      error: authState.error,
      isLoginLoading: authState.isLoginLoading,
      isRegisterLoading: authState.isRegisterLoading,
      isProfileLoading: authState.isProfileLoading,
      isProfileUpdateLoading: authState.isProfileUpdateLoading,
      isPasswordResetLoading: authState.isPasswordResetLoading,
      isChangePasswordLoading: authState.isChangePasswordLoading,
      isGoogleAuthLoading: authState.isGoogleAuthLoading,
      passwordResetSuccess: authState.passwordResetSuccess,
      changePasswordSuccess: authState.changePasswordSuccess,
      googleAuthSuccess: authState.googleAuthSuccess,
      registerSuccess: authState.registerSuccess
    };
  });
}
