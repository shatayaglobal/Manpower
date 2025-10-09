
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from './store';
import {
  fetchPosts,
  fetchPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  togglePoke,
  clearError,
  clearSelectedPost,
  setCurrentPage,
  PostsState
} from './postSlice';
import {
  PostFilters,
  CreatePostRequest,
  PostListItem
} from '@/lib/types';


interface RootState {
  posts: PostsState;
}

export const usePosts = () => {
  const dispatch = useDispatch<AppDispatch>();


  const posts = useSelector((state: RootState) => state.posts.posts);
  const selectedPost = useSelector((state: RootState) => state.posts.selectedPost);
  const loading = useSelector((state: RootState) => state.posts.loading);
  const error = useSelector((state: RootState) => state.posts.error);
  const pagination = useSelector((state: RootState) => state.posts.pagination);


  const loadPosts = useCallback((filters?: PostFilters) => {
    return dispatch(fetchPosts(filters));
  }, [dispatch]);

  const loadPost = useCallback((id: string) => {
    return dispatch(fetchPost(id));
  }, [dispatch]);

  const addPost = useCallback((data: CreatePostRequest | FormData) => {
    return dispatch(createPost(data));
  }, [dispatch]);

  const editPost = useCallback((id: string, data: Partial<CreatePostRequest>) => {
    return dispatch(updatePost({ id, data }));
  }, [dispatch]);

  const removePost = useCallback((id: string) => {
    return dispatch(deletePost(id));
  }, [dispatch]);

  const likePost = useCallback((id: string) => {
    return dispatch(toggleLike(id));
  }, [dispatch]);

  const pokePost = useCallback((id: string) => {
    return dispatch(togglePoke(id));
  }, [dispatch]);

  const clearPostError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentPost = useCallback(() => {
    dispatch(clearSelectedPost());
  }, [dispatch]);

  const changePage = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  const getPostById = useCallback((id: string): PostListItem | undefined => {
    return posts.find(post => post.id === id);
  }, [posts]);

  const isPostLiked = useCallback((): boolean => {
    return false;
  }, []);

  const isPostPoked = useCallback((): boolean => {
    return false;
  }, []);

  return {
    // Data
    posts,
    selectedPost,
    loading,
    error,
    pagination,

    // Actions
    loadPosts,
    loadPost,
    addPost,
    editPost,
    removePost,
    likePost,
    pokePost,
    clearPostError,
    clearCurrentPost,
    changePage,

    // Helpers
    getPostById,
    isPostLiked,
    isPostPoked,

    // Computed values
    hasNextPage: pagination.hasNext,
    hasPreviousPage: pagination.hasPrevious,
    totalPosts: pagination.count,
    currentPage: pagination.currentPage,
  };
};
