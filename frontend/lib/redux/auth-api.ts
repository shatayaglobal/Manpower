import axiosInstance from './axios'
import axios from 'axios'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RefreshResponse,
  GoogleAuthData,
  ChangePasswordData,
  User,
  UserProfile
} from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('login/', credentials)
    return response.data
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('register/', userData)
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const response = await axios.post<RefreshResponse>(
      `${API_URL}/token/refresh/`,
      { refresh: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  }

  async logout() {
    try {
      await axiosInstance.post('logout/')
    } catch (error) {
      throw new Error('Logout failed')
    }
  }

  async googleAuth(googleData: GoogleAuthData): Promise<AuthResponse> {
    const payload = {
      google_token: googleData.credential,
      account_type: 'WORKER'
    };
    const response = await axiosInstance.post<AuthResponse>('google-auth/', payload)
    return response.data
  }

  async googleSignIn(credential: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('auth/google/verify/', {
      credential: credential
    })
    return response.data
  }

  async passwordReset(email: string) {
    const response = await axiosInstance.post('password-reset/', { email })
    return response.data
  }

  async changePassword(passwordData: ChangePasswordData) {
    const response = await axiosInstance.post('change-password/', passwordData)
    return response.data
  }

  async getCurrentUser() {
    const response = await axiosInstance.get('me/')
    return response.data
  }

  async updateCurrentUser(userData: User) {
    const response = await axiosInstance.patch('me/', userData)
    return response.data
  }

  async getUserProfile() {
    const response = await axiosInstance.get('profiles/')
    return response.data
  }

  async updateUserProfile(profileData: UserProfile) {
    const response = await axiosInstance.patch('profiles/', profileData)
    return response.data
  }

  async createUserProfile(profileData: UserProfile) {
    const response = await axiosInstance.post('profiles/', profileData)
    return response.data
  }

  async getAllUsers() {
    const response = await axiosInstance.get('users/')
    return response.data
  }

  async getUserById(userId: string) {
    const response = await axiosInstance.get(`users/${userId}/`)
    return response.data
  }

  async updateUserById(userId: string, userData: User) {
    const response = await axiosInstance.patch(`users/${userId}/`, userData)
    return response.data
  }

  async deleteUserById(userId: string) {
    const response = await axiosInstance.delete(`users/${userId}/`)
    return response.data
  }
}

export const authService = new AuthService()
export default authService
