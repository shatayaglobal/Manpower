"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Download,
  Eye,
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
  EmploymentType,
  StaffStatus,
} from "@/lib/workforce-types";
import { toast } from "sonner";
import { useBusiness } from "@/lib/redux/useBusiness";
import { useRouter } from "next/navigation";
import { StaffModal } from "@/components/staff/staff-modal";
import { cn } from "@/lib/utils";

type SortField =
  | "name"
  | "job_title"
  | "department"
  | "employment_type"
  | "status"
  | "hire_date";
type SortDirection = "asc" | "desc";

const STATUS_CONFIG: Record<StaffStatus, { label: string; color: string }> = {
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  INACTIVE: {
    label: "Inactive",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
  TERMINATED: {
    label: "Terminated",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  ON_LEAVE: {
    label: "On Leave",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

const EMP_TYPE_CONFIG: Record<
  EmploymentType,
  { label: string; color: string }
> = {
  FULL_TIME: {
    label: "Full Time",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  PART_TIME: {
    label: "Part Time",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  CONTRACT: {
    label: "Contract",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  INTERN: {
    label: "Intern",
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
};

function Badge({ config }: { config: { label: string; color: string } }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.color
      )}
    >
      {config.label}
    </span>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-20 hidden lg:block" />
      <div className="h-5 bg-gray-100 rounded-full w-16 hidden md:block" />
      <div className="h-5 bg-gray-100 rounded-full w-16 hidden sm:block" />
      <div className="h-3 bg-gray-100 rounded w-20 hidden lg:block" />
      <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
    </div>
  );
}

const selectCls =
  "px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function StaffManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("hire_date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { businesses, loading: bizLoading, loadBusinesses } = useBusiness();
  const {
    staff,
    selectedStaff,
    staffLoading,
    staffError,
    staffPagination,
    loadStaff,
    removeStaff,
    selectStaff,
    clearStaffError,
  } = useWorkforce();

  const business = businesses[0] ?? null;
  const businessId = business?.id ?? "";
  const router = useRouter();

  const reloadParams = {
    page,
    search,
    status: (statusFilter === "all" ? "" : statusFilter) as "" | undefined,
    employment_type: (typeFilter === "all" ? "" : typeFilter) as "" | undefined,
    ordering: sortDir === "desc" ? `-${sortField}` : sortField,
  };

  useEffect(() => {
    if (!businessId) return;
    const params = {
      page,
      search,
      status: (statusFilter === "all" ? "" : statusFilter) as "" | undefined,
      employment_type: (typeFilter === "all" ? "" : typeFilter) as "" | undefined,
      ordering: sortDir === "desc" ? `-${sortField}` : sortField,
    };
    loadStaff(params);
  }, [businessId, page, search, statusFilter, typeFilter, sortField, sortDir, loadStaff]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await removeStaff(id);
      toast.success("Staff member deleted");
      loadStaff(reloadParams);
    } catch {
      toast.error("Failed to delete staff member");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Staff ID",
      "Name",
      "Job Title",
      "Department",
      "Email",
      "Phone",
      "Employment Type",
      "Status",
      "Hire Date",
      "Hourly Rate",
    ];
    const rows = staff.map((s) => [
      s.staff_id,
      s.name,
      s.job_title,
      s.department || "",
      s.email,
      s.phone,
      s.employment_type,
      s.status,
      s.hire_date,
      s.hourly_rate || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${c}"`).join(","))
      .join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `staff-p${page}-${new Date().toISOString().split("T")[0]}.csv`,
    });
    a.click();
    toast.success(`Page ${page} exported`);
  };

  const totalPages = Math.ceil(staffPagination.count / itemsPerPage);
  const hasFilters =
    statusFilter !== "all" || typeFilter !== "all" || search.trim() !== "";

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 ml-1" />
    );
  }

  function ColHeader({
    field,
    label,
    className,
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) {
    return (
      <button
        onClick={() => handleSort(field)}
        className={cn(
          "flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-700 transition-colors",
          className
        )}
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
            Create your business profile before managing staff.
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

  const activeCount = staff.filter((s) => s.status === "ACTIVE").length;
  const onLeaveCount = staff.filter((s) => s.status === "ON_LEAVE").length;

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Error ── */}
        {staffError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{staffError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearStaffError}
              className="border-red-200 text-red-700 hover:bg-red-100 shrink-0 h-8 px-3 text-xs rounded-xl"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Staff Management
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage your team members
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={staff.length === 0}
              className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 h-9 px-4 rounded-xl font-semibold text-sm"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
            <Button
              onClick={() => {
                selectStaff(null);
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-xl font-semibold text-sm shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Staff
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Staff",
              value: staffPagination.count,
              border: "border-blue-100",
              text: "text-gray-900",
            },
            {
              label: "Active",
              value: activeCount,
              border: "border-emerald-100",
              text: "text-emerald-700",
            },
            {
              label: "On Leave",
              value: onLeaveCount,
              border: "border-amber-100",
              text: "text-amber-700",
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

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-gray-50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectCls}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={selectCls}
              >
                <option value="all">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap self-center"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Content */}
          {staffLoading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No staff members found
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mb-5">
                {hasFilters
                  ? "Try adjusting your filters."
                  : "Start building your team by adding your first member."}
              </p>
              {!hasFilters && (
                <Button
                  onClick={() => {
                    selectStaff(null);
                    setShowModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-xl font-semibold text-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 bg-gray-50/60 border-b border-gray-50">
                <ColHeader field="name" label="Name" />
                <ColHeader field="job_title" label="Job Title" />
                <ColHeader field="department" label="Dept" />
                <ColHeader field="employment_type" label="Type" />
                <ColHeader field="status" label="Status" />
                <ColHeader field="hire_date" label="Hired" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Phone
                </span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[1fr_auto] lg:grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Name (always visible) */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate lg:hidden">
                          {member.job_title}
                        </p>
                        {/* Mobile: show badges inline */}
                        <div className="flex gap-1.5 mt-1 lg:hidden flex-wrap">
                          <Badge
                            config={
                              STATUS_CONFIG[member.status] ??
                              STATUS_CONFIG.INACTIVE
                            }
                          />
                          <Badge
                            config={
                              EMP_TYPE_CONFIG[member.employment_type] ??
                              EMP_TYPE_CONFIG.FULL_TIME
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 hidden lg:block truncate">
                      {member.job_title}
                    </p>
                    <p className="text-sm text-gray-500 hidden lg:block truncate">
                      {member.department || "—"}
                    </p>
                    <div className="hidden lg:block">
                      <Badge
                        config={
                          EMP_TYPE_CONFIG[member.employment_type] ??
                          EMP_TYPE_CONFIG.FULL_TIME
                        }
                      />
                    </div>
                    <div className="hidden lg:block">
                      <Badge
                        config={
                          STATUS_CONFIG[member.status] ?? STATUS_CONFIG.INACTIVE
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      {new Date(member.hire_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      {member.phone}
                    </p>

                    {/* Action menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          onClick={() => router.push(`/staff/${member.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            selectStaff(member);
                            setShowModal(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(member.id, member.name)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {staffPagination.count > itemsPerPage && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
                  <p className="text-xs text-gray-400">
                    {(page - 1) * itemsPerPage + 1}–
                    {Math.min(page * itemsPerPage, staffPagination.count)} of{" "}
                    {staffPagination.count}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!staffPagination.hasPrevious || staffLoading}
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
                            disabled={staffLoading}
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
                      disabled={!staffPagination.hasNext || staffLoading}
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
        <StaffModal
          staff={selectedStaff}
          businessId={businessId}
          onClose={() => {
            setShowModal(false);
            selectStaff(null);
          }}
          onSuccess={() => loadStaff(reloadParams)}
        />
      )}
    </div>
  );
}
