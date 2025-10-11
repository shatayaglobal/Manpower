import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { refreshTokenThunk, logoutThunk } from "./authSlice";

// Import from config for consistency
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL.endsWith("/") ? API_URL : `${API_URL}/`, // Ensure trailing slash
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let interceptorsSetup = false;

export const setupInterceptors = (store: typeof import("./store").store) => {
  if (interceptorsSetup) return;

  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const state = store.getState();
      const token = state.auth.accessToken;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.data instanceof FormData && config.headers) {
        delete config.headers["Content-Type"];
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== "api/token/refresh/" &&
        originalRequest.url !== "login/" &&
        originalRequest.url !== "logout/" &&
        originalRequest.url !== "register/"
      ) {
        originalRequest._retry = true;

        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (refreshToken) {
          try {
            const result = await store.dispatch(
              refreshTokenThunk(refreshToken)
            );

            if (refreshTokenThunk.fulfilled.match(result)) {
              const { access } = result.payload;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access}`;
              }
              return axiosInstance(originalRequest);
            } else {
              store.dispatch(logoutThunk());
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
              return Promise.reject(error);
            }
          } catch (refreshError) {
            store.dispatch(logoutThunk());
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        } else {
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  interceptorsSetup = true;
};

export default axiosInstance;
