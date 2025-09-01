// Auth Credentials
export interface LoginCredentials {
    email: string
    password: string
  }

  export interface RegisterData {
    email: string
    password: string
    password_confirm: string
    first_name: string
    last_name: string
    account_type: string
  }

  export interface GoogleAuthData {
    credential: string
    token: string
    account_type?: string
  }

  export interface PasswordResetData {
    email: string
  }

  export interface ChangePasswordData {
    old_password: string
    new_password: string
  }

  // User Interface (matches Django model)
  export interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    account_type: 'WORKER' | 'BUSINESS'
    is_verified?: boolean
    google_id?: string
    is_google_user?: boolean
  }

export interface UserProfile {
  id: string
  created_at: string
  updated_at: string
  user: string
  address: string
  phone: string
  profession: string
  avatar?: string | null
  bio: string
  date_of_birth?: string | null
  linkedin_url: string
  website_url: string
}

  export interface AuthResponse {
    user: User
    access: string
    refresh: string
  }

  export interface RefreshResponse {
    access: string
  }

  // Error Interface
  export interface AuthError {
    message: string
    status?: number
    errors?: Record<string, string[]>
    errorType?: string           // Add this
    googleLoginRequired?: boolean // Add this
}



  // Redux State Interface
  export interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: AuthError | null

    // Operation-specific loading states
    isLoginLoading: boolean
    isRegisterLoading: boolean
    isProfileLoading: boolean
    isProfileUpdateLoading: boolean
    isPasswordResetLoading: boolean
    isChangePasswordLoading: boolean
    isGoogleAuthLoading: boolean

    // Success states for UI feedback
    passwordResetSuccess: boolean
    changePasswordSuccess: boolean
    googleAuthSuccess: boolean
    registerSuccess: boolean;
  }


  export interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
    client_id?: string;
  }

  // Proper Google API typing
export  interface GoogleAccounts {
    id: {
      renderButton(arg0: HTMLElement | null, arg1: { theme: string; size: string; width: string; }): unknown;
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        use_fedcm_for_prompt?: boolean;
      }) => void;
      prompt: (callback?: (notification: { isNotDisplayed(): boolean; isSkippedMoment(): boolean; }) => void) => void;
    };
  }

export interface Google {
    accounts: GoogleAccounts;
  }

  export interface Post {
    user_name: string
    total_applications: number
    id: string; // UUID from Django
    user: User | string; // Can be populated or just ID
    title: string;
    description: string;
    post_type: 'JOB' | 'GENERAL' | 'ANNOUNCEMENT';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    location: string;
    image?: string; // URL to uploaded image
    salary_range?: string; // For job posts
    requirements?: string; // For job posts
    expires_at?: string; // ISO date string
    is_active: boolean;
    is_featured: boolean;
    view_count: number;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string

    // Audit fields
    created_by?: User | string;
    updated_by?: User | string;

    // Computed properties from Django model
    total_likes: number;
    total_pokes: number;
    total_comments: number;
    is_expired: boolean;
  }

  // For list view - simplified version
  export interface PostListItem {
    id: string;
    user: {
      id: string;
      email: string;
      account_type: 'WORKER' | 'BUSINESS';
      first_name?: string;
      last_name?: string;
    };
    title: string;
    description: string;
    post_type: 'JOB' | 'GENERAL' | 'ANNOUNCEMENT';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    location: string;
    image?: string;
    salary_range?: string;
    requirements?: string;
    expires_at?: string;
    is_active: boolean;
    is_featured: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;

    // Audit fields
    created_by?: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };
    updated_by?: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };

    total_likes: number;
    total_pokes: number;
    total_comments: number;
    is_expired: boolean;
  }
  export interface PostListItem {
    id: string;
    user: {
      id: string;
      email: string;
      account_type: 'WORKER' | 'BUSINESS';
      first_name?: string;
      last_name?: string;
    };
    title: string;
    description: string;
    post_type: 'JOB' | 'GENERAL' | 'ANNOUNCEMENT';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    location: string;
    image?: string;
    salary_range?: string;
    requirements?: string;
    expires_at?: string;
    is_active: boolean;
    is_featured: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
    total_likes: number;
    total_pokes: number;
    total_comments: number;
    is_expired: boolean;
  }

  // For creating/updating posts
  export interface CreatePostRequest {
    title: string;
    description: string;
    post_type: 'JOB' | 'GENERAL' | 'ANNOUNCEMENT';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    location?: string;
    image?: File;
    salary_range?: string;
    requirements?: string;
    expires_at?: string;
    is_featured?: boolean;
    is_active?: boolean;
    created_by?: string; // User ID
    updated_by?: string; // User ID
  }

  export interface UpdatePostRequest extends Partial<CreatePostRequest> {
    id: string;
  }

  // Like interface
  export interface Like {
    id: string;
    user: string; // User ID
    post: string; // Post ID
    like: boolean;
    created_at: string;
    updated_at: string;
  }

  // Poke interface
  export interface Poke {
    id: string;
    user: string; // User ID
    post: string; // Post ID
    poke: boolean;
    created_at: string;
    updated_at: string;
  }

  // Comment interface
  export interface Comment {
    id: string;
    user: User | string;
    post: string; // Post ID
    comment: string;
    parent?: string; // Parent comment ID for replies
    is_edited: boolean;
    created_at: string;
    updated_at: string;
    replies?: Comment[]; // Nested replies
  }

  export interface CreateCommentRequest {
    post: string;
    comment: string;
    parent?: string;
  }

  // Reusable pagination interface
  export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  }

  // Pagination state interface
  export interface PaginationState {
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }

  // API Response interfaces
  export type PostsListResponse = PaginatedResponse<PostListItem>;

  export interface PostDetailResponse extends Post {
    // Additional details that might be included in detail view
    comments?: Comment[];
    user_has_liked?: boolean;
    user_has_poked?: boolean;
  }

  // Filter/Search interfaces
  export interface PostFilters {
    post_type?: 'JOB' | 'GENERAL' | 'ANNOUNCEMENT';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    location?: string;
    user__account_type?: 'WORKER' | 'BUSINESS';
    search?: string;
    ordering?: string;
    page?: number;
  }

  // Redux state interfaces
  export interface PostsState {
    posts: PostListItem[];
    selectedPost: Post | null;
    loading: boolean;
    error: string | null;
    filters: PostFilters;
    pagination: {
      count: number;
      next?: string;
      previous?: string;
      currentPage: number;
    };
    userInteractions: {
      likedPosts: string[];
      pokedPosts: string[];
    };
  }


  export interface ToggleLikeResponse {
    liked: boolean;
    total_likes: number;
  }

  export interface TogglePokeResponse {
    poked: boolean;
    total_pokes: number;
  }

  export interface ApiError {
    message: string;
    status?: number;
    field_errors?: Record<string, string[]>;
  }


  export type PostFormData = Omit<CreatePostRequest, 'image'> & {
    image?: File | string;
  };


  export const POST_TYPES = {
    JOB: 'JOB',
    GENERAL: 'GENERAL',
    ANNOUNCEMENT: 'ANNOUNCEMENT'
  } as const;

  export const PRIORITY_LEVELS = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
  } as const;

  export const ACCOUNT_TYPES = {
    WORKER: 'WORKER',
    BUSINESS: 'BUSINESS'
  } as const;


  export interface JobApplication {
    id: string;
    job: string;
    applicant: string;
    applicant_name: string;
    cover_letter: string;
    resume: string;
    resume_url: string | null;
    additional_info: string;
    status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
    updated_at: string;
    reviewed_at: string | null;
  }

  export interface CreateApplicationRequest {
    job: string;
    cover_letter: string;
    resume: File;
    additional_info?: string;
  }
