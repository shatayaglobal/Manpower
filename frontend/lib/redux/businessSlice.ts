import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { businessAPI, contactAPI } from "./business-api";
import {
  Business,
  BusinessListResponse,
  CreateBusinessRequest,
  BusinessSearchParams,
  ContactUsFormData,
  ContactUs,
} from "@/lib/business-types";

export interface BusinessState {
  businesses: Business[];
  selectedBusiness: Business | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
  };
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  contactLoading: boolean;
  contactError: string | null;
  contactSubmitted: boolean;
}

const initialState: BusinessState = {
  businesses: [],
  selectedBusiness: null,
  loading: false,
  error: null,
  filters: {
    search: "",
    category: "all",
  },
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  },
  contactLoading: false,
  contactError: null,
  contactSubmitted: false,
};

export const fetchBusinesses = createAsyncThunk<
  BusinessListResponse,
  BusinessSearchParams | undefined
>("business/fetchBusinesses", async (params) => {
  return await businessAPI.getBusinesses(params);
});

export const createBusiness = createAsyncThunk<Business, CreateBusinessRequest>(
  "business/createBusiness",
  async (data) => {
    return await businessAPI.createBusiness(data);
  }
);

export const updateBusiness = createAsyncThunk<
  Business,
  { id: string; data: Partial<CreateBusinessRequest> }
>("business/updateBusiness", async ({ id, data }) => {
  return await businessAPI.patchBusiness(id, data);
});

export const deleteBusiness = createAsyncThunk<string, string>(
  "business/deleteBusiness",
  async (id) => {
    await businessAPI.deleteBusiness(id);
    return id;
  }
);

export const requestVerification = createAsyncThunk<
  { message: string; businessId: string },
  string
>("business/requestVerification", async (id) => {
  const result = await businessAPI.requestVerification(id);
  return { ...result, businessId: id };
});

export const submitContact = createAsyncThunk<ContactUs, ContactUsFormData>(
  "business/submitContact",
  async (data) => {
    return await contactAPI.submitContact(data);
  }
);

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBusiness: (state, action) => {
      state.selectedBusiness = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        category: "all",
      };
    },
    clearContactError: (state) => {
      state.contactError = null;
    },
    resetContactSubmitted: (state) => {
      state.contactSubmitted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinesses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.loading = false;
        state.businesses = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next ?? null,
          previous: action.payload.previous ?? null,
          currentPage: state.pagination.currentPage,
          hasNext: Boolean(action.payload.next),
          hasPrevious: Boolean(action.payload.previous),
        };
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch businesses";
      })

      .addCase(createBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.businesses.unshift(action.payload);
      })
      .addCase(createBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create business";
      })

      .addCase(updateBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.businesses.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.businesses[index] = action.payload;
        }
        if (state.selectedBusiness?.id === action.payload.id) {
          state.selectedBusiness = action.payload;
        }
      })
      .addCase(updateBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update business";
      })

      .addCase(deleteBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.businesses = state.businesses.filter(
          (b) => b.id !== action.payload
        );
        if (state.selectedBusiness?.id === action.payload) {
          state.selectedBusiness = null;
        }
      })
      .addCase(deleteBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete business";
      })

      .addCase(requestVerification.pending, (state) => {
        state.error = null;
      })
      .addCase(requestVerification.fulfilled, (state, action) => {
        const business = state.businesses.find(
          (b) => b.id === action.payload.businessId
        );
        if (business) {
          business.verification_status = "under_review";
        }
      })
      .addCase(requestVerification.rejected, (state, action) => {
        state.error = action.error.message || "Failed to request verification";
      })
      .addCase(submitContact.pending, (state) => {
        state.contactLoading = true;
        state.contactError = null;
      })
      .addCase(submitContact.fulfilled, (state) => {
        state.contactLoading = false;
        state.contactSubmitted = true;
      })
      .addCase(submitContact.rejected, (state, action) => {
        state.contactLoading = false;
        state.contactError = action.error.message || "Failed to send message";
      });
  },
});

export const {
  clearError,
  setSelectedBusiness,
  updateFilters,
  clearFilters,
  clearContactError,
  resetContactSubmitted,
} = businessSlice.actions;
export default businessSlice.reducer;
