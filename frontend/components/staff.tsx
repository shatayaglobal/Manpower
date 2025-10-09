"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Download,
  X,
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
  BusinessStaff,
  StaffFormData,
  EmploymentType,
  StaffStatus,
} from "@/lib/workforce-types";
import { toast } from "sonner";
import { useBusiness } from "@/lib/redux/useBusiness";
import { useRouter } from "next/navigation";

interface StaffModalProps {
  staff: BusinessStaff | null;
  onClose: () => void;
  businessId: string;
}

type SortField =
  | "name"
  | "job_title"
  | "department"
  | "employment_type"
  | "status"
  | "hire_date";
type SortDirection = "asc" | "desc";

const StaffManagementPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  const [localStatusFilter, setLocalStatusFilter] = useState<string>("all");
  const [localEmploymentTypeFilter, setLocalEmploymentTypeFilter] =
    useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("hire_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    businesses,
    loading: businessLoading,
    loadBusinesses,
  } = useBusiness();

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

  const business = businesses[0] || null;
  const businessId = business?.id || "";
  const router = useRouter();

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (businessId) {
      loadStaff({
        page: currentPage,
        search: localSearchTerm,
        status: (localStatusFilter === "all" ? "" : localStatusFilter) as
          | ""
          | undefined,
        employment_type: (localEmploymentTypeFilter === "all"
          ? ""
          : localEmploymentTypeFilter) as "" | undefined,
        ordering: sortDirection === "desc" ? `-${sortField}` : sortField,
      });
    }
  }, [
    businessId,
    currentPage,
    localSearchTerm,
    localStatusFilter,
    localEmploymentTypeFilter,
    sortField,
    sortDirection,
    loadStaff,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearchTerm, localStatusFilter, localEmploymentTypeFilter]);

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to delete ${staffName}?`)) {
      try {
        await removeStaff(staffId);
        toast.success("Staff member deleted successfully");
        loadStaff({
          page: currentPage,
          search: localSearchTerm,
          status: (localStatusFilter === "all" ? "" : localStatusFilter) as
            | ""
            | undefined,
          employment_type: (localEmploymentTypeFilter === "all"
            ? ""
            : localEmploymentTypeFilter) as "" | undefined,
          ordering: sortDirection === "desc" ? `-${sortField}` : sortField,
        });
      } catch {
        toast("Failed to delete staff member");
      }
    }
  };
  const handleEditStaff = (staff: BusinessStaff) => {
    selectStaff(staff);
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
    if (staffPagination.hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (staffPagination.hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(staffPagination.count / itemsPerPage);

  const getStatusBadge = (status: StaffStatus) => {
    const statusConfig = {
      ACTIVE: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      INACTIVE: { bg: "bg-gray-100", text: "text-gray-800", label: "Inactive" },
      TERMINATED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Terminated",
      },
      ON_LEAVE: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "On Leave",
      },
    };

    const config = statusConfig[status] || statusConfig.INACTIVE;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getEmploymentTypeBadge = (type: EmploymentType) => {
    const typeConfig = {
      FULL_TIME: { label: "Full Time", color: "bg-blue-100 text-blue-800" },
      PART_TIME: { label: "Part Time", color: "bg-purple-100 text-purple-800" },
      CONTRACT: { label: "Contract", color: "bg-orange-100 text-orange-800" },
      INTERN: { label: "Intern", color: "bg-pink-100 text-pink-800" },
    };

    const config = typeConfig[type] || typeConfig.FULL_TIME;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
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
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-page-${currentPage}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    toast.success(`Page ${currentPage} exported successfully`);
  };

  const StaffModal: React.FC<StaffModalProps> = ({
    staff,
    onClose,
    businessId,
  }) => {
    const [formData, setFormData] = useState<StaffFormData>({
      name: staff?.name || "",
      job_title: staff?.job_title || "",
      department: staff?.department || "",
      employment_type: staff?.employment_type || "FULL_TIME",
      status: staff?.status || "ACTIVE",
      email: staff?.email || "",
      phone: staff?.phone || "",
      hourly_rate: staff?.hourly_rate || "",
      hire_date: staff?.hire_date || new Date().toISOString().split("T")[0],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    const { addStaff, editStaff } = useWorkforce();

    useEffect(() => {
      if (staff) {
        setFormData({
          name: staff.name || "",
          job_title: staff.job_title || "",
          department: staff.department || "",
          employment_type: staff.employment_type || "FULL_TIME",
          status: staff.status || "ACTIVE",
          email: staff.email || "",
          phone: staff.phone || "",
          hourly_rate: staff.hourly_rate || "",
          hire_date: staff.hire_date || new Date().toISOString().split("T")[0],
        });
      }
    }, [staff]);

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.job_title.trim())
        newErrors.job_title = "Job title is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";

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

        if (staff) {
          await editStaff(staff.id, submitData);
          toast.success("Staff member updated successfully!");
        } else {
          await addStaff(submitData);
          toast.success("Staff member added successfully!");
        }
        onClose();
        selectStaff(null);
        loadStaff({
          page: currentPage,
          search: localSearchTerm,
          status: (localStatusFilter === "all" ? "" : localStatusFilter) as
            | ""
            | undefined,
          employment_type: (localEmploymentTypeFilter === "all"
            ? ""
            : localEmploymentTypeFilter) as "" | undefined,
          ordering: sortDirection === "desc" ? `-${sortField}` : sortField,
        });
      } catch (error: unknown) {
        let errorMessage = "Failed to save staff member. Please try again.";

        if (error && typeof error === "object" && "response" in error) {
          const response = (
            error as {
              response?: { data?: { business?: string[]; detail?: string } };
            }
          ).response;
          errorMessage =
            response?.data?.business?.[0] ||
            response?.data?.detail ||
            errorMessage;
        }

        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    };
    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {staff ? "Edit Staff Member" : "Add New Staff Member"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
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
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) =>
                      setFormData({ ...formData, job_title: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.job_title ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Manager"
                  />
                  {errors.job_title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.job_title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sales"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employment_type: e.target.value as EmploymentType,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as StaffStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="+256-700-000000"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourly_rate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date *
                  </label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) =>
                      setFormData({ ...formData, hire_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {staff ? "Updating..." : "Adding..."}
                </>
              ) : staff ? (
                "Update Staff"
              ) : (
                "Add Staff"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Business Profile Found
          </h2>
          <p className="text-gray-600 mb-8">
            You need to create your business profile before managing staff.
          </p>
          <Button
            onClick={() => router.push("/business")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Business Profile
          </Button>
        </div>
      </div>
    );
  }

  const activeStaff = staff.filter((s) => s.status === "ACTIVE").length;
  const onLeaveStaff = staff.filter((s) => s.status === "ON_LEAVE").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {staffError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-800">{staffError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearStaffError}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your team members and their information
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={staff.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => {
                  selectStaff(null);
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {staffPagination.count}
                </p>
                <p className="text-gray-600 text-sm">Total Staff</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {activeStaff}
                </p>
                <p className="text-gray-600 text-sm">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {onLeaveStaff}
                </p>
                <p className="text-gray-600 text-sm">On Leave</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, email, or job title..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={localStatusFilter}
                onChange={(e) => setLocalStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
              <select
                value={localEmploymentTypeFilter}
                onChange={(e) => setLocalEmploymentTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
          </div>
        </div>

        {staffLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="ml-2 text-gray-600">Loading staff members...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              No staff members yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your team by adding your first staff member.
            </p>
            <Button
              onClick={() => {
                selectStaff(null);
                setShowCreateModal(true);
              }}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Staff Member
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader field="name">Name</SortableHeader>
                      <SortableHeader field="job_title">
                        Job Title
                      </SortableHeader>
                      <SortableHeader field="department">
                        Department
                      </SortableHeader>
                      <SortableHeader field="employment_type">
                        Type
                      </SortableHeader>
                      <SortableHeader field="status">Status</SortableHeader>
                      <SortableHeader field="hire_date">
                        Hire Date
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staff.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.staff_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.job_title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.department || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getEmploymentTypeBadge(member.employment_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(member.hire_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              <span className="truncate max-w-[150px]">
                                {member.email}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditStaff(member)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDeleteStaff(member.id, member.name)
                                }
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Server-side Pagination */}
            {staffPagination.count > itemsPerPage && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={!staffPagination.hasPrevious || staffLoading}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={!staffPagination.hasNext || staffLoading}
                    variant="outline"
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
                        {Math.min(
                          currentPage * itemsPerPage,
                          staffPagination.count
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {staffPagination.count}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        onClick={handlePreviousPage}
                        disabled={!staffPagination.hasPrevious || staffLoading}
                        variant="outline"
                        className="rounded-r-none"
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
                                  variant={
                                    currentPage === page ? "default" : "outline"
                                  }
                                  className="rounded-none"
                                  disabled={staffLoading}
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
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              className="rounded-none"
                              disabled={staffLoading}
                            >
                              {page}
                            </Button>
                          );
                        })}

                      <Button
                        onClick={handleNextPage}
                        disabled={!staffPagination.hasNext || staffLoading}
                        variant="outline"
                        className="rounded-l-none"
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
          <StaffModal
            staff={selectedStaff}
            businessId={businessId}
            onClose={() => {
              setShowCreateModal(false);
              selectStaff(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StaffManagementPage;
