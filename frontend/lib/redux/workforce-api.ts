import axiosInstance from "./axios";
import {
  BusinessStaff,
  Shift,
  HoursCard,
  StaffFormData,
  ShiftFormData,
  HoursCardFormData,
  PaginatedResponse,
  StaffFilters,
  ShiftFilters,
  HoursCardFilters,
} from "@/lib/workforce-types";

// Helper type for query parameters
type QueryParams =
  | Partial<StaffFilters>
  | Partial<ShiftFilters>
  | Partial<HoursCardFilters>
  | {
      page?: number;
      page_size?: number;
    };

export const workforceApi = {
  // Staff APIs
  getStaffList: async (params?: QueryParams) => {
    const response = await axiosInstance.get<PaginatedResponse<BusinessStaff>>(
      "workforce/staff/",
      {
        params,
      }
    );
    return response.data;
  },

  getStaff: async (id: string) => {
    const response = await axiosInstance.get<BusinessStaff>(
      `workforce/staff/${id}/`
    );
    return response.data;
  },

  createStaff: async (data: StaffFormData) => {
    const response = await axiosInstance.post<BusinessStaff>(
      "workforce/staff/",
      data
    );
    return response.data;
  },

  updateStaff: async (id: string, data: Partial<StaffFormData>) => {
    const response = await axiosInstance.patch<BusinessStaff>(
      `workforce/staff/${id}/`,
      data
    );
    return response.data;
  },

  deleteStaff: async (id: string) => {
    await axiosInstance.delete(`workforce/staff/${id}/`);
  },

  // Shift APIs
  getShiftList: async (params?: QueryParams) => {
    const response = await axiosInstance.get<PaginatedResponse<Shift>>(
      "workforce/shifts/",
      {
        params,
      }
    );
    return response.data;
  },

  getShift: async (id: string) => {
    const response = await axiosInstance.get<Shift>(`workforce/shifts/${id}/`);
    return response.data;
  },

  createShift: async (data: ShiftFormData) => {
    const response = await axiosInstance.post<Shift>("workforce/shifts/", data);
    return response.data;
  },

  updateShift: async (id: string, data: Partial<ShiftFormData>) => {
    const response = await axiosInstance.patch<Shift>(
      `workforce/shifts/${id}/`,
      data
    );
    return response.data;
  },

  deleteShift: async (id: string) => {
    await axiosInstance.delete(`workforce/shifts/${id}/`);
  },

  // Hours Card APIs
  getHoursCardList: async (params?: QueryParams) => {
    const response = await axiosInstance.get<PaginatedResponse<HoursCard>>(
      "workforce/hours-cards/",
      {
        params,
      }
    );
    return response.data;
  },

  getHoursCard: async (id: string) => {
    const response = await axiosInstance.get<HoursCard>(
      `workforce/hours-cards/${id}/`
    );
    return response.data;
  },

  createHoursCard: async (data: HoursCardFormData) => {
    const response = await axiosInstance.post<HoursCard>(
      "workforce/hours-cards/",
      data
    );
    return response.data;
  },

  updateHoursCard: async (id: string, data: Partial<HoursCardFormData>) => {
    const response = await axiosInstance.patch<HoursCard>(
      `workforce/hours-cards/${id}/`,
      data
    );
    return response.data;
  },

  deleteHoursCard: async (id: string) => {
    await axiosInstance.delete(`workforce/hours-cards/${id}/`);
  },

  approveHoursCard: async (id: string) => {
    const response = await axiosInstance.post<HoursCard>(
      `workforce/hours-cards/${id}/approve/`,
      {
        status: "APPROVED",
      }
    );
    return response.data;
  },

  rejectHoursCard: async (id: string, reason: string) => {
    const response = await axiosInstance.post<HoursCard>(
      `workforce/hours-cards/${id}/reject/`,
      {
        status: "REJECTED",
        rejection_reason: reason,
      }
    );
    return response.data;
  },
  // Worker APIs - for workers to view/manage their own data
getMyShifts: async () => {
  const response = await axiosInstance.get<Shift[]>("workforce/my-shifts/");
  return response.data;
},

getMyHoursCards: async () => {
  const response = await axiosInstance.get<HoursCard[]>("workforce/my-hours/");
  return response.data;
},

clockIn: async (data?: {
  staff_id?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  timezone_offset?: number;
}) => {
  const response = await axiosInstance.post<HoursCard>(
    "workforce/clock-in/",
    data || {}
  );
  return response.data;
},

clockOut: async (hoursCardId: string, notes?: string) => {
  const response = await axiosInstance.post<HoursCard>(
    `workforce/hours-cards/${hoursCardId}/clock-out/`,
    { notes }
  );
  return response.data;
},

signHoursCard: async (hoursCardId: string, signature: string) => {
  const response = await axiosInstance.post<HoursCard>(
    `workforce/hours-cards/${hoursCardId}/sign/`,
    { signature }
  );
  return response.data;
},
approveSignedHoursCard: async (hoursCardId: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
  const response = await axiosInstance.post<HoursCard>(
    `workforce/hours-cards/${hoursCardId}/approve/`,
    {
      status,
      rejection_reason: rejectionReason
    }
  );
  return response.data;
},




};
