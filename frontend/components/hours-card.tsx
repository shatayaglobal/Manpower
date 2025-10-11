"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Users,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkforce } from "@/lib/redux/use-workforce";
import {
  HoursCard,
  HoursCardStatus,
} from "@/lib/workforce-types";
import { toast } from "sonner";
import { useBusiness } from "@/lib/redux/useBusiness";
import { useRouter } from "next/navigation";

type SortField = "date" | "staff" | "status";
type SortDirection = "asc" | "desc";

const HoursManagementPage: React.FC = () => {
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  const [localStatusFilter, setLocalStatusFilter] = useState<string>("all");
  const [localStaffFilter, setLocalStaffFilter] = useState<string>("all");
  const [localDateFrom, setLocalDateFrom] = useState<string>("");
  const [localDateTo, setLocalDateTo] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedHours, setSelectedHours] = useState<HoursCard | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const itemsPerPage = 10;

  const { businesses, loading: businessLoading, loadBusinesses } = useBusiness();

  const {
    hoursCards,
    hoursLoading,
    hoursError,
    hoursPagination,
    staff,
    loadHoursCards,
    loadStaff,
    approveHours,
    rejectHours,
    clearHoursError,
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
      loadHoursCards({
        page: currentPage,
        search: localSearchTerm,
        status: (localStatusFilter === "all" ? "" : localStatusFilter) as "" | undefined,
        staff: localStaffFilter === "all" ? "" : localStaffFilter,
        date_from: localDateFrom,
        date_to: localDateTo,
        ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
      });
    }
  }, [businessId, currentPage, localSearchTerm, localStatusFilter, localStaffFilter, localDateFrom, localDateTo, sortField, sortDirection, loadHoursCards]);

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearchTerm, localStatusFilter, localStaffFilter, localDateFrom, localDateTo]);

  const handleApprove = async (hoursId: string) => {
    try {
      await approveHours(hoursId);
      toast.success("Hours approved successfully");
      loadHoursCards({
        page: currentPage,
        search: localSearchTerm,
        status: (localStatusFilter === "all" ? "" : localStatusFilter) as "" | undefined,
        staff: localStaffFilter === "all" ? "" : localStaffFilter,
        date_from: localDateFrom,
        date_to: localDateTo,
        ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
      });
    } catch  {
      toast("Failed to approve hours");
    }
  };
  const handleRejectClick = (hours: HoursCard) => {
    setSelectedHours(hours);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedHours) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectHours(selectedHours.id, rejectionReason);
      toast.success("Hours rejected");
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedHours(null);
      loadHoursCards({
        page: currentPage,
        search: localSearchTerm,
        status: (localStatusFilter === "all" ? "" : localStatusFilter) as "" | undefined,
        staff: localStaffFilter === "all" ? "" : localStaffFilter,
        date_from: localDateFrom,
        date_to: localDateTo,
        ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
      });
    } catch {
      toast.error("Failed to reject hours");
    }
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
    if (hoursPagination.hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hoursPagination.hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(hoursPagination.count / itemsPerPage);

  const getStatusBadge = (status: HoursCardStatus) => {
    const statusConfig = {
      PENDING: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
      APPROVED: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      REVISED: { bg: "bg-blue-100", text: "text-blue-800", label: "Needs Revision" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  if (!businessLoading && !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Business Profile Found</h2>
          <p className="text-gray-600 mb-8">You need to create your business profile before managing hours.</p>
          <Button onClick={() => router.push("/business")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Create Business Profile
          </Button>
        </div>
      </div>
    );
  }

  const pendingHours = hoursCards.filter((h) => h.status === "PENDING").length;
  const approvedHours = hoursCards.filter((h) => h.status === "APPROVED").length;
  const totalHoursWorked = hoursCards
    .filter((h) => h.status === "APPROVED")
    .reduce((sum, h) => sum + (h.total_hours_decimal || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 -mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hoursError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-800">{hoursError}</p>
                <Button variant="outline" size="sm" onClick={clearHoursError} className="mt-2">
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hours & Attendance</h1>
              <p className="text-gray-600 mt-1">Review and approve staff working hours</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingHours}</p>
                <p className="text-gray-600 text-sm">Pending Approval</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{approvedHours}</p>
                <p className="text-gray-600 text-sm">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalHoursWorked.toFixed(1)}</p>
                <p className="text-gray-600 text-sm">Total Hours Approved</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by staff name..."
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="REVISED">Needs Revision</option>
              </select>
              <select
                value={localStaffFilter}
                onChange={(e) => setLocalStaffFilter(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={localDateFrom}
                onChange={(e) => setLocalDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={localDateTo}
                onChange={(e) => setLocalDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {hoursLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="ml-2 text-gray-600">Loading hours...</p>
          </div>
        ) : hoursCards.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <Clock className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">No hours recorded yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Staff members can clock in/out and their hours will appear here for review.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader field="date">Date</SortableHeader>
                      <SortableHeader field="staff">Staff Member</SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clock In/Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Break
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Hours
                      </th>
                      <SortableHeader field="status">Status</SortableHeader>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hoursCards.map((hours) => {
                      const staffMember = staff.find(s => s.id === hours.staff);
                      return (
                        <tr key={hours.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(hours.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(hours.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{staffMember?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{staffMember?.job_title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {hours.clock_in} - {hours.clock_out}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {hours.break_start && hours.break_end
                                ? `${hours.break_start} - ${hours.break_end}`
                                : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {hours.total_hours_decimal?.toFixed(2)} hrs
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(hours.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {hours.status === 'PENDING' ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove(hours.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRejectClick(hours)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    View Details
                                  </DropdownMenuItem>
                                  {hours.rejection_reason && (
                                    <DropdownMenuItem>
                                      View Rejection Reason
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Server-side Pagination */}
            {hoursPagination.count > itemsPerPage && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={!hoursPagination.hasPrevious || hoursLoading}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={!hoursPagination.hasNext || hoursLoading}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, hoursPagination.count)}</span> of{" "}
                      <span className="font-medium">{hoursPagination.count}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        onClick={handlePreviousPage}
                        disabled={!hoursPagination.hasPrevious || hoursLoading}
                        variant="outline"
                        className="rounded-r-none"
                      >
                        Previous
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2);
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
                                  className="rounded-none"
                                  disabled={hoursLoading}
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
                              className="rounded-none"
                              disabled={hoursLoading}
                            >
                              {page}
                            </Button>
                          );
                        })}

                      <Button
                        onClick={handleNextPage}
                        disabled={!hoursPagination.hasNext || hoursLoading}
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

        {/* Reject Modal */}
        {showRejectModal && selectedHours && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Reject Hours</h2>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason("");
                      setSelectedHours(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting these hours. The staff member will be notified.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rejection reason..."
                />
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setSelectedHours(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectSubmit}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject Hours
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoursManagementPage;
