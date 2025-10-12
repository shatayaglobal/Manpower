import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { refreshTokenThunk, logoutThunk } from "./authSlice";
import type { store } from "./store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL.endsWith("/") ? API_URL : `${API_URL}/`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let interceptorsSetup = false;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
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
    console.log("Interceptors already setup, skipping...");
    return;
  }

  console.log("Setting up axios interceptors...");

  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const state = storeInstance.getState();
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
        console.log("401 detected, attempting token refresh...");

        if (isRefreshing) {
          console.log("Already refreshing, queuing request...");
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              console.log("Request dequeued with new token");
              if (originalRequest.headers && token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              console.log("Queued request failed:", err);
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const state = storeInstance.getState();
        const refreshToken = state.auth.refreshToken;
        if (!refreshToken) {
          console.log("No refresh token found, logging out...");
          isRefreshing = false;
          processQueue(error, null);
          await storeInstance.dispatch(logoutThunk());
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        try {
          console.log("Attempting to refresh token...");
          const result = await storeInstance.dispatch(
            refreshTokenThunk(refreshToken)
          );

          if (refreshTokenThunk.fulfilled.match(result)) {
            const { access } = result.payload;
            console.log("Token refresh successful!");

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access}`;
            }

            processQueue(null, access);
            isRefreshing = false;
            return axiosInstance(originalRequest);
          } else {
            console.log("Token refresh failed:", result);
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          console.log("Token refresh error:", refreshError);
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
  console.log("Axios interceptors setup complete!");
};

export default axiosInstance;
