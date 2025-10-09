import axiosInstance from './axios';
import {
  Business,
  BusinessListResponse,
  CreateBusinessRequest,
  ContactUsFormData,
  ContactUs,
  BusinessSearchParams
} from '@/lib/business-types';

export const businessAPI = {
  getBusinesses: async (params?: BusinessSearchParams) => {
    const response = await axiosInstance.get<BusinessListResponse>('/business/', { params });
    return response.data;
  },

  createBusiness: async (data: CreateBusinessRequest) => {
    const response = await axiosInstance.post<Business>('/business/', data);
    return response.data;
  },

  getBusiness: async (id: string) => {
    const response = await axiosInstance.get<Business>(`/business/${id}/`);
    return response.data;
  },

  updateBusiness: async (id: string, data: Partial<CreateBusinessRequest>) => {
    const response = await axiosInstance.put<Business>(`/business/${id}/`, data);
    return response.data;
  },

  patchBusiness: async (id: string, data: Partial<CreateBusinessRequest>) => {
    const response = await axiosInstance.patch<Business>(`/business/${id}/`, data);
    return response.data;
  },

  deleteBusiness: async (id: string) => {
    await axiosInstance.delete(`/business/${id}/`);
  },

  requestVerification: async (id: string) => {
    const response = await axiosInstance.patch<{ message: string }>(`/business/${id}/request-verification/`);
    return response.data;
  }
};

export const contactAPI = {
  submitContact: async (data: ContactUsFormData) => {
    const response = await axiosInstance.post<ContactUs>('/business/contact/', data);
    return response.data;
  },

  getContacts: async (params?: { page?: number; page_size?: number }) => {
    const response = await axiosInstance.get<{
      count: number;
      next?: string;
      previous?: string;
      results: ContactUs[];
    }>('/business/contacts/', { params });
    return response.data;
  },

  getContact: async (id: string) => {
    const response = await axiosInstance.get<ContactUs>(`/business/contacts/${id}/`);
    return response.data;
  },

  updateContact: async (id: string, data: Partial<ContactUsFormData>) => {
    const response = await axiosInstance.put<ContactUs>(`/business/contacts/${id}/`, data);
    return response.data;
  },

  deleteContact: async (id: string) => {
    await axiosInstance.delete(`/business/contacts/${id}/`);
  },

  resolveContact: async (id: string, notes?: string) => {
    const response = await axiosInstance.post<ContactUs>(`/business/contacts/${id}/resolve/`, { notes });
    return response.data;
  }
};

export const businessUtils = {
  formatBusinessName: (business: Business) => {
    return `${business.name} (${business.business_id})`;
  },

  getVerificationStatusText: (business: Business) => {
    return business.is_verified ? 'Verified' : 'Pending Verification';
  },

  formatBusinessAddress: (business: Business) => {
    const parts = [business.address, business.city, business.country];
    if (business.postal_code) {
      parts.push(business.postal_code);
    }
    return parts.filter(Boolean).join(', ');
  },

  getCategoryLabel: (category: string) => {
    const categoryMap: Record<string, string> = {
      RESTAURANT: 'Restaurant',
      RETAIL: 'Retail',
      HEALTHCARE: 'Healthcare',
      TECHNOLOGY: 'Technology',
      CONSTRUCTION: 'Construction',
      EDUCATION: 'Education',
      MANUFACTURING: 'Manufacturing',
      SERVICES: 'Services',
      OTHER: 'Other'
    };
    return categoryMap[category] || category;
  },

  getSizeLabel: (size: string) => {
    const sizeMap: Record<string, string> = {
      SMALL: '1-10 employees',
      MEDIUM: '11-50 employees',
      LARGE: '51-200 employees',
      ENTERPRISE: '200+ employees'
    };
    return sizeMap[size] || size;
  },

  validateBusinessData: (data: CreateBusinessRequest) => {
    const errors: Record<string, string> = {};

    if (!data.name?.trim()) {
      errors.name = 'Business name is required';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!data.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!data.address?.trim()) {
      errors.address = 'Address is required';
    }

    if (!data.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!data.country?.trim()) {
      errors.country = 'Country is required';
    }

    if (data.website && !/^https?:\/\/.+/.test(data.website)) {
      errors.website = 'Website must be a valid URL starting with http:// or https://';
    }

    return errors;
  },

  searchBusinesses: (businesses: Business[], searchTerm: string) => {
    if (!searchTerm.trim()) return businesses;

    const term = searchTerm.toLowerCase();
    return businesses.filter(business =>
      business.name.toLowerCase().includes(term) ||
      business.city.toLowerCase().includes(term) ||
      business.country.toLowerCase().includes(term) ||
      business.business_id.toLowerCase().includes(term)
    );
  },

  filterByCategory: (businesses: Business[], category: string) => {
    if (category === 'all') return businesses;
    return businesses.filter(business => business.category === category);
  }
};
