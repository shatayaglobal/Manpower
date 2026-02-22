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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { HoursCard } from "@/lib/workforce-types";
import { toast } from "sonner";
import { useBusiness } from "@/lib/redux/useBusiness";
import { useRouter } from "next/navigation";
import { AddWorkerHoursModal } from "./add-workers-hours-modal";
import { HoursCardDetailsModal } from "./workers-hours-details-modal";
import { cn } from "@/lib/utils";

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
        return Math.max(
          0,
          (now.getTime() - inTime.getTime()) / (1000 * 60 * 60)
        );
      }
    }
    return h.total_hours_decimal ?? 0;
  };

  const getStatusBadge = (h: HoursCard) => {
    if (h.clock_in && !h.clock_out) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Present
        </span>
      );
    }
    if (h.status === "PENDING") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
          Awaiting Signature
        </span>
      );
    }
    if (h.status === "SIGNED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
          Awaiting Approval
        </span>
      );
    }
    if (h.status === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    }
    if (h.status === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3" />
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
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
    return Array.from(map.values());
  }, [hoursCards]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);
  useEffect(() => {
    if (businessId) loadStaff();
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

  // ── No business guard ──────────────────────────────────────────────────────
  if (!businessLoading && !business) {
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
            Create your business profile before managing hours.
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
        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hours & Attendance
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Review and approve staff hours
            </p>
          </div>
          <Button
            onClick={() => setShowClockInModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-xl font-semibold text-sm shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Hours
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Pending Approval",
              value: pendingCount,
              border: "border-amber-100",
              text: "text-amber-700",
              icon: <Clock className="w-4 h-4 text-amber-600" />,
              iconBg: "bg-amber-50",
            },
            {
              label: "Approved",
              value: approvedCount,
              border: "border-emerald-100",
              text: "text-emerald-700",
              icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
              iconBg: "bg-emerald-50",
            },
            {
              label: "Total Hours",
              value: `${totalApprovedHours.toFixed(1)}h`,
              border: "border-violet-100",
              text: "text-violet-700",
              icon: <Users className="w-4 h-4 text-violet-600" />,
              iconBg: "bg-violet-50",
            },
          ].map(({ label, value, border, text, icon, iconBg }) => (
            <div
              key={label}
              className={cn(
                "bg-white rounded-2xl border p-5 flex items-center justify-between",
                border
              )}
            >
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className={cn("text-2xl font-bold", text)}>{value}</p>
              </div>
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  iconBg
                )}
              >
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Table Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {hoursLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : hoursCards.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No hours recorded yet
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mb-5">
                Start tracking staff hours by adding their first entry.
              </p>
              <Button
                onClick={() => setShowClockInModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-xl font-semibold text-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add First Hours
              </Button>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="hidden lg:grid grid-cols-[auto_2fr_1fr_1.5fr_auto] gap-4 px-5 py-2.5 bg-gray-50/60 border-b border-gray-50">
                <span className="w-5" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Worker
                </span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Period Hours
                </span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Status
                </span>
                <span />
              </div>

              <div className="divide-y divide-gray-50">
                {groupedWorkers.map((group) => {
                  const { workerId, workerName, entries, totalHours } = group;
                  const latest = entries[0];
                  const active = !!latest.clock_in && !latest.clock_out;
                  const expanded = expandedWorkers.has(workerId);

                  return (
                    <React.Fragment key={workerId}>
                      {/* Main row */}
                      <div
                        className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-[auto_2fr_1fr_1.5fr_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(workerId)}
                      >
                        {/* Chevron */}
                        <div className="w-5 flex items-center justify-center text-gray-400">
                          {expanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>

                        {/* Worker info */}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {workerName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {entries.length} days recorded
                          </p>
                        </div>

                        {/* Hours */}
                        <div className="hidden lg:block">
                          <p className="text-sm font-bold text-gray-900">
                            {totalHours.toFixed(1)} hrs
                          </p>
                        </div>

                        {/* Status */}
                        <div className="hidden lg:block">
                          {active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Present
                            </span>
                          ) : (
                            getStatusBadge(latest)
                          )}
                        </div>

                        {/* Actions */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-xl"
                            >
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(latest)}
                              >
                                View Details
                              </DropdownMenuItem>
                              {active && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      handleClockOutWorker(latest.id)
                                    }
                                  >
                                    Clock Out
                                  </DropdownMenuItem>
                                </>
                              )}
                              {latest.status === "SIGNED" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-emerald-600"
                                    onClick={() => handleApprove(latest.id)}
                                  >
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedHours(latest);
                                      setShowRejectModal(true);
                                    }}
                                  >
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Expanded entries */}
                      {expanded && (
                        <div className="px-5 pb-4 bg-gray-50/40 border-t border-gray-50">
                          <div className="pt-3 space-y-2">
                            {entries.slice(0, 7).map((entry) => (
                              <div
                                key={entry.id}
                                className="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                              >
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">
                                    {new Date(entry.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {getFormattedTime(
                                      entry.clock_in_datetime,
                                      entry.clock_in
                                    )}
                                    {" → "}
                                    {entry.clock_out_datetime ||
                                    entry.clock_out ? (
                                      getFormattedTime(
                                        entry.clock_out_datetime,
                                        entry.clock_out
                                      )
                                    ) : (
                                      <span className="text-emerald-600 font-medium">
                                        Active
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-gray-900">
                                    {calculateTotalHours(entry).toFixed(2)} hrs
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
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                View all {entries.length} days →
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Add Hours Modal ── */}
      <AddWorkerHoursModal
        isOpen={showClockInModal}
        onClose={() => setShowClockInModal(false)}
        onSuccess={() =>
          loadHoursCards({ page: currentPage, ordering: "-date" })
        }
      />

      {/* ── Reject Modal ── */}
      {showRejectModal && selectedHours && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Reject Hours</h2>
              <button
                onClick={closeRejectModal}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-4">
                Please provide a reason for rejecting these hours. The staff
                member will see this message.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl flex gap-3">
              <Button
                variant="outline"
                onClick={closeRejectModal}
                className="flex-1 border-gray-200 h-10 rounded-xl font-semibold text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white h-10 rounded-xl font-semibold text-sm"
              >
                Reject Hours
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Details Modal ── */}
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
  );
};

export default HoursManagementPage;
