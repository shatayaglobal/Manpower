"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Download,
  Eye,
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
  EmploymentType,
  StaffStatus,
} from "@/lib/workforce-types";
import { toast } from "sonner";
import { useBusiness } from "@/lib/redux/useBusiness";
import { useRouter } from "next/navigation";
import { StaffModal } from "@/components/staff/staff-modal";

type SortField =
  | "name"
  | "job_title"
  | "department"
  | "employment_type"
  | "status"
  | "hire_date";
type SortDirection = "asc" | "desc";

const StaffManagementPage = () => {
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
        bg: "bg-amber-50",
        text: "text-amber-600",
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
      FULL_TIME: {
        label: "Full Time",
        color: "bg-blue-50 text-blue-500 border border-blue-200",
      },
      PART_TIME: {
        label: "Part Time",
        color: "bg-purple-50 text-purple-600 border border-purple-200",
      },
      CONTRACT: {
        label: "Contract",
        color: "bg-orange-50 text-orange-600 border border-orange-200",
      },
      INTERN: {
        label: "Intern",
        color: "bg-pink-50 text-pink-600 border border-pink-200",
      },
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

  if (!businessLoading && !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 text-center">
          <AlertCircle className="w-16 sm:w-20 h-16 sm:h-20 text-amber-600 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            No Business Profile Found
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            You need to create your business profile before managing staff.
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

  const activeStaff = staff.filter((s) => s.status === "ACTIVE").length;
  const onLeaveStaff = staff.filter((s) => s.status === "ON_LEAVE").length;

  return (
    <div className="bg-white rounded-lg p-2 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {staffError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">{staffError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearStaffError}
                  className="mt-2 border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header with Stats Cards - More Compact */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Staff Management
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage your team members
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={staff.length === 0}
                className="border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => {
                  selectStaff(null);
                  setShowCreateModal(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </div>

          {/* Compact Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-600">Total Staff</p>
                  <p className="text-xl font-bold text-gray-900">
                    {staffPagination.count}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-600">Active</p>
                  <p className="text-xl font-bold text-gray-900">
                    {activeStaff}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-600">On Leave</p>
                  <p className="text-xl font-bold text-gray-900">
                    {onLeaveStaff}
                  </p>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Search & Filters - Single Line */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search staff..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none text-sm transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={localStatusFilter}
                onChange={(e) => setLocalStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 text-sm transition-colors"
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
                className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 text-sm transition-colors"
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
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading staff members...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No staff members yet
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Start building your team by adding your first staff member.
            </p>
            <Button
              onClick={() => {
                selectStaff(null);
                setShowCreateModal(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Staff Member
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg  overflow-hidden">
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
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.job_title}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.department || "-"}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {getEmploymentTypeBadge(member.employment_type)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(member.hire_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center mt-1">
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/staff/${member.id}`)
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
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

            {/* Pagination */}
            {staffPagination.count > itemsPerPage && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={!staffPagination.hasPrevious || staffLoading}
                    variant="outline"
                    size="sm"
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
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
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
                        size="sm"
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
                                  size="sm"
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
                              size="sm"
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
                        size="sm"
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
            onSuccess={() => {
              loadStaff({
                page: currentPage,
                search: localSearchTerm,
                status: (localStatusFilter === "all"
                  ? ""
                  : localStatusFilter) as "" | undefined,
                employment_type: (localEmploymentTypeFilter === "all"
                  ? ""
                  : localEmploymentTypeFilter) as "" | undefined,
                ordering:
                  sortDirection === "desc" ? `-${sortField}` : sortField,
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StaffManagementPage;
