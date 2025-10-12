import axiosInstance from './axios';
import { JobApplication, PaginatedResponse } from '@/lib/types';


export const applicationsApi = {
  submitApplication: async (data: FormData) => {
    try {
      const jobId = data.get("job") as string;
      const response = await axiosInstance.post<JobApplication>(
        `/posts/jobs/${jobId}/apply/`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number; data?: string[] } };
        if (axiosError.response?.status === 400 && Array.isArray(axiosError.response.data)) {
          throw new Error(axiosError.response.data[0]);
        }
      }
      throw error;
    }
  },

  getUserApplications: async () => {
    const response = await axiosInstance.get<PaginatedResponse<JobApplication>>('/posts/applications/user/');
    return response.data.results;
  },

  getApplication: async (id: string) => {
    const response = await axiosInstance.get<JobApplication>(`/applications/${id}/`);
    return response.data;
  },


  getJobApplications: async (jobId: string, page: number = 1) => {
    const response = await axiosInstance.get<PaginatedResponse<JobApplication>>(`/posts/jobs/${jobId}/applications/`, {
      params: { page }
    });
    return response.data;
  },

  updateApplication: async (id: string, data: { status: string }) => {
    const response = await axiosInstance.patch<JobApplication>(`/applications/${id}/update/`, data);
    return response.data;
  },

  getBusinessApplications: async () => {
    const response = await axiosInstance.get<PaginatedResponse<JobApplication>>('/posts/business/applications/');
    return response.data.results;
  },

  updateApplicationStatus: async (applicationId: string, status: string) => {
    const response = await axiosInstance.patch(`/posts/applications/${applicationId}/status/`, {
      status: status
    });
    return response.data;
  },
};
