"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  X,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkforce } from "@/lib/redux/use-workforce";
import {
  Shift,
  ShiftFormData,
  ShiftType,
  DayOfWeek,
  BusinessStaff,
} from "@/lib/workforce-types";
import { toast } from "sonner";
import { useBusiness } from "@/lib/redux/useBusiness";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ShiftModalProps {
  shift: Shift | null;
  onClose: () => void;
  businessId: string;
  staffList: BusinessStaff[];
}

type SortField = "name" | "shift_type" | "day_of_week" | "start_time";
type SortDirection = "asc" | "desc";

const ShiftManagementPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  const [localDayFilter, setLocalDayFilter] = useState<string>("all");
  const [localShiftTypeFilter, setLocalShiftTypeFilter] = useState<string>("all");
  const [localStaffFilter, setLocalStaffFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("day_of_week");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { businesses, loading: businessLoading, loadBusinesses } = useBusiness();
  const {
    shifts,
    selectedShift,
    shiftLoading,
    shiftError,
    shiftPagination,
    staff,
    loadShifts,
    loadStaff,
    removeShift,
    selectShift,
    clearShiftError,
  } = useWorkforce();

  const business = businesses[0] || null;
  const businessId = business?.id || "";
  const router = useRouter();

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (businessId) {
      loadStaff();
    }
  }, [businessId, loadStaff]);

  useEffect(() => {
    if (businessId) {
      loadShifts({
        page: currentPage,
        search: localSearchTerm,
        day_of_week: localDayFilter === "all" ? "" : (localDayFilter as DayOfWeek),
        shift_type: localShiftTypeFilter === "all" ? "" : (localShiftTypeFilter as ShiftType),
        staff: localStaffFilter === "all" ? "" : localStaffFilter,
        ordering: sortDirection === "desc" ? `-${sortField}` : sortField,
      });
    }
  }, [
    businessId,
    currentPage,
    localSearchTerm,
    localDayFilter,
    localShiftTypeFilter,
    localStaffFilter,
    sortField,
    sortDirection,
    loadShifts,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearchTerm, localDayFilter, localShiftTypeFilter, localStaffFilter]);

  const handleDeleteShift = async (shiftId: string, shiftName: string) => {
    if (window.confirm(`Are you sure you want to delete shift: ${shiftName}?`)) {
      try {
        await removeShift(shiftId);
        toast.success("Shift deleted successfully");
        loadShifts({
          page: currentPage,
          search: localSearchTerm,
          day_of_week: localDayFilter === "all" ? "" : (localDayFilter as DayOfWeek),
          shift_type: localShiftTypeFilter === "all" ? "" : (localShiftTypeFilter as ShiftType),
          staff: localStaffFilter === "all" ? "" : localStaffFilter,
          ordering: sortDirection === "desc" ? `-${sortField}` : sortField,
        });
      } catch {
        toast("Failed to delete shift");
      }
    }
  };

  const handleEditShift = (shift: Shift) => {
    selectShift(shift);
    setShowCreateModal(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (shiftPagination.hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (shiftPagination.hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(shiftPagination.count / itemsPerPage);

  const getShiftTypeBadge = (type: ShiftType) => {
    const typeConfig = {
      MORNING: { label: "Morning", color: "bg-amber-50 text-amber-600 border border-amber-200" },
      AFTERNOON: { label: "Afternoon", color: "bg-orange-50 text-orange-600 border border-orange-200" },
      EVENING: { label: "Evening", color: "bg-purple-50 text-purple-600 border border-purple-200" },
      NIGHT: { label: "Night", color: "bg-blue-50 text-blue-500 border border-blue-200" },
      FULL_DAY: { label: "Full Day", color: "bg-green-50 text-green-600 border border-green-200" },
    };

    const config = typeConfig[type] || typeConfig.MORNING;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getDayBadge = (day: DayOfWeek) => {
    const dayColors: Record<DayOfWeek, string> = {
      MONDAY: "bg-blue-50 text-blue-500 border border-blue-200",
      TUESDAY: "bg-green-50 text-green-600 border border-green-200",
      WEDNESDAY: "bg-amber-50 text-amber-600 border border-amber-200",
      THURSDAY: "bg-orange-50 text-orange-600 border border-orange-200",
      FRIDAY: "bg-purple-50 text-purple-600 border border-purple-200",
      SATURDAY: "bg-pink-50 text-pink-600 border border-pink-200",
      SUNDAY: "bg-red-50 text-red-600 border border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${dayColors[day]}`}
      >
        {day.charAt(0) + day.slice(1).toLowerCase()}
      </span>
    );
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <th
      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field &&
          (sortDirection === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          ))}
      </div>
    </th>
  );

  const ShiftModal: React.FC<ShiftModalProps> = ({
    shift,
    onClose,
    businessId,
    staffList,
  }) => {
    const [formData, setFormData] = useState<ShiftFormData>({
      staff: shift?.staff || "",
      name: shift?.name || "",
      shift_type: shift?.shift_type || "MORNING",
      day_of_week: shift?.day_of_week || "MONDAY",
      start_time: shift?.start_time || "",
      end_time: shift?.end_time || "",
      break_duration: shift?.break_duration || "",
      is_active: shift?.is_active !== undefined ? shift.is_active : true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    const { addShift, editShift } = useWorkforce();

    useEffect(() => {
      if (shift) {
        setFormData({
          staff: shift.staff || "",
          name: shift.name || "",
          shift_type: shift.shift_type || "MORNING",
          day_of_week: shift.day_of_week || "MONDAY",
          start_time: shift.start_time || "",
          end_time: shift.end_time || "",
          break_duration: shift.break_duration || "",
          is_active: shift.is_active !== undefined ? shift.is_active : true,
        });
      }
    }, [shift]);

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.staff) newErrors.staff = "Staff member is required";
      if (!formData.name.trim()) newErrors.name = "Shift name is required";
      if (!formData.start_time) newErrors.start_time = "Start time is required";
      if (!formData.end_time) newErrors.end_time = "End time is required";

      if (formData.start_time && formData.end_time) {
        if (formData.start_time >= formData.end_time) {
          newErrors.end_time = "End time must be after start time";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (): Promise<void> => {
      if (!validateForm()) return;

      setSubmitting(true);
      try {
        const submitData = {
          ...formData,
          business: businessId,
        };

        if (shift) {
          await editShift(shift.id, submitData);
          toast.success("Shift updated successfully!");
        } else {
          await addShift(submitData);
          toast.success("Shift created successfully!");
        }
        onClose();
        selectShift(null);
        loadShifts({
          page: currentPage,
          search: localSearchTerm,
          day_of_week: localDayFilter === "all" ? "" : (localDayFilter as DayOfWeek),
          shift_type: localShiftTypeFilter === "all" ? "" : (localShiftTypeFilter as ShiftType),
          staff: localStaffFilter === "all" ? "" : localStaffFilter,
          ordering: sortDirection === "desc" ? `-${sortField}` : sortField,
        });
      } catch (error: unknown) {
        let errorMessage = "Failed to save shift. Please try again.";

        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.detail || errorMessage;
        }

        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-full w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {shift ? "Edit Shift" : "Create New Shift"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Member *
                  </label>
                  <select
                    value={formData.staff}
                    onChange={(e) =>
                      setFormData({ ...formData, staff: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.staff ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select staff member</option>
                    {staffList
                      .filter((s) => s.status === "ACTIVE")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} - {s.job_title}
                        </option>
                      ))}
                  </select>
                  {errors.staff && (
                    <p className="text-red-600 text-sm mt-1">{errors.staff}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Morning Shift"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Type *
                  </label>
                  <select
                    value={formData.shift_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shift_type: e.target.value as ShiftType,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                    <option value="FULL_DAY">Full Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week *
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        day_of_week: e.target.value as DayOfWeek,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MONDAY">Monday</option>
                    <option value="TUESDAY">Tuesday</option>
                    <option value="WEDNESDAY">Wednesday</option>
                    <option value="THURSDAY">Thursday</option>
                    <option value="FRIDAY">Friday</option>
                    <option value="SATURDAY">Saturday</option>
                    <option value="SUNDAY">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.start_time ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.start_time && (
                    <p className="text-red-600 text-sm mt-1">{errors.start_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.end_time ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.end_time && (
                    <p className="text-red-600 text-sm mt-1">{errors.end_time}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Duration (Optional)
                </label>
                <input
                  type="text"
                  value={formData.break_duration}
                  onChange={(e) =>
                    setFormData({ ...formData, break_duration: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00:30:00 (HH:MM:SS)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: HH:MM:SS (e.g., 00:30:00 for 30 minutes)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Active Shift
                </label>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end space-x-0 sm:space-x-3 gap-4 sm:gap-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600 min-w-[120px] py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white min-w-[120px] py-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" />
                  {shift ? "Updating..." : "Creating..."}
                </>
              ) : shift ? (
                "Update Shift"
              ) : (
                "Create Shift"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!businessLoading && !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 text-center">
          <AlertCircle className="w-16 sm:w-20 h-16 sm:h-20 text-amber-600 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            No Business Profile Found
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            You need to create your business profile before managing shifts.
          </p>
          <Button
            onClick={() => router.push("/business")}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white min-w-[160px] py-3"
          >
            Create Business Profile
          </Button>
        </div>
      </div>
    );
  }

  const activeShifts = shifts.filter((s) => s.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50 -mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {shiftError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">{shiftError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearShiftError}
                  className="mt-2 border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Shift Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Schedule and manage work shifts for your team
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto min-w-0">
              <Button
                onClick={() => {
                  selectShift(null);
                  setShowCreateModal(true);
                }}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white shadow-sm min-w-[120px] py-3"
              >
                <Plus className="w-4 h-4 mr-2 text-amber-600" />
                Create Shift
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {shiftPagination.count}
                </p>
                <p className="text-gray-600 text-sm">Total Shifts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {activeShifts}
                </p>
                <p className="text-gray-600 text-sm">Active Shifts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {staff.filter((s) => s.status === "ACTIVE").length}
                </p>
                <p className="text-gray-600 text-sm">Active Staff</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-amber-600 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by shift name or staff..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-600" />
                <select
                  value={localDayFilter}
                  onChange={(e) => setLocalDayFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Days</option>
                  <option value="MONDAY">Monday</option>
                  <option value="TUESDAY">Tuesday</option>
                  <option value="WEDNESDAY">Wednesday</option>
                  <option value="THURSDAY">Thursday</option>
                  <option value="FRIDAY">Friday</option>
                  <option value="SATURDAY">Saturday</option>
                  <option value="SUNDAY">Sunday</option>
                </select>
              </div>
              <select
                value={localShiftTypeFilter}
                onChange={(e) => setLocalShiftTypeFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="MORNING">Morning</option>
                <option value="AFTERNOON">Afternoon</option>
                <option value="EVENING">Evening</option>
                <option value="NIGHT">Night</option>
                <option value="FULL_DAY">Full Day</option>
              </select>
              <select
                value={localStaffFilter}
                onChange={(e) => setLocalStaffFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Staff</option>
                {staff
                  .filter((s) => s.status === "ACTIVE")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {shiftLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading shifts...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
            <Calendar className="w-16 sm:w-20 h-16 sm:h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">
              No shifts scheduled yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
              Start scheduling shifts for your team members.
            </p>
            <Button
              onClick={() => {
                selectShift(null);
                setShowCreateModal(true);
              }}
              size="lg"
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white shadow-sm min-w-[160px] py-3"
            >
              <Plus className="w-5 h-5 mr-2 text-amber-600" />
              Create Your First Shift
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader field="name">Shift Name</SortableHeader>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Staff Member
                      </th>
                      <SortableHeader field="day_of_week">Day</SortableHeader>
                      <SortableHeader field="shift_type">Type</SortableHeader>
                      <SortableHeader field="start_time">Time</SortableHeader>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shifts.map((shift) => {
                      const staffMember = staff.find((s) => s.id === shift.staff);
                      return (
                        <tr
                          key={shift.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {shift.name}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {staffMember?.name || "N/A"} - {staffMember?.job_title || ""}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">{staffMember?.name || "N/A"}</div>
                            <div className="text-sm text-gray-500">{staffMember?.job_title}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {getDayBadge(shift.day_of_week)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {getShiftTypeBadge(shift.shift_type)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {shift.start_time} - {shift.end_time}
                            </div>
                            {shift.break_duration && (
                              <div className="text-xs text-gray-500">
                                Break: {shift.break_duration}
                              </div>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {shift.is_active ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4 text-blue-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditShift(shift)}>
                                  <Edit2 className="w-4 h-4 mr-2 text-blue-500" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteShift(shift.id, shift.name)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {shiftPagination.count > itemsPerPage && (
              <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg gap-4 sm:gap-0">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={!shiftPagination.hasPrevious || shiftLoading}
                    variant="outline"
                    className="w-full sm:w-auto border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600 min-w-[120px] py-3"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={!shiftPagination.hasNext || shiftLoading}
                    variant="outline"
                    className="w-full sm:w-auto border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600 min-w-[120px] py-3"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, shiftPagination.count)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{shiftPagination.count}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        onClick={handlePreviousPage}
                        disabled={!shiftPagination.hasPrevious || shiftLoading}
                        variant="outline"
                        className="rounded-r-none border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          );
                        })
                        .map((page, index, array) => {
                          if (index > 0 && page - array[index - 1] > 1) {
                            return (
                              <React.Fragment key={`ellipsis-${page}`}>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>
                                <Button
                                  onClick={() => setCurrentPage(page)}
                                  variant={currentPage === page ? "default" : "outline"}
                                  className="rounded-none border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                                  disabled={shiftLoading}
                                >
                                  {page}
                                </Button>
                              </React.Fragment>
                            );
                          }
                          return (
                            <Button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              variant={currentPage === page ? "default" : "outline"}
                              className="rounded-none border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                              disabled={shiftLoading}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      <Button
                        onClick={handleNextPage}
                        disabled={!shiftPagination.hasNext || shiftLoading}
                        variant="outline"
                        className="rounded-l-none border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {showCreateModal && (
          <ShiftModal
            shift={selectedShift}
            businessId={businessId}
            staffList={staff}
            onClose={() => {
              setShowCreateModal(false);
              selectShift(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ShiftManagementPage;
