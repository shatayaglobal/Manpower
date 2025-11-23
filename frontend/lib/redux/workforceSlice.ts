import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { workforceApi } from "./workforce-api";
import {
  BusinessStaff,
  Shift,
  HoursCard,
  StaffFormData,
  ShiftFormData,
  HoursCardFormData,
  StaffFilters,
  ShiftFilters,
  HoursCardFilters,
} from "@/lib/workforce-types";

type QueryParams = Partial<StaffFilters & ShiftFilters & HoursCardFilters> & {
  page?: number;
  page_size?: number;
};

export interface WorkforceState {
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

  myStaffProfile: BusinessStaff | null;
  myShifts: Shift[];
  myHoursCards: HoursCard[];
  todayHoursCard: HoursCard | null;

  // Shift state
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

  // Hours Card state
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
}

const initialState: WorkforceState = {
  staff: [],
  selectedStaff: null,
  staffLoading: false,
  staffError: null,
  staffFilters: {
    search: "",
    status: "",
    employment_type: "",
    department: "",
  },
  staffPagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  },

  myStaffProfile: null,
  myShifts: [],
  myHoursCards: [],
  todayHoursCard: null,

  shifts: [],
  selectedShift: null,
  shiftLoading: false,
  shiftError: null,
  shiftFilters: {
    search: "",
    staff: "",
    day_of_week: "",
    shift_type: "",
  },
  shiftPagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  },

  hoursCards: [],
  selectedHoursCard: null,
  hoursLoading: false,
  hoursError: null,
  hoursFilters: {
    search: "",
    staff: "",
    status: "",
    date_from: "",
    date_to: "",
  },
  hoursPagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
  },
};

// Staff Thunks
export const fetchStaffList = createAsyncThunk(
  "workforce/fetchStaffList",
  async (params: QueryParams | undefined) => {
    return await workforceApi.getStaffList(params);
  }
);

export const fetchStaff = createAsyncThunk(
  "workforce/fetchStaff",
  async (id: string) => {
    return await workforceApi.getStaff(id);
  }
);

export const createStaff = createAsyncThunk(
  "workforce/createStaff",
  async (data: StaffFormData) => {
    return await workforceApi.createStaff(data);
  }
);

export const updateStaff = createAsyncThunk(
  "workforce/updateStaff",
  async ({ id, data }: { id: string; data: Partial<StaffFormData> }) => {
    return await workforceApi.updateStaff(id, data);
  }
);

export const deleteStaff = createAsyncThunk(
  "workforce/deleteStaff",
  async (id: string) => {
    await workforceApi.deleteStaff(id);
  }
);

// Worker thunks
export const fetchMyShifts = createAsyncThunk(
  "workforce/fetchMyShifts",
  async () => {
    return await workforceApi.getMyShifts();
  }
);

export const fetchMyHoursCards = createAsyncThunk(
  "workforce/fetchMyHoursCards",
  async () => {
    return await workforceApi.getMyHoursCards();
  }
);

export const clockInAction = createAsyncThunk(
  "workforce/clockIn",
  async (
    data?: {
      latitude?: number;
      longitude?: number;
      timezone_offset?: number;
      staff_id?: string;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await workforceApi.clockIn(data);
    } catch (error: any) {
      // Extract the full error response from backend
      const errorData = error.response?.data || {
        error: error.message || "Failed to clock in"
      };
      return rejectWithValue(errorData);
    }
  }
);

export const clockOutAction = createAsyncThunk(
  "workforce/clockOut",
  async ({ hoursCardId, notes }: { hoursCardId: string; notes?: string }) => {
    return await workforceApi.clockOut(hoursCardId, notes);
  }
);

export const signHoursCardAction = createAsyncThunk(
  "workforce/signHoursCard",
  async ({ hoursCardId, signature }: { hoursCardId: string; signature: string }) => {
    return await workforceApi.signHoursCard(hoursCardId, signature);
  }
);

export const approveSignedHoursCardAction = createAsyncThunk(
  "workforce/approveSignedHoursCard",
  async ({
    hoursCardId,
    status,
    rejectionReason
  }: {
    hoursCardId: string;
    status: 'APPROVED' | 'REJECTED';
    rejectionReason?: string
  }) => {
    return await workforceApi.approveSignedHoursCard(hoursCardId, status, rejectionReason);
  }
);

// export const fetchMyStaffProfile = createAsyncThunk(
//   "workforce/fetchMyStaffProfile",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await workforceApi.getMyStaffProfile();
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to load profile");
//     }
//   }
// );

// export const fetchMyShifts = createAsyncThunk(
//   "workforce/fetchMyShifts",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await workforceApi.getMyShifts();
//       return response.results;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to load shifts");
//     }
//   }
// );

// export const fetchMyHoursCards = createAsyncThunk(
//   "workforce/fetchMyHoursCards",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await workforceApi.getMyHoursCards();
//       return response.results;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to load hours");
//     }
//   }
// );

// export const clockInAction = createAsyncThunk(
//   "workforce/clockIn",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await workforceApi.clockIn();
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to clock in");
//     }
//   }
// );

// export const clockOutAction = createAsyncThunk(
//   "workforce/clockOut",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await workforceApi.clockOut();
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to clock out");
//     }
//   }
// );

// export const startBreakAction = createAsyncThunk(
//   "workforce/startBreak",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await workforceApi.startBreak();
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to start break");
//     }
//   }
// );

// export const endBreakAction = createAsyncThunk(
//   "workforce/endBreak",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await workforceApi.endBreak();
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data || "Failed to end break");
//     }
//   }
// );

// Shift Thunks
export const fetchShiftList = createAsyncThunk(
  "workforce/fetchShiftList",
  async (params: QueryParams | undefined) => {
    return await workforceApi.getShiftList(params);
  }
);

export const fetchShift = createAsyncThunk(
  "workforce/fetchShift",
  async (id: string) => {
    return await workforceApi.getShift(id);
  }
);

export const createShift = createAsyncThunk(
  "workforce/createShift",
  async (data: ShiftFormData) => {
    return await workforceApi.createShift(data);
  }
);

export const updateShift = createAsyncThunk(
  "workforce/updateShift",
  async ({ id, data }: { id: string; data: Partial<ShiftFormData> }) => {
    return await workforceApi.updateShift(id, data);
  }
);

export const deleteShift = createAsyncThunk(
  "workforce/deleteShift",
  async (id: string) => {
    await workforceApi.deleteShift(id);
  }
);

// Hours Card Thunks
export const fetchHoursCardList = createAsyncThunk(
  "workforce/fetchHoursCardList",
  async (params: QueryParams | undefined) => {
    return await workforceApi.getHoursCardList(params);
  }
);

export const fetchHoursCard = createAsyncThunk(
  "workforce/fetchHoursCard",
  async (id: string) => {
    return await workforceApi.getHoursCard(id);
  }
);

export const createHoursCard = createAsyncThunk(
  "workforce/createHoursCard",
  async (data: HoursCardFormData) => {
    return await workforceApi.createHoursCard(data);
  }
);

export const updateHoursCard = createAsyncThunk(
  "workforce/updateHoursCard",
  async ({ id, data }: { id: string; data: Partial<HoursCardFormData> }) => {
    return await workforceApi.updateHoursCard(id, data);
  }
);

export const deleteHoursCard = createAsyncThunk(
  "workforce/deleteHoursCard",
  async (id: string) => {
    await workforceApi.deleteHoursCard(id);
  }
);

export const approveHoursCard = createAsyncThunk(
  "workforce/approveHoursCard",
  async (id: string) => {
    return await workforceApi.approveHoursCard(id);
  }
);

export const rejectHoursCard = createAsyncThunk(
  "workforce/rejectHoursCard",
  async ({ id, reason }: { id: string; reason: string }) => {
    return await workforceApi.rejectHoursCard(id, reason);
  }
);

const workforceSlice = createSlice({
  name: "workforce",
  initialState,
  reducers: {
    setSelectedStaff: (state, action: PayloadAction<BusinessStaff | null>) => {
      state.selectedStaff = action.payload;
    },
    setSelectedShift: (state, action: PayloadAction<Shift | null>) => {
      state.selectedShift = action.payload;
    },
    setSelectedHoursCard: (state, action: PayloadAction<HoursCard | null>) => {
      state.selectedHoursCard = action.payload;
    },
    setStaffFilters: (state, action: PayloadAction<Partial<StaffFilters>>) => {
      state.staffFilters = { ...state.staffFilters, ...action.payload };
    },
    resetStaffFilters: (state) => {
      state.staffFilters = initialState.staffFilters;
    },
    setShiftFilters: (state, action: PayloadAction<Partial<ShiftFilters>>) => {
      state.shiftFilters = { ...state.shiftFilters, ...action.payload };
    },
    resetShiftFilters: (state) => {
      state.shiftFilters = initialState.shiftFilters;
    },
    setHoursFilters: (
      state,
      action: PayloadAction<Partial<HoursCardFilters>>
    ) => {
      state.hoursFilters = { ...state.hoursFilters, ...action.payload };
    },
    resetHoursFilters: (state) => {
      state.hoursFilters = initialState.hoursFilters;
    },
    clearStaffError: (state) => {
      state.staffError = null;
    },
    clearShiftError: (state) => {
      state.shiftError = null;
    },
    clearHoursError: (state) => {
      state.hoursError = null;
    },
  },
  extraReducers: (builder) => {
    // Staff reducers
    builder
      .addCase(fetchStaffList.pending, (state) => {
        state.staffLoading = true;
        state.staffError = null;
      })
      .addCase(fetchStaffList.fulfilled, (state, action) => {
        state.staffLoading = false;
        state.staff = action.payload.results;
        state.staffPagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          currentPage: state.staffPagination.currentPage,
          hasNext: Boolean(action.payload.next),
          hasPrevious: Boolean(action.payload.previous),
        };
      })
      .addCase(fetchStaffList.rejected, (state, action) => {
        state.staffLoading = false;
        state.staffError = action.error.message || "Failed to fetch staff";
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.selectedStaff = action.payload;
      })
      .addCase(createStaff.pending, (state) => {
        state.staffLoading = true;
        state.staffError = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.staffLoading = false;
        state.staff.unshift(action.payload);
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.staffLoading = false;
        state.staffError = action.error.message || "Failed to create staff";
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staff.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
        if (state.selectedStaff?.id === action.payload.id) {
          state.selectedStaff = action.payload;
        }
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter((s) => s.id !== action.meta.arg);
        if (state.selectedStaff?.id === action.meta.arg) {
          state.selectedStaff = null;
        }
      })

      // Shift reducers
      .addCase(fetchShiftList.pending, (state) => {
        state.shiftLoading = true;
        state.shiftError = null;
      })
      .addCase(fetchShiftList.fulfilled, (state, action) => {
        state.shiftLoading = false;
        state.shifts = action.payload.results;
        state.shiftPagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          currentPage: state.shiftPagination.currentPage,
          hasNext: Boolean(action.payload.next),
          hasPrevious: Boolean(action.payload.previous),
        };
      })
      .addCase(fetchShiftList.rejected, (state, action) => {
        state.shiftLoading = false;
        state.shiftError = action.error.message || "Failed to fetch shifts";
      })
      .addCase(fetchShift.fulfilled, (state, action) => {
        state.selectedShift = action.payload;
      })
      .addCase(createShift.pending, (state) => {
        state.shiftLoading = true;
        state.shiftError = null;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.shiftLoading = false;
        state.shifts.unshift(action.payload);
      })
      .addCase(createShift.rejected, (state, action) => {
        state.shiftLoading = false;
        state.shiftError = action.error.message || "Failed to create shift";
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        const index = state.shifts.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
        if (state.selectedShift?.id === action.payload.id) {
          state.selectedShift = action.payload;
        }
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter((s) => s.id !== action.meta.arg);
        if (state.selectedShift?.id === action.meta.arg) {
          state.selectedShift = null;
        }
      })

      // Hours Card reducers
      .addCase(fetchHoursCardList.pending, (state) => {
        state.hoursLoading = true;
        state.hoursError = null;
      })
      .addCase(fetchHoursCardList.fulfilled, (state, action) => {
        state.hoursLoading = false;
        state.hoursCards = action.payload.results;
        state.hoursPagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          currentPage: state.hoursPagination.currentPage,
          hasNext: Boolean(action.payload.next),
          hasPrevious: Boolean(action.payload.previous),
        };
      })
      .addCase(fetchHoursCardList.rejected, (state, action) => {
        state.hoursLoading = false;
        state.hoursError =
          action.error.message || "Failed to fetch hours cards";
      })
      .addCase(fetchHoursCard.fulfilled, (state, action) => {
        state.selectedHoursCard = action.payload;
      })
      .addCase(createHoursCard.pending, (state) => {
        state.hoursLoading = true;
        state.hoursError = null;
      })
      .addCase(createHoursCard.fulfilled, (state, action) => {
        state.hoursLoading = false;
        state.hoursCards.unshift(action.payload);
      })
      .addCase(createHoursCard.rejected, (state, action) => {
        state.hoursLoading = false;
        state.hoursError =
          action.error.message || "Failed to create hours card";
      })
      .addCase(updateHoursCard.fulfilled, (state, action) => {
        const index = state.hoursCards.findIndex(
          (h) => h.id === action.payload.id
        );
        if (index !== -1) {
          state.hoursCards[index] = action.payload;
        }
        if (state.selectedHoursCard?.id === action.payload.id) {
          state.selectedHoursCard = action.payload;
        }
      })
      .addCase(deleteHoursCard.fulfilled, (state, action) => {
        state.hoursCards = state.hoursCards.filter(
          (h) => h.id !== action.meta.arg
        );
        if (state.selectedHoursCard?.id === action.meta.arg) {
          state.selectedHoursCard = null;
        }
      })
      .addCase(approveHoursCard.fulfilled, (state, action) => {
        const index = state.hoursCards.findIndex(
          (h) => h.id === action.payload.id
        );
        if (index !== -1) {
          state.hoursCards[index] = action.payload;
        }
        if (state.selectedHoursCard?.id === action.payload.id) {
          state.selectedHoursCard = action.payload;
        }
      })
      .addCase(rejectHoursCard.fulfilled, (state, action) => {
        const index = state.hoursCards.findIndex(
          (h) => h.id === action.payload.id
        );
        if (index !== -1) {
          state.hoursCards[index] = action.payload;
        }
        if (state.selectedHoursCard?.id === action.payload.id) {
          state.selectedHoursCard = action.payload;
        }
      })
      // Worker reducers
.addCase(fetchMyShifts.fulfilled, (state, action) => {
  state.myShifts = action.payload;
})
.addCase(fetchMyHoursCards.fulfilled, (state, action) => {
  state.myHoursCards = action.payload;
  // Set today's hours card if exists and not clocked out
  const today = new Date().toISOString().split('T')[0];
  state.todayHoursCard = action.payload.find(
    (h: HoursCard) => h.date === today && !h.clock_out
  ) || null;
})
.addCase(clockInAction.fulfilled, (state, action) => {
  state.todayHoursCard = action.payload;
  state.myHoursCards.unshift(action.payload);
})
.addCase(clockOutAction.fulfilled, (state, action) => {
  state.todayHoursCard = null;
  const index = state.myHoursCards.findIndex((h) => h.id === action.payload.id);
  if (index !== -1) {
    state.myHoursCards[index] = action.payload;
  }
})
.addCase(signHoursCardAction.fulfilled, (state, action) => {
  const index = state.myHoursCards.findIndex((h) => h.id === action.payload.id);
  if (index !== -1) {
    state.myHoursCards[index] = action.payload;
  }
})
.addCase(approveSignedHoursCardAction.fulfilled, (state, action) => {
  const index = state.hoursCards.findIndex((h) => h.id === action.payload.id);
  if (index !== -1) {
    state.hoursCards[index] = action.payload;
  }
  if (state.selectedHoursCard?.id === action.payload.id) {
    state.selectedHoursCard = action.payload;
  }
})
      // .addCase(fetchMyStaffProfile.pending, (state) => {
      //   state.staffLoading = true;
      // })
      // .addCase(fetchMyStaffProfile.fulfilled, (state, action) => {
      //   state.staffLoading = false;
      //   state.myStaffProfile = action.payload;
      // })
      // .addCase(fetchMyStaffProfile.rejected, (state) => {
      //   state.staffLoading = false;
      // })
      // .addCase(fetchMyShifts.fulfilled, (state, action) => {
      //   state.myShifts = action.payload;
      // })
      // .addCase(fetchMyHoursCards.fulfilled, (state, action) => {
      //   state.myHoursCards = action.payload;
      //   // Set today's hours card
      //   const today = new Date().toISOString().split('T')[0];
      //   state.todayHoursCard = action.payload.find(
      //     (h: HoursCard) => h.date === today && !h.clock_out
      //   ) || null;
      // })
      // .addCase(clockInAction.fulfilled, (state, action) => {
      //   state.todayHoursCard = action.payload;
      //   state.myHoursCards.unshift(action.payload);
      // })
      // .addCase(clockOutAction.fulfilled, (state, action) => {
      //   state.todayHoursCard = action.payload;
      //   const index = state.myHoursCards.findIndex(
      //     (h) => h.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.myHoursCards[index] = action.payload;
      //   }
      // })
      // .addCase(startBreakAction.fulfilled, (state, action) => {
      //   state.todayHoursCard = action.payload;
      //   const index = state.myHoursCards.findIndex(
      //     (h) => h.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.myHoursCards[index] = action.payload;
      //   }
      // })
      // .addCase(endBreakAction.fulfilled, (state, action) => {
      //   state.todayHoursCard = action.payload;
      //   const index = state.myHoursCards.findIndex(
      //     (h) => h.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.myHoursCards[index] = action.payload;
      //   }
      // })
  },
});

export const {
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
} = workforceSlice.actions;

export default workforceSlice.reducer;
