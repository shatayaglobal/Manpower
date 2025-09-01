
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { postsApi } from './posts-api';
import {
  Post,
  PostListItem,
  CreatePostRequest,
  PostFilters,
  PaginatedResponse,
  PaginationState,
  ToggleLikeResponse,
  TogglePokeResponse,
  JobApplication
} from '@/lib/types';


type PostsListResponse = PaginatedResponse<PostListItem>;

export interface PostsState {
  posts: PostListItem[];
  selectedPost: Post | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  applications: JobApplication[];
  applicationsLoading: boolean;
  applicationsError: string | null;
}

const initialState: PostsState = {
  posts: [],
  selectedPost: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false
  },
  applications: [],
  applicationsLoading: false,
  applicationsError: null
};


export const fetchPosts = createAsyncThunk<PostsListResponse, PostFilters | undefined>(
  'posts/fetchPosts',
  async (filters) => {
    return await postsApi.getPosts(filters);
  }
);

export const fetchPost = createAsyncThunk<Post, string>(
  'posts/fetchPost',
  async (id) => {
    return await postsApi.getPost(id);
  }
);

export const createPost = createAsyncThunk<Post, CreatePostRequest | FormData>(
  'posts/createPost',
  async (data) => {
    return await postsApi.createPost(data);
  }
);

export const updatePost = createAsyncThunk<Post, { id: string; data: Partial<CreatePostRequest> }>(
  'posts/updatePost',
  async ({ id, data }) => {
    return await postsApi.updatePost(id, data);
  }
);

export const deletePost = createAsyncThunk<string, string>(
  'posts/deletePost',
  async (id) => {
    await postsApi.deletePost(id);
    return id;
  }
);

export const toggleLike = createAsyncThunk<{ id: string; response: ToggleLikeResponse }, string>(
  'posts/toggleLike',
  async (id) => {
    const response = await postsApi.toggleLike(id);
    return { id, response };
  }
);

export const togglePoke = createAsyncThunk<{ id: string; response: TogglePokeResponse }, string>(
  'posts/togglePoke',
  async (id) => {
    const response = await postsApi.togglePoke(id);
    return { id, response };
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.results;

        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          currentPage: state.pagination.currentPage,
          hasNext: Boolean(action.payload.next),
          hasPrevious: Boolean(action.payload.previous)
        };
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      });


    builder
      .addCase(fetchPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch post';
      });

    builder
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload as PostListItem);
        state.pagination.count += 1;
      });

    builder
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = {
            ...state.posts[index],
            title: action.payload.title,
            description: action.payload.description,
            post_type: action.payload.post_type,
            priority: action.payload.priority,
            location: action.payload.location,
            image: action.payload.image,
            salary_range: action.payload.salary_range,
            requirements: action.payload.requirements,
            expires_at: action.payload.expires_at,
            is_active: action.payload.is_active,
            is_featured: action.payload.is_featured,
            view_count: action.payload.view_count,
            updated_at: action.payload.updated_at,
            total_likes: action.payload.total_likes,
            total_pokes: action.payload.total_pokes,
            total_comments: action.payload.total_comments,
            is_expired: action.payload.is_expired,
          };
        }
        if (state.selectedPost?.id === action.payload.id) {
          state.selectedPost = action.payload;
        }
      });

    builder
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload);
        state.pagination.count -= 1;
        if (state.selectedPost?.id === action.payload) {
          state.selectedPost = null;
        }
      });

    builder
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { id, response } = action.payload;
        const post = state.posts.find(p => p.id === id);
        if (post) {
          post.total_likes = response.total_likes;
        }
        if (state.selectedPost?.id === id) {
          state.selectedPost.total_likes = response.total_likes;
        }
      });

    builder
      .addCase(togglePoke.fulfilled, (state, action) => {
        const { id, response } = action.payload;
        const post = state.posts.find(p => p.id === id);
        if (post) {
          post.total_pokes = response.total_pokes;
        }
        if (state.selectedPost?.id === id) {
          state.selectedPost.total_pokes = response.total_pokes;
        }
      });
  }
});

export const { clearError, clearSelectedPost, setCurrentPage } = postsSlice.actions;
export default postsSlice.reducer;
