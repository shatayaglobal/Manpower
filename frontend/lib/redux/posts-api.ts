import axiosInstance from './axios';
import {
  PostsListResponse,
  Post,
  CreatePostRequest,
  PostFilters,
  ToggleLikeResponse,
  TogglePokeResponse
} from '@/lib/types';

export const postsApi = {
  getPosts: async (filters?: PostFilters) => {
    const response = await axiosInstance.get<PostsListResponse>('/posts/', { params: filters });
    return response.data;
  },


  getPost: async (id: string) => {
    const response = await axiosInstance.get<Post>(`/posts/${id}/`);
    return response.data;
  },


  createPost: async (data: CreatePostRequest | FormData) => {
    const response = await axiosInstance.post<Post>('/posts/', data);
    return response.data;
  },


  updatePost: async (id: string, data: Partial<CreatePostRequest>) => {
    const response = await axiosInstance.patch<Post>(`/posts/${id}/`, data);
    return response.data;
  },


  deletePost: async (id: string) => {
    await axiosInstance.delete(`/posts/${id}/`);
  },


  toggleLike: async (id: string) => {
    const response = await axiosInstance.post<ToggleLikeResponse>(`/posts/${id}/toggle_like/`);
    return response.data;
  },

  togglePoke: async (id: string) => {
    const response = await axiosInstance.post<TogglePokeResponse>(`/posts/${id}/toggle_poke/`);
    return response.data;
  }
};
