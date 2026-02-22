"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
  Eye,
  FileText,
  Check,
  X,
  User,
} from "lucide-react";
import { useApplications } from "@/lib/redux/use-applications";
import { JobApplication } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AuthState {
  user: {
    id: string;
    email: string;
    account_type: "WORKER" | "BUSINESS";
    first_name: string;
    last_name: string;
  } | null;
  isAuthenticated: boolean;
}
interface RootState {
  auth: AuthState;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  REVIEWED: {
    label: "Reviewed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: AlertCircle,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG.PENDING;
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0",
        s.color
      )}
    >
      <Icon className="w-3 h-3" />
      {s.label}
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
      <div className="h-3 bg-gray-100 rounded w-20 hidden md:block" />
      <div className="h-6 bg-gray-100 rounded-full w-20 hidden sm:block" />
      <div className="flex gap-2 shrink-0">
        <div className="h-8 w-8 bg-gray-100 rounded-lg" />
        <div className="h-8 w-8 bg-gray-100 rounded-lg" />
        <div className="h-8 w-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

function formatDate(d: string) {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export default function ManageApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    applications,
    loading,
    error,
    clearApplicationError,
    loadBusinessApplications,
    updateApplicationStatus,
  } = useApplications();

  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.account_type !== "BUSINESS") {
      router.push("/jobs");
      return;
    }
    loadBusinessApplications();
  }, [isAuthenticated, user, router, loadBusinessApplications]);

  const filtered = applications.filter((app) => {
    const statusOk =
      statusFilter === "all" || app.status === statusFilter.toUpperCase();
    const jobId =
      typeof app.job === "string" ? app.job : (app.job as { id: string })?.id;
    const jobOk = jobFilter === "all" || jobId === jobFilter;
    return statusOk && jobOk;
  });

  const uniqueJobs = applications
    .map((a) => a.job)
    .filter(
      (j): j is Extract<typeof j, { id: string; title: string }> =>
        !!j && typeof j === "object" && "id" in j
    )
    .filter((j, i, arr) => arr.findIndex((x) => x.id === j.id) === i);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    reviewed: applications.filter((a) => a.status === "REVIEWED").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  const canAct = (status: string) =>
    status === "PENDING" || status === "REVIEWED";

  const handleUpdate = async (id: string, newStatus: string) => {
    const app = applications.find((a) => a.id === id);
    if (app?.status === "ACCEPTED" && newStatus === "REJECTED") {
      toast.error("Cannot reject an already accepted application");
      return;
    }
    if (app?.status === "REJECTED" && newStatus === "ACCEPTED") {
      toast.error("Cannot accept an already rejected application");
      return;
    }
    setIsUpdating(id);
    try {
      await updateApplicationStatus(id, newStatus);
      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      loadBusinessApplications();
      // Update the modal if open
      if (selectedApp?.id === id)
        setSelectedApp((prev) =>
          prev
            ? { ...prev, status: newStatus as JobApplication["status"] }
            : null
        );
    } catch {
      toast.error(`Failed to ${newStatus.toLowerCase()} application`);
    } finally {
      setIsUpdating(null);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
    );
  }

  const hasActiveFilters = statusFilter !== "all" || jobFilter !== "all";

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Review and manage applications for your job postings
            </p>
          </div>
          {stats.pending > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <Clock className="w-3 h-3" />
              {stats.pending} need review
            </span>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "border-gray-100",
              text: "text-gray-900",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "border-amber-100",
              text: "text-amber-700",
            },
            {
              label: "Reviewed",
              value: stats.reviewed,
              color: "border-blue-100",
              text: "text-blue-700",
            },
            {
              label: "Accepted",
              value: stats.accepted,
              color: "border-emerald-100",
              text: "text-emerald-700",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: "border-red-100",
              text: "text-red-600",
            },
          ].map(({ label, value, color, text }) => (
            <div
              key={label}
              className={cn("bg-white rounded-2xl border p-4", color)}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                {label}
              </p>
              <p className={cn("text-2xl font-bold", text)}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearApplicationError}
              className="border-red-200 text-red-700 hover:bg-red-100 shrink-0 h-8 px-3 text-xs rounded-xl"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* ── Filters + List ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-gray-50">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36 border-gray-200 rounded-xl text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="h-9 w-52 border-gray-200 rounded-xl text-sm">
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {uniqueJobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title || "Untitled Job"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setJobFilter("all");
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear filters
              </button>
            )}

            <span className="ml-auto text-xs text-gray-400 font-medium">
              {filtered.length}{" "}
              {filtered.length === 1 ? "application" : "applications"}
            </span>
          </div>

          {/* List */}
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "You haven't received any applications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((app: JobApplication) => {
                const job =
                  typeof app.job === "object" && app.job !== null
                    ? (app.job as {
                        id: string;
                        title?: string;
                        location?: string;
                      })
                    : null;
                const busy = isUpdating === app.id;

                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>

                    {/* Applicant + job */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {app.applicant_name || "Unknown Applicant"}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500 truncate">
                          {job?.title || "Job unavailable"}
                        </span>
                        {job?.location && (
                          <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Applied date */}
                    <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(app.created_at)}
                    </span>

                    {/* Status */}
                    <div className="hidden sm:block shrink-0">
                      <StatusBadge status={app.status || "PENDING"} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* View */}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {canAct(app.status) && (
                        <>
                          <button
                            onClick={() => handleUpdate(app.id, "ACCEPTED")}
                            disabled={busy}
                            className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-40"
                          >
                            {busy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleUpdate(app.id, "REJECTED")}
                            disabled={busy}
                            className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40"
                          >
                            {busy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Application details modal ── */}
      <Dialog
        open={!!selectedApp}
        onOpenChange={(open) => {
          if (!open) setSelectedApp(null);
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Application Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Review applicant info and take action
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="px-6 py-5 space-y-5">
              {/* Applicant info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedApp.applicant_name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Applied {formatDate(selectedApp.created_at)}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={selectedApp.status || "PENDING"} />
                  </div>
                </div>
                {typeof selectedApp.job === "object" && selectedApp.job && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-200">
                    <span className="font-medium">Job:</span>
                    <span>
                      {(selectedApp.job as { title?: string }).title ||
                        "Untitled"}
                    </span>
                  </div>
                )}
              </div>

              {/* Cover letter */}
              {selectedApp.cover_letter && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Cover Letter
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedApp.cover_letter}
                    </p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApp.resume && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Resume
                  </p>
                  <button
                    onClick={() => window.open(selectedApp.resume!, "_blank")}
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100">
                {canAct(selectedApp.status) ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleUpdate(selectedApp.id, "ACCEPTED")}
                      disabled={isUpdating === selectedApp.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-xl font-semibold"
                    >
                      {isUpdating === selectedApp.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdate(selectedApp.id, "REJECTED")}
                      disabled={isUpdating === selectedApp.id}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-10 rounded-xl font-semibold"
                    >
                      {isUpdating === selectedApp.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1.5" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <StatusBadge status={selectedApp.status} />
                    <span>— no further action needed</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
