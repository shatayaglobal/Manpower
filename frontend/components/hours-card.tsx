"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { HoursCard } from "@/lib/workforce-types";
import { toast } from "sonner";
import { useBusiness } from "@/lib/redux/useBusiness";
import { useRouter } from "next/navigation";
import { AddWorkerHoursModal } from "./add-workers-hours-modal";
import { HoursCardDetailsModal } from "./workers-hours-details-modal";

const HoursManagementPage = () => {
  const [currentPage] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedHours, setSelectedHours] = useState<HoursCard | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [expandedWorkers, setExpandedWorkers] = useState<Set<string>>(
    new Set()
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsHours, setDetailsHours] = useState<HoursCard | null>(null);

  const {
    businesses,
    loading: businessLoading,
    loadBusinesses,
  } = useBusiness();
  const {
    hoursCards,
    hoursLoading,
    loadHoursCards,
    loadStaff,
    approveSignedHoursCard,
    clockOut,
  } = useWorkforce();

  const business = businesses[0] || null;
  const businessId = business?.id || "";
  const router = useRouter();

  const getFormattedTime = (
    datetime?: string | null,
    timeOnly?: string | null
  ): string => {
    if (datetime) {
      return new Date(datetime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (timeOnly) {
      const [h, m] = timeOnly.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    }
    return "";
  };

  const calculateTotalHours = (h: HoursCard): number => {
    if (h.clock_in_datetime && !h.clock_out_datetime) {
      const now = new Date();
      const inTime = new Date(h.clock_in_datetime);
      if (inTime.toDateString() === now.toDateString()) {
        const diff = (now.getTime() - inTime.getTime()) / (1000 * 60 * 60);
        return Math.max(0, diff);
      }
    }

    return h.total_hours_decimal ?? 0;
  };

  const getStatusBadge = (h: HoursCard) => {
    if (h.clock_in && !h.clock_out) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Present
        </span>
      );
    }
    if (h.status === "PENDING") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Awaiting Signature
        </span>
      );
    }
    if (h.status === "SIGNED") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Awaiting Approval
        </span>
      );
    }
    if (h.status === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    }
    if (h.status === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    }
    return null;
  };

  const groupedWorkers = useMemo(() => {
    const map = new Map<
      string,
      {
        workerId: string;
        workerName: string;
        entries: HoursCard[];
        totalHours: number;
      }
    >();

    hoursCards.forEach((card) => {
      const key = card.staff || card.staff_name || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          workerId: key,
          workerName: card.staff_name || "Unknown Worker",
          entries: [],
          totalHours: 0,
        });
      }
      const group = map.get(key)!;
      group.entries.push(card);
      group.totalHours += calculateTotalHours(card);
    });

    map.forEach((group) => {
      group.entries.sort(
        (a: HoursCard, b: HoursCard) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return Array.from(map.values());
  }, [hoursCards]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (businessId) {
      loadStaff();
    }
  }, [businessId, loadStaff]);

  const toggleExpand = (workerId: string) => {
    setExpandedWorkers((prev) => {
      const next = new Set(prev);
      next.has(workerId) ? next.delete(workerId) : next.add(workerId);
      return next;
    });
  };

  const handleViewDetails = (hours: HoursCard) => {
    setDetailsHours(hours);
    setShowDetailsModal(true);
  };

  const handleClockOutWorker = async (id: string) => {
    try {
      await clockOut(id);
      toast.success("Clocked out successfully");
    } catch {
      toast.error("Failed to clock out");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveSignedHoursCard(id, "APPROVED");
      toast.success("Hours approved successfully");
    } catch {
      toast.error("Failed to approve hours");
    }
  };

  const handleReject = async () => {
    if (!selectedHours || !rejectionReason.trim()) return;

    try {
      await approveSignedHoursCard(
        selectedHours.id,
        "REJECTED",
        rejectionReason
      );
      toast.success("Hours rejected");
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedHours(null);
    } catch {
      toast.error("Failed to reject hours");
    }
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason("");
    setSelectedHours(null);
  };

  const pendingCount = hoursCards.filter((h) => h.status === "SIGNED").length;
  const approvedCount = hoursCards.filter(
    (h) => h.status === "APPROVED"
  ).length;
  const totalApprovedHours = hoursCards
    .filter((h) => h.status === "APPROVED")
    .reduce((sum, h) => sum + (h.total_hours_decimal || 0), 0);

  if (!businessLoading && !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">No Business Profile</h2>
          <p className="text-gray-600 mb-6">
            Create a business profile to get started
          </p>
          <Button onClick={() => router.push("/business")}>
            Create Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hours & Attendance
            </h1>
            <p className="text-gray-600 mt-1">Review and approve staff hours</p>
          </div>
          <Button
            onClick={() => setShowClockInModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Hours
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Approval */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-600 mt-1">Pending Approval</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* Approved */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">
                {approvedCount}
              </p>
              <p className="text-sm text-gray-600 mt-1">Approved</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>

          {/* Total Hours */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">
                {totalApprovedHours.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Hours</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Main Table */}
        {hoursLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : hoursCards.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Clock className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium mb-2">No hours recorded yet</h3>
            <p className="text-gray-500 mb-6">
              Start tracking staff hours by adding their first entry
            </p>
            <Button
              onClick={() => setShowClockInModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Hours
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-6 py-3"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupedWorkers.map((group) => {
                    const { workerId, workerName, entries, totalHours } = group;
                    const latest = entries[0];
                    const active = !!latest.clock_in && !latest.clock_out;
                    const expanded = expandedWorkers.has(workerId);

                    return (
                      <React.Fragment key={workerId}>
                        {/* Main Row */}
                        <tr
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => toggleExpand(workerId)}
                        >
                          <td className="px-6 py-4">
                            {expanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="ml-3">
                                <p className="font-semibold text-gray-900">
                                  {workerName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {entries.length} days recorded
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-lg font-bold text-gray-900">
                              {totalHours.toFixed(1)} hrs
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {active ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Present
                              </span>
                            ) : (
                              getStatusBadge(latest)
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(latest);
                                  }}
                                >
                                  View Details
                                </DropdownMenuItem>
                                {active && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClockOutWorker(latest.id);
                                    }}
                                    className="text-red-600"
                                  >
                                    Clock Out
                                  </DropdownMenuItem>
                                )}
                                {latest.status === "SIGNED" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApprove(latest.id);
                                      }}
                                      className="text-green-600"
                                    >
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedHours(latest);
                                        setShowRejectModal(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expanded && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-3">
                                {entries.slice(0, 7).map((entry: HoursCard) => (
                                  <div
                                    key={entry.id}
                                    className="flex justify-between items-center p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {new Date(
                                          entry.date
                                        ).toLocaleDateString("en-US", {
                                          weekday: "long",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {getFormattedTime(
                                          entry.clock_in_datetime,
                                          entry.clock_in
                                        )}{" "}
                                        →{" "}
                                        {entry.clock_out_datetime ||
                                        entry.clock_out ? (
                                          getFormattedTime(
                                            entry.clock_out_datetime,
                                            entry.clock_out
                                          )
                                        ) : (
                                          <span className="text-green-600 font-medium">
                                            Active
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900">
                                        {calculateTotalHours(entry).toFixed(2)}{" "}
                                        hrs
                                      </p>
                                      <div className="mt-1">
                                        {getStatusBadge(entry)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {entries.length > 7 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(latest);
                                    }}
                                    className="text-blue-600 hover:underline text-sm font-medium"
                                  >
                                    View all {entries.length} days →
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Hours Modal */}
        <AddWorkerHoursModal
          isOpen={showClockInModal}
          onClose={() => setShowClockInModal(false)}
          onSuccess={() =>
            loadHoursCards({ page: currentPage, ordering: "-date" })
          }
        />

        {/* Reject Modal */}
        {showRejectModal && selectedHours && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">Reject Hours</h2>
                <button
                  onClick={closeRejectModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting these hours. The staff
                  member will see this message.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <Button variant="outline" onClick={closeRejectModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Hours
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        <HoursCardDetailsModal
          isOpen={showDetailsModal}
          hours={detailsHours}
          onClose={() => {
            setShowDetailsModal(false);
            setDetailsHours(null);
          }}
          getStatusBadge={getStatusBadge}
          calculateTotalHours={calculateTotalHours}
        />
      </div>
    </div>
  );
};

export default HoursManagementPage;
