"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
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
import MultiSelect from "./multiple-shift-select";
import { cn } from "@/lib/utils";

type SortField = "name" | "shift_type" | "day_of_week" | "start_time";
type SortDirection = "asc" | "desc";

const SHIFT_TYPE_CONFIG: Record<ShiftType, { label: string; color: string }> = {
  MORNING: {
    label: "Morning",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  AFTERNOON: {
    label: "Afternoon",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  EVENING: {
    label: "Evening",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  NIGHT: { label: "Night", color: "bg-blue-50 text-blue-700 border-blue-200" },
  FULL_DAY: {
    label: "Full Day",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const DAY_COLORS: Record<DayOfWeek, string> = {
  MONDAY: "bg-blue-50 text-blue-700 border-blue-200",
  TUESDAY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WEDNESDAY: "bg-amber-50 text-amber-700 border-amber-200",
  THURSDAY: "bg-orange-50 text-orange-700 border-orange-200",
  FRIDAY: "bg-violet-50 text-violet-700 border-violet-200",
  SATURDAY: "bg-pink-50 text-pink-700 border-pink-200",
  SUNDAY: "bg-red-50 text-red-700 border-red-200",
};

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function ShiftTypeBadge({ type }: { type: ShiftType }) {
  const c = SHIFT_TYPE_CONFIG[type] ?? SHIFT_TYPE_CONFIG.MORNING;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        c.color
      )}
    >
      {c.label}
    </span>
  );
}

function DayBadge({ day }: { day: DayOfWeek }) {
  if (!day)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-500 border-gray-200">
        N/A
      </span>
    );
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        DAY_COLORS[day]
      )}
    >
      {day.charAt(0) + day.slice(1).toLowerCase()}
    </span>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-20 hidden md:block" />
      <div className="flex gap-1 hidden sm:flex">
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
      </div>
      <div className="h-5 w-16 bg-gray-100 rounded-full hidden md:block" />
      <div className="h-3 bg-gray-100 rounded w-20 hidden lg:block" />
      <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
    </div>
  );
}

const labelCls =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const inputCls = (err?: string) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    err ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"
  );
const selectCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

interface ShiftModalProps {
  shift: Shift | null;
  onClose: () => void;
  businessId: string;
  staffList: BusinessStaff[];
}

function ShiftModal({
  shift,
  onClose,
  businessId,
  staffList,
}: ShiftModalProps) {
  const { addShift, editShift, selectShift } = useWorkforce();

  const [formData, setFormData] = useState<ShiftFormData>({
    staff: shift?.staff
      ? Array.isArray(shift.staff)
        ? shift.staff
        : [shift.staff]
      : [],
    name: shift?.name || "",
    shift_type: shift?.shift_type || "MORNING",
    day_of_week: shift?.day_of_week
      ? Array.isArray(shift.day_of_week)
        ? shift.day_of_week
        : [shift.day_of_week]
      : [],
    start_time: shift?.start_time || "",
    end_time: shift?.end_time || "",
    break_duration: shift?.break_duration || "",
    is_active: shift?.is_active !== undefined ? shift.is_active : true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (shift) {
      const s = shift as Shift & { days?: DayOfWeek[] };
      setFormData({
        staff: Array.isArray(shift.staff)
          ? shift.staff
          : shift.staff
          ? [shift.staff]
          : [],
        name: shift.name || "",
        shift_type: shift.shift_type || "MORNING",
        day_of_week: s.days
          ? s.days
          : Array.isArray(shift.day_of_week)
          ? shift.day_of_week
          : shift.day_of_week
          ? [shift.day_of_week]
          : [],
        start_time: shift.start_time || "",
        end_time: shift.end_time || "",
        break_duration: shift.break_duration || "",
        is_active: shift.is_active !== undefined ? shift.is_active : true,
      });
    }
  }, [shift]);

  const set = (k: keyof ShiftFormData, v: unknown) => {
    setFormData((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.staff?.length)
      e.staff = "At least one staff member is required";
    if (!formData.name.trim()) e.name = "Shift name is required";
    if (!formData.start_time) e.start_time = "Start time is required";
    if (!formData.end_time) e.end_time = "End time is required";
    if (
      formData.start_time &&
      formData.end_time &&
      formData.start_time >= formData.end_time
    )
      e.end_time = "End time must be after start time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...formData, business: businessId };
      if (shift) {
        await editShift(shift.id, payload);
        toast.success("Shift updated!");
      } else {
        await addShift(payload);
        toast.success("Shift created!");
      }
      onClose();
      selectShift(null);
    } catch (err) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.detail || "Failed to save shift"
          : "Failed to save shift"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const timeAmPm = (t: string) =>
    t ? (parseInt(t.split(":")[0]) >= 12 ? "PM" : "AM") : "";
  const toggleAmPm = (field: "start_time" | "end_time", period: string) => {
    const t = formData[field] as string;
    if (!t) return;
    const [h, m] = t.split(":").map(Number);
    let hour = h;
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour >= 12) hour -= 12;
    set(
      field,
      `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="px-6 py-5 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {shift ? "Edit Shift" : "Create New Shift"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Assignment */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Assignment
            </p>
            <div>
              <label className={labelCls}>
                Staff Members{" "}
                <span className="text-red-500 normal-case font-normal">*</span>
              </label>
              <MultiSelect
                options={staffList
                  .filter((s) => s.status === "ACTIVE")
                  .map((s) => ({
                    value: s.id,
                    label: `${s.name} — ${s.job_title}`,
                  }))}
                selected={formData.staff as string[]}
                onChange={(vals) => set("staff", vals)}
                placeholder="Select staff members"
                error={!!errors.staff}
              />
              {errors.staff && (
                <p className="text-red-500 text-xs mt-1">{errors.staff}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Shift Name{" "}
                  <span className="text-red-500 normal-case font-normal">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Morning Shift"
                  className={inputCls(errors.name)}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Shift Type</label>
                <select
                  value={formData.shift_type as string}
                  onChange={(e) =>
                    set("shift_type", e.target.value as ShiftType)
                  }
                  className={selectCls}
                >
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                  <option value="FULL_DAY">Full Day</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Days of Week</label>
              <MultiSelect
                options={DAY_ORDER.map((d) => ({
                  value: d,
                  label: d.charAt(0) + d.slice(1).toLowerCase(),
                }))}
                selected={formData.day_of_week as string[]}
                onChange={(vals) => set("day_of_week", vals as DayOfWeek[])}
                placeholder="Select days"
                error={!!errors.day_of_week}
              />
              {errors.day_of_week && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.day_of_week}
                </p>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Schedule
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {(["start_time", "end_time"] as const).map((field) => (
                <div key={field}>
                  <label className={labelCls}>
                    {field === "start_time" ? "Start Time" : "End Time"}{" "}
                    <span className="text-red-500 normal-case font-normal">
                      *
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={formData[field] as string}
                      onChange={(e) => set(field, e.target.value)}
                      className={cn(
                        "flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        errors[field]
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200 bg-white"
                      )}
                    />
                    <select
                      value={timeAmPm(formData[field] as string)}
                      onChange={(e) => toggleAmPm(field, e.target.value)}
                      className="px-2.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">--</option>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  {errors[field] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className={labelCls}>
                Break Duration{" "}
                <span className="text-gray-300 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={formData.break_duration as string}
                onChange={(e) => set("break_duration", e.target.value)}
                placeholder="00:30:00 (HH:MM:SS)"
                className={inputCls()}
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: HH:MM:SS — e.g. 00:30:00 for 30 minutes
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={cn(
                  "w-9 h-5 rounded-full relative transition-colors",
                  formData.is_active ? "bg-blue-600" : "bg-gray-200"
                )}
                onClick={() => set("is_active", !formData.is_active)}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                    formData.is_active ? "left-4" : "left-0.5"
                  )}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Active shift
              </span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl flex gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border-gray-200 h-10 rounded-xl font-semibold text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl font-semibold text-sm shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
}

// ── Main page ──────────────────────────────────────────────────────────────────
const ShiftManagementPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("day_of_week");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { businesses, loading: bizLoading, loadBusinesses } = useBusiness();
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

  const business = businesses[0] ?? null;
  const businessId = business?.id ?? "";
  const router = useRouter();

  const reloadParams = {
    page,
    search,
    day_of_week: (dayFilter === "all" ? "" : dayFilter) as DayOfWeek | "",
    shift_type: (typeFilter === "all" ? "" : typeFilter) as ShiftType | "",
    staff: staffFilter === "all" ? "" : staffFilter,
    ordering: sortDir === "desc" ? `-${sortField}` : sortField,
  };

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);
  useEffect(() => {
    if (businessId) loadStaff();
  }, [businessId, loadStaff]);
  useEffect(() => {
    if (!businessId) return;
    loadShifts({
      page,
      search,
      day_of_week: (dayFilter === "all" ? "" : dayFilter) as DayOfWeek | "",
      shift_type: (typeFilter === "all" ? "" : typeFilter) as ShiftType | "",
      staff: staffFilter === "all" ? "" : staffFilter,
      ordering: sortDir === "desc" ? `-${sortField}` : sortField,
    });
  }, [
    businessId,
    page,
    search,
    dayFilter,
    typeFilter,
    staffFilter,
    sortField,
    sortDir,
    loadShifts,
  ]);
  useEffect(() => {
    setPage(1);
  }, [search, dayFilter, typeFilter, staffFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleDelete = async (ids: string[], name: string) => {
    if (!window.confirm(`Delete shift: ${name}?`)) return;
    try {
      await Promise.all(ids.map((id) => removeShift(id)));
      toast.success("Shift deleted");
      loadShifts(reloadParams);
    } catch {
      toast.error("Failed to delete shift");
    }
  };

  const handleEdit = (
    shift: Shift & { days: DayOfWeek[]; shift_ids: string[] }
  ) => {
    selectShift({
      ...shift,
      day_of_week: shift.days[0],
      days: shift.days,
    } as Shift);
    setShowModal(true);
  };

  const groupShifts = (shifts: Shift[]) => {
    const map = shifts.reduce((acc, s) => {
      const key = `${s.name}-${s.staff}-${s.shift_type}`;
      if (!acc[key])
        acc[key] = { ...s, days: [s.day_of_week], shift_ids: [s.id] };
      else {
        acc[key].days.push(s.day_of_week);
        acc[key].shift_ids.push(s.id);
      }
      return acc;
    }, {} as Record<string, Shift & { days: DayOfWeek[]; shift_ids: string[] }>);
    return Object.values(map);
  };

  const totalPages = Math.ceil(shiftPagination.count / itemsPerPage);
  const groupedShifts = groupShifts(shifts);
  const hasFilters =
    search ||
    dayFilter !== "all" ||
    typeFilter !== "all" ||
    staffFilter !== "all";

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 ml-1" />
    );
  }
  function ColHeader({ field, label }: { field: SortField; label: string }) {
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-700 transition-colors"
      >
        {label}
        <SortIcon field={field} />
      </button>
    );
  }

  if (!bizLoading && !business) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm mx-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            No Business Profile
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Create your business profile before managing shifts.
          </p>
          <Button
            onClick={() => router.push("/business")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          >
            Create Business Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* Error */}
        {shiftError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{shiftError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearShiftError}
              className="border-red-200 text-red-700 hover:bg-red-100 shrink-0 h-8 px-3 text-xs rounded-xl"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Shift Management
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Schedule and manage work shifts for your team
            </p>
          </div>
          <Button
            onClick={() => {
              selectShift(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-xl font-semibold text-sm shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Shift
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Shifts",
              value: groupedShifts.length,
              border: "border-blue-100",
              text: "text-gray-900",
            },
            {
              label: "Active Shifts",
              value: groupedShifts.filter((s) => s.is_active).length,
              border: "border-emerald-100",
              text: "text-emerald-700",
            },
            {
              label: "Active Staff",
              value: staff.filter((s) => s.status === "ACTIVE").length,
              border: "border-violet-100",
              text: "text-violet-700",
            },
          ].map(({ label, value, border, text }) => (
            <div
              key={label}
              className={cn("bg-white rounded-2xl border p-5", border)}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                {label}
              </p>
              <p className={cn("text-2xl font-bold", text)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-gray-50">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search shifts or staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Days</option>
              {DAY_ORDER.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="MORNING">Morning</option>
              <option value="AFTERNOON">Afternoon</option>
              <option value="EVENING">Evening</option>
              <option value="NIGHT">Night</option>
              <option value="FULL_DAY">Full Day</option>
            </select>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setDayFilter("all");
                  setTypeFilter("all");
                  setStaffFilter("all");
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
            <span className="ml-auto text-xs text-gray-400 font-medium whitespace-nowrap">
              {groupedShifts.length}{" "}
              {groupedShifts.length === 1 ? "shift" : "shifts"}
            </span>
          </div>

          {shiftLoading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No shifts found
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mb-5">
                {hasFilters
                  ? "Try adjusting your filters."
                  : "Start scheduling shifts for your team members."}
              </p>
              {!hasFilters && (
                <Button
                  onClick={() => {
                    selectShift(null);
                    setShowModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-xl font-semibold text-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create First Shift
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="hidden lg:grid grid-cols-[2fr_1.5fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-2.5 bg-gray-50/60 border-b border-gray-50">
                <ColHeader field="name" label="Shift Name" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Staff
                </span>
                <ColHeader field="day_of_week" label="Days" />
                <ColHeader field="shift_type" label="Type" />
                <ColHeader field="start_time" label="Time" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Status
                </span>
                <span />
              </div>

              <div className="divide-y divide-gray-50">
                {groupedShifts.map((shift) => {
                  const member = staff.find((s) => s.id === shift.staff);
                  return (
                    <div
                      key={shift.id}
                      className="grid grid-cols-[1fr_auto] lg:grid-cols-[2fr_1.5fr_2fr_1fr_1.5fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Name */}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {shift.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate lg:hidden">
                          {member?.name || "—"}
                        </p>
                        <div className="flex gap-1.5 mt-1 lg:hidden flex-wrap">
                          <ShiftTypeBadge type={shift.shift_type} />
                        </div>
                      </div>

                      <div className="hidden lg:block text-sm text-gray-700 truncate">
                        <p className="font-medium truncate">
                          {member?.name || "—"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {member?.job_title}
                        </p>
                      </div>

                      <div className="hidden lg:flex flex-wrap gap-1">
                        {[...shift.days]
                          .sort(
                            (a, b) =>
                              DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
                          )
                          .map((d) => (
                            <DayBadge key={d} day={d} />
                          ))}
                      </div>

                      <div className="hidden lg:block">
                        <ShiftTypeBadge type={shift.shift_type} />
                      </div>

                      <div className="hidden lg:block">
                        <p className="text-sm text-gray-700 whitespace-nowrap">
                          {shift.start_time} – {shift.end_time}
                        </p>
                        {shift.break_duration && (
                          <p className="text-xs text-gray-400">
                            Break: {shift.break_duration}
                          </p>
                        )}
                      </div>

                      <div className="hidden lg:block">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                            shift.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                          )}
                        >
                          {shift.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => handleEdit(shift)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDelete(shift.shift_ids, shift.name)
                            }
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {shiftPagination.count > itemsPerPage && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
                  <p className="text-xs text-gray-400">
                    {(page - 1) * itemsPerPage + 1}–
                    {Math.min(page * itemsPerPage, shiftPagination.count)} of{" "}
                    {shiftPagination.count}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!shiftPagination.hasPrevious || shiftLoading}
                      className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          (p >= page - 1 && p <= page + 1)
                      )
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && p - arr[i - 1] > 1 && (
                            <span className="text-xs text-gray-300 px-1">
                              …
                            </span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            disabled={shiftLoading}
                            className={cn(
                              "w-8 h-8 rounded-xl text-xs font-semibold border transition-colors",
                              page === p
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                            )}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!shiftPagination.hasNext || shiftLoading}
                      className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <ShiftModal
          shift={selectedShift}
          businessId={businessId}
          staffList={staff}
          onClose={() => {
            setShowModal(false);
            selectShift(null);
          }}
        />
      )}
    </div>
  );
};

export default ShiftManagementPage;
