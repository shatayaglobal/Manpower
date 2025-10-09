import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { AppDispatch } from "./store";
import {
  fetchStaffList,
  fetchStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  fetchShiftList,
  fetchShift,
  createShift,
  updateShift,
  deleteShift,
  fetchHoursCardList,
  approveHoursCard,
  rejectHoursCard,
  setSelectedStaff,
  setSelectedShift,
  setSelectedHoursCard,
  setStaffFilters,
  resetStaffFilters,
  setShiftFilters,
  resetShiftFilters,
  setHoursFilters,
  resetHoursFilters,
  clearStaffError,
  clearShiftError,
  clearHoursError,
} from "./workforceSlice";
import {
  StaffFormData,
  ShiftFormData,
  BusinessStaff,
  Shift,
  HoursCard,
  StaffFilters,
  ShiftFilters,
  HoursCardFilters
} from "@/lib/workforce-types";

// Query params type
type QueryParams = Partial<StaffFilters & ShiftFilters & HoursCardFilters> & {
  page?: number;
  page_size?: number;
  ordering?: string;
  status?: string;
  employment_type?: string;
  department?: string;
  day_of_week?: string;
  shift_type?: string;
};

interface RootState {
  workforce: {
    staff: BusinessStaff[];
    selectedStaff: BusinessStaff | null;
    staffLoading: boolean;
    staffError: string | null;
    staffFilters: StaffFilters;
    staffPagination: {
      count: number;
      next: string | null;
      previous: string | null;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    shifts: Shift[];
    selectedShift: Shift | null;
    shiftLoading: boolean;
    shiftError: string | null;
    shiftFilters: ShiftFilters;
    shiftPagination: {
      count: number;
      next: string | null;
      previous: string | null;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    hoursCards: HoursCard[];
    selectedHoursCard: HoursCard | null;
    hoursLoading: boolean;
    hoursError: string | null;
    hoursFilters: HoursCardFilters;
    hoursPagination: {
      count: number;
      next: string | null;
      previous: string | null;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

export const useWorkforce = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    staff,
    selectedStaff,
    staffLoading,
    staffError,
    staffFilters,
    staffPagination,
    shifts,
    selectedShift,
    shiftLoading,
    shiftError,
    shiftFilters,
    shiftPagination,
    hoursCards,
    selectedHoursCard,
    hoursLoading,
    hoursError,
    hoursFilters,
    hoursPagination,
  } = useSelector((state: RootState) => state.workforce);

  // Staff methods
  const loadStaff = useCallback(
    (params?: QueryParams) => {
      return dispatch(fetchStaffList(params));
    },
    [dispatch]
  );

  const loadStaffById = useCallback(
    (id: string) => {
      return dispatch(fetchStaff(id));
    },
    [dispatch]
  );

  const addStaff = useCallback(
    (data: StaffFormData) => {
      return dispatch(createStaff(data));
    },
    [dispatch]
  );

  const editStaff = useCallback(
    (id: string, data: Partial<StaffFormData>) => {
      return dispatch(updateStaff({ id, data }));
    },
    [dispatch]
  );

  const removeStaff = useCallback(
    (id: string) => {
      return dispatch(deleteStaff(id));
    },
    [dispatch]
  );

  const selectStaff = useCallback(
    (staff: BusinessStaff | null) => {
      dispatch(setSelectedStaff(staff));
    },
    [dispatch]
  );

  const updateStaffFilters = useCallback(
    (filters: Partial<StaffFilters>) => {
      dispatch(setStaffFilters(filters));
    },
    [dispatch]
  );

  const resetStaffFiltersAction = useCallback(() => {
    dispatch(resetStaffFilters());
  }, [dispatch]);

  const clearStaffErrorAction = useCallback(() => {
    dispatch(clearStaffError());
  }, [dispatch]);

  // Shift methods
  const loadShifts = useCallback(
    (params?: QueryParams) => {
      return dispatch(fetchShiftList(params));
    },
    [dispatch]
  );

  const loadShiftById = useCallback(
    (id: string) => {
      return dispatch(fetchShift(id));
    },
    [dispatch]
  );

  const addShift = useCallback(
    (data: ShiftFormData) => {
      return dispatch(createShift(data));
    },
    [dispatch]
  );

  const editShift = useCallback(
    (id: string, data: Partial<ShiftFormData>) => {
      return dispatch(updateShift({ id, data }));
    },
    [dispatch]
  );

  const removeShift = useCallback(
    (id: string) => {
      return dispatch(deleteShift(id));
    },
    [dispatch]
  );

  const selectShift = useCallback(
    (shift: Shift | null) => {
      dispatch(setSelectedShift(shift));
    },
    [dispatch]
  );

  const updateShiftFilters = useCallback(
    (filters: Partial<ShiftFilters>) => {
      dispatch(setShiftFilters(filters));
    },
    [dispatch]
  );

  const resetShiftFiltersAction = useCallback(() => {
    dispatch(resetShiftFilters());
  }, [dispatch]);

  const clearShiftErrorAction = useCallback(() => {
    dispatch(clearShiftError());
  }, [dispatch]);

  // Hours Card methods
  const loadHoursCards = useCallback(
    (params?: QueryParams) => {
      return dispatch(fetchHoursCardList(params));
    },
    [dispatch]
  );

  const approveHours = useCallback(
    (id: string) => {
      return dispatch(approveHoursCard(id));
    },
    [dispatch]
  );

  const rejectHours = useCallback(
    (id: string, reason: string) => {
      return dispatch(rejectHoursCard({ id, reason }));
    },
    [dispatch]
  );

  const selectHoursCard = useCallback(
    (hoursCard: HoursCard | null) => {
      dispatch(setSelectedHoursCard(hoursCard));
    },
    [dispatch]
  );

  const updateHoursFilters = useCallback(
    (filters: Partial<HoursCardFilters>) => {
      dispatch(setHoursFilters(filters));
    },
    [dispatch]
  );

  const resetHoursFiltersAction = useCallback(() => {
    dispatch(resetHoursFilters());
  }, [dispatch]);

  const clearHoursErrorAction = useCallback(() => {
    dispatch(clearHoursError());
  }, [dispatch]);

  return {
    // Staff
    staff,
    selectedStaff,
    staffLoading,
    staffError,
    staffFilters,
    staffPagination,
    loadStaff,
    loadStaffById,
    addStaff,
    editStaff,
    removeStaff,
    selectStaff,
    updateStaffFilters,
    resetStaffFilters: resetStaffFiltersAction,
    clearStaffError: clearStaffErrorAction,

    // Shifts
    shifts,
    selectedShift,
    shiftLoading,
    shiftError,
    shiftFilters,
    shiftPagination,
    loadShifts,
    loadShiftById,
    addShift,
    editShift,
    removeShift,
    selectShift,
    updateShiftFilters,
    resetShiftFilters: resetShiftFiltersAction,
    clearShiftError: clearShiftErrorAction,

    // Hours
    hoursCards,
    selectedHoursCard,
    hoursLoading,
    hoursError,
    hoursFilters,
    hoursPagination,
    loadHoursCards,
    approveHours,
    rejectHours,
    selectHoursCard,
    updateHoursFilters,
    resetHoursFilters: resetHoursFiltersAction,
    clearHoursError: clearHoursErrorAction,
  };
};
