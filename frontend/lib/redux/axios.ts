import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { refreshTokenThunk, logoutThunk } from "./authSlice";
import type { store } from "./store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// FIXED: Create axiosInstance WITHOUT default Content-Type header
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL.endsWith("/") ? API_URL : `${API_URL}/`,
  timeout: 10000,
  // Removed headers: { "Content-Type": "application/json" } ← this was the problem
});

let interceptorsSetup = false;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (storeInstance: typeof store) => {
  if (interceptorsSetup) {
    return;
  }

  axiosInstance.interceptors.request.use(
    (config) => {
      const state = storeInstance.getState();
      const token = state.auth.accessToken;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Only remove Content-Type for FormData — let Axios handle JSON automatically
      if (config.data instanceof FormData && config.headers) {
        delete config.headers["Content-Type"];
      }
      // ← No else clause — we removed forced "application/json"

      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const excludedUrls = [
        "token/refresh",
        "login",
        "logout",
        "register",
        "google",
        "password-reset",
        "change-password",
      ];

      const isExcludedUrl = excludedUrls.some((url) =>
        originalRequest?.url?.toLowerCase().includes(url.toLowerCase())
      );

      if (
        error.response?.status === 401 &&
        !originalRequest?._retry &&
        !isExcludedUrl &&
        originalRequest
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers && token) {
                originalRequest.headers.Authorization = `Bearer ${token as string}`;
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const state = storeInstance.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          isRefreshing = false;
          processQueue(error, null);
          await storeInstance.dispatch(logoutThunk());
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        try {
          const result = await storeInstance.dispatch(
            refreshTokenThunk(refreshToken)
          );

          if (refreshTokenThunk.fulfilled.match(result)) {
            const { access } = result.payload as { access: string };

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access}`;
            }

            processQueue(null, access);
            isRefreshing = false;
            return axiosInstance(originalRequest);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          processQueue(error, null);
          isRefreshing = false;
          await storeInstance.dispatch(logoutThunk());
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  interceptorsSetup = true;
};

export default axiosInstance;
