import axiosInstance from './axios';
import { JobApplication, PaginatedResponse } from '@/lib/types';


export const applicationsApi = {
  submitApplication: async (data: FormData) => {
    const jobId = data.get('job') as string;
    data.delete('job');
    const response = await axiosInstance.post<JobApplication>(`posts/jobs/${jobId}/apply/`, data);
    return response.data;
  },
  getUserApplications: async () => {
    const response = await axiosInstance.get<JobApplication[]>('applications/');
    return response.data;
  },

  getApplication: async (id: string) => {
    const response = await axiosInstance.get<JobApplication>(`applications/${id}/`);
    return response.data;
  },


  getJobApplications: async (jobId: string, page: number = 1) => {
    const response = await axiosInstance.get<PaginatedResponse<JobApplication>>(`posts/jobs/${jobId}/applications/`, {
      params: { page }
    });
    return response.data;
  },

  updateApplication: async (id: string, data: { status: string }) => {
    const response = await axiosInstance.patch<JobApplication>(`applications/${id}/update/`, data);
    return response.data;
  },


};
