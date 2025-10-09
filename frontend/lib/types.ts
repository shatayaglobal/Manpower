
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  account_type: string;
}

export interface GoogleAuthData {
  credential: string;
  token: string;
  account_type?: string;
}

export interface PasswordResetData {
  email: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

// User Interface (matches Django model)
export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  account_type: "WORKER" | "BUSINESS";
  is_verified?: boolean;
  google_id?: string;
  is_google_user?: boolean;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}

export interface AuthError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  errorType?: string;
  googleLoginRequired?: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;

  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isProfileLoading: boolean;
  isProfileUpdateLoading: boolean;
  isPasswordResetLoading: boolean;
  isChangePasswordLoading: boolean;
  isGoogleAuthLoading: boolean;

  passwordResetSuccess: boolean;
  changePasswordSuccess: boolean;
  googleAuthSuccess: boolean;
  registerSuccess: boolean;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  client_id?: string;
}

export interface GoogleAccounts {
  id: {
    renderButton(
      arg0: HTMLElement | null,
      arg1: { theme: string; size: string; width: string }
    ): unknown;
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
      use_fedcm_for_prompt?: boolean;
    }) => void;
    prompt: (
      callback?: (notification: {
        isNotDisplayed(): boolean;
        isSkippedMoment(): boolean;
      }) => void
    ) => void;
  };
}

export interface Google {
  accounts: GoogleAccounts;
}

export interface Post {
  user_name: string;
  total_applications: number;
  id: string;
  user: User | string;
  title: string;
  description: string;
  post_type: "JOB" | "GENERAL" | "ANNOUNCEMENT";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
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

  created_by?: User | string;
  updated_by?: User | string;

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
    account_type: "WORKER" | "BUSINESS";
    first_name?: string;
    last_name?: string;
  };
  title: string;
  description: string;
  post_type: "JOB" | "GENERAL" | "ANNOUNCEMENT";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
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
    account_type: "WORKER" | "BUSINESS";
    first_name?: string;
    last_name?: string;
  };
  title: string;
  description: string;
  post_type: "JOB" | "GENERAL" | "ANNOUNCEMENT";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
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

export interface CreatePostRequest {
  title: string;
  description: string;
  post_type: "JOB" | "GENERAL" | "ANNOUNCEMENT";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  location?: string;
  image?: File;
  salary_range?: string;
  requirements?: string;
  expires_at?: string;
  is_featured?: boolean;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

export interface Like {
  id: string;
  user: string;
  post: string;
  like: boolean;
  created_at: string;
  updated_at: string;
}

export interface Poke {
  id: string;
  user: string;
  post: string;
  poke: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user: User | string;
  post: string;
  comment: string;
  parent?: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  post: string;
  comment: string;
  parent?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationState {
  count: number;
  next: string | null;
  previous: string | null;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type PostsListResponse = PaginatedResponse<PostListItem>;

export interface PostDetailResponse extends Post {
  comments?: Comment[];
  user_has_liked?: boolean;
  user_has_poked?: boolean;
}

export interface PostFilters {
  post_type?: "JOB" | "GENERAL" | "ANNOUNCEMENT";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  location?: string;
  user__account_type?: "WORKER" | "BUSINESS";
  search?: string;
  ordering?: string;
  page?: number;
}

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

export type PostFormData = Omit<CreatePostRequest, "image"> & {
  image?: File | string;
};

export const POST_TYPES = {
  JOB: "JOB",
  GENERAL: "GENERAL",
  ANNOUNCEMENT: "ANNOUNCEMENT",
} as const;

export const PRIORITY_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export const ACCOUNT_TYPES = {
  WORKER: "WORKER",
  BUSINESS: "BUSINESS",
} as const;


export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary_range?: string;
}
export interface JobApplication {
  id: string;
  job: string | Job;
  applicant: string;
  applicant_name: string;
  cover_letter: string;
  resume: string;
  resume_url: string | null;
  additional_info: string;
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";
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

export interface UserProfile {
  id: string;
  user_email: string;
  user_name: string;
  account_type: "WORKER" | "BUSINESS";

  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  alternate_phone: string;
  date_of_birth: string | null;
  gender: string;
  marital_status: string;
  nationality: string;

  profession: string;
  current_job_title: string;
  current_company: string;
  employment_status: string;
  experience_level: string;
  years_of_experience: number | null;
  bio: string;
  objective: string;

  skills: string[];
  languages: string[];
  certifications: string[];
  work_experience: WorkExperience[];
  education: Education[];
  references: Reference[];

  expected_salary_min: number | null;
  expected_salary_max: number | null;
  salary_currency: string;
  available_for_work: boolean;
  availability_date: string | null;
  willing_to_relocate: boolean;
  travel_willingness: boolean;

  avatar: string | null;
  resume: string | null;
  portfolio: string | null;

  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  website_url: string;
  twitter_url: string;

  profile_visibility: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;

  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;

  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  location: string;
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade?: string;
  description?: string;
}

export interface Reference {
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface ProfileCheckResponse {
  is_complete: boolean;
  completion_percentage: number;
  missing_fields: string[];
  message: string;
}

export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  completionStatus: ProfileCheckResponse | null;
}

export interface ProfileUpdateData {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  alternate_phone?: string;
  date_of_birth?: string | null;
  gender?: string;
  marital_status?: string;
  nationality?: string;

  profession?: string;
  current_job_title?: string;
  current_company?: string;
  employment_status?: string;
  experience_level?: string;
  years_of_experience?: number | null;
  bio?: string;
  objective?: string;

  skills?: string[];
  languages?: string[];
  certifications?: string[];
  work_experience?: WorkExperience[];
  education?: Education[];
  references?: Reference[];

  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  salary_currency?: string;
  available_for_work?: boolean;
  availability_date?: string | null;
  willing_to_relocate?: boolean;
  travel_willingness?: boolean;

  avatar?: File | string | null;
  resume?: File | string | null;
  portfolio?: File | string | null;

  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  website_url?: string;
  twitter_url?: string;

  profile_visibility?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;

  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;

  hobbies?: string;
  achievements?: string;
}

export interface PendingJobApplication {
  jobId: string;
  jobTitle?: string;
  timestamp: string;
}

export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  completionStatus: ProfileCheckResponse | null;
  pendingJobApplication: PendingJobApplication | null;
}
