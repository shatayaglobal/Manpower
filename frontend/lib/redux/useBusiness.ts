import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { AppDispatch } from "./store";
import {
  fetchBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  requestVerification,
  clearError,
  setSelectedBusiness,
  updateFilters,
  clearFilters,
  submitContact,
  clearContactError,
  resetContactSubmitted,
} from "./businessSlice";

import {
  Business,
  CreateBusinessRequest,
  BusinessSearchParams,
  ContactUsFormData,
} from "@/lib/business-types";

interface RootState {
  business: {
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
  };
}

export const useBusiness = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    businesses,
    selectedBusiness,
    loading,
    error,
    filters,
    pagination,
    contactLoading,
    contactError,
    contactSubmitted,
  } = useSelector((state: RootState) => state.business);
  const loadBusinesses = useCallback(
    (params?: BusinessSearchParams) => {
      return dispatch(fetchBusinesses(params));
    },
    [dispatch]
  );

  const submitBusiness = useCallback(
    (data: CreateBusinessRequest) => {
      return dispatch(createBusiness(data));
    },
    [dispatch]
  );

  const editBusiness = useCallback(
    (id: string, data: Partial<CreateBusinessRequest>) => {
      return dispatch(updateBusiness({ id, data }));
    },
    [dispatch]
  );

  const removeBusiness = useCallback(
    (id: string) => {
      return dispatch(deleteBusiness(id));
    },
    [dispatch]
  );

  const requestBusinessVerification = useCallback(
    (id: string) => {
      return dispatch(requestVerification(id));
    },
    [dispatch]
  );

  const clearBusinessError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const selectBusiness = useCallback(
    (business: Business | null) => {
      dispatch(setSelectedBusiness(business));
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (filters: Partial<{ search: string; category: string }>) => {
      dispatch(updateFilters(filters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const submitContactForm = useCallback(
    (data: ContactUsFormData) => {
      return dispatch(submitContact(data));
    },
    [dispatch]
  );

  const clearContactErrorHandler = useCallback(() => {
    dispatch(clearContactError());
  }, [dispatch]);

  const resetContactSubmittedHandler = useCallback(() => {
    dispatch(resetContactSubmitted());
  }, [dispatch]);

  return {
    businesses,
    selectedBusiness,
    loading,
    error,
    filters,
    pagination,
    loadBusinesses,
    submitBusiness,
    editBusiness,
    removeBusiness,
    requestBusinessVerification,
    clearBusinessError,
    selectBusiness,
    setFilters,
    resetFilters,
    contactLoading,
    contactError,
    contactSubmitted,
    submitContactForm,
    clearContactError: clearContactErrorHandler,
    resetContactSubmitted: resetContactSubmittedHandler,
  };
};
