export interface Business {
    total_staff: number;
    id: string;
    name: string;
    business_id: string;
    slug?: string;
    category: BusinessCategory;
    size: BusinessSize;
    description?: string;
    email: string;
    phone: string;
    website?: string;
    address: string;
    city: string;
    country: string;
    postal_code?: string;
    service_time?: string;
    is_verified: boolean;
    is_active: boolean;
    verification_token?: string;
    created_at: string;
    updated_at: string;

    staff_count?: number;
    active_jobs?: number;
    total_applications?: number;
    verification_status?: VerificationStatus;
  }

  // Business Categories matching Django choices
  export type BusinessCategory =
    | 'RESTAURANT'
    | 'RETAIL'
    | 'HEALTHCARE'
    | 'TECHNOLOGY'
    | 'CONSTRUCTION'
    | 'EDUCATION'
    | 'MANUFACTURING'
    | 'SERVICES'
    | 'OTHER';

  // Business Sizes matching Django choices
  export type BusinessSize =
    | 'SMALL'
    | 'MEDIUM'
    | 'LARGE'
    | 'ENTERPRISE';

  // Verification Status (computed from backend logic)
  export type VerificationStatus =
    | 'verified'
    | 'documents_pending'
    | 'under_review'
    | 'not_started';

  // Form Data for creating/updating business
  export interface BusinessFormData {
    name: string;
    category: BusinessCategory;
    size: BusinessSize;
    description: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
    service_time: string;
  }

  // API Request/Response interfaces
  export interface CreateBusinessRequest {
    name: string;
    category: BusinessCategory;
    size: BusinessSize;
    description?: string;
    email: string;
    phone: string;
    website?: string;
    address: string;
    city: string;
    country: string;
    postal_code?: string;
    service_time?: string;
  }

  export interface UpdateBusinessRequest extends Partial<CreateBusinessRequest> {
    id: string;
  }

  export interface BusinessListResponse {
    count: number;
    next?: string;
    previous?: string;
    results: Business[];
  }

  // Contact Us interfaces
  export interface ContactUsFormData {
    email_address: string;
    name: string;
    inquiry_type: InquiryType;
    title: string;
    subject: string;
  }

  export interface ContactUs {
    id: string;
    email_address: string;
    name: string;
    inquiry_type: InquiryType;
    title: string;
    subject: string;
    is_resolved: boolean;
    resolved_by?: string;
    resolved_at?: string;
    created_at: string;
    updated_at: string;
  }

  export type InquiryType =
    | 'GENERAL'
    | 'SUPPORT'
    | 'BUSINESS'
    | 'BUG_REPORT'
    | 'FEATURE_REQUEST';

  // UI-specific interfaces
  export interface BusinessCardProps {
    business: Business;
    onEdit?: (business: Business) => void;
    onDelete?: (businessId: string) => void;
    onRequestVerification?: (businessId: string) => void;
  }

  export interface BusinessModalProps {
    business?: Business | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: BusinessFormData) => Promise<void>;
  }

  export interface CategoryOption {
    value: BusinessCategory | 'all';
    label: string;
  }

  export interface SizeOption {
    value: BusinessSize;
    label: string;
  }

  export interface VerificationStatusInfo {
    text: string;
    color: 'green' | 'yellow' | 'blue' | 'gray';
    icon: React.ComponentType<{ className?: string }>;
  }

  export interface FormStep {
    number: number;
    title: string;
    description: string;
  }

  // Redux State interfaces
  export interface BusinessState {
    businesses: Business[];
    loading: boolean;
    error: string | null;
    selectedBusiness: Business | null;
    filters: {
      search: string;
      category: BusinessCategory | 'all';
    };
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }

  // API Error interface
  export interface ApiError {
    message: string;
    field?: string;
    code?: string;
  }

  export interface ValidationErrors {
    [key: string]: string[];
  }

  // Business Statistics interface
  export interface BusinessStats {
    totalBusinesses: number;
    verifiedBusinesses: number;
    pendingBusinesses: number;
    totalStaff: number;
    activeJobs: number;
    totalApplications: number;
  }

  // Search and Filter interfaces
  export interface BusinessFilters {
    search?: string;
    category?: BusinessCategory | 'all';
    size?: BusinessSize;
    is_verified?: boolean;
    is_active?: boolean;
    city?: string;
    country?: string;
  }

  export interface BusinessSearchParams extends BusinessFilters {
    page?: number;
    page_size?: number;
    ordering?: string;
  }

  // Activity/Timeline interface for recent activity
  export interface BusinessActivity {
    id: string;
    type: 'verification_completed' | 'business_created' | 'business_updated' | 'staff_added' | 'job_posted';
    message: string;
    business_id?: string;
    business_name?: string;
    timestamp: string;
    metadata?: Record<string, string | number | boolean | null>;
  }

  // Verification Request interface
  export interface VerificationRequest {
    business_id: string;
    documents?: File[];
    notes?: string;
  }

  // Business Analytics interfaces
  export interface BusinessAnalytics {
    business_id: string;
    period: 'week' | 'month' | 'quarter' | 'year';
    staff_growth: number[];
    job_postings: number[];
    applications_received: number[];
    dates: string[];
  }

  // Export all category and size options as constants
  export const BUSINESS_CATEGORIES: CategoryOption[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'CONSTRUCTION', label: 'Construction' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'SERVICES', label: 'Services' },
    { value: 'OTHER', label: 'Other' }
  ];

  export const BUSINESS_SIZES: SizeOption[] = [
    { value: 'SMALL', label: '1-10 employees' },
    { value: 'MEDIUM', label: '11-50 employees' },
    { value: 'LARGE', label: '51-200 employees' },
    { value: 'ENTERPRISE', label: '200+ employees' }
  ];

  export const INQUIRY_TYPES: Array<{ value: InquiryType; label: string }> = [
    { value: 'GENERAL', label: 'General Inquiry' },
    { value: 'SUPPORT', label: 'Technical Support' },
    { value: 'BUSINESS', label: 'Business Partnership' },
    { value: 'BUG_REPORT', label: 'Bug Report' },
    { value: 'FEATURE_REQUEST', label: 'Feature Request' }
  ];

  export const isValidBusinessCategory = (category: string): category is BusinessCategory => {
    return ['RESTAURANT', 'RETAIL', 'HEALTHCARE', 'TECHNOLOGY', 'CONSTRUCTION', 'EDUCATION', 'MANUFACTURING', 'SERVICES', 'OTHER'].includes(category);
  };

  export const isValidBusinessSize = (size: string): size is BusinessSize => {
    return ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'].includes(size);
  };

  export const isValidVerificationStatus = (status: string): status is VerificationStatus => {
    return ['verified', 'documents_pending', 'under_review', 'not_started'].includes(status);
  };
