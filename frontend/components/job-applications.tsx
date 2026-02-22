"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  ArrowLeft,
  Briefcase,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { useApplications } from "@/lib/redux/use-applications";
import { JobApplication } from "@/lib/types";
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
    icon: Eye,
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

function formatDate(dateString: string) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="hidden sm:flex gap-6">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
      <div className="h-6 bg-gray-100 rounded-full w-20" />
    </div>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    applications,
    loading,
    error,
    loadUserApplications,
    clearApplicationError,
  } = useApplications();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.account_type !== "WORKER") {
      router.push("/jobs");
      return;
    }
    loadUserApplications();
  }, [isAuthenticated, user, router, loadUserApplications]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Status summary counts
  const counts = applications.reduce((acc, app) => {
    const s = (app.status || "PENDING").toUpperCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Back nav ── */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Applications
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {applications.length > 0
                ? `${applications.length} application${
                    applications.length === 1 ? "" : "s"
                  } submitted`
                : "Track all your job applications here"}
            </p>
          </div>

          {/* Status summary pills */}
          {applications.length > 0 && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {Object.entries(counts).map(([status, count]) => {
                const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
                const Icon = s.icon;
                return (
                  <span
                    key={status}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border",
                      s.color
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {count} {s.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearApplicationError}
              className="border-red-200 text-red-700 hover:bg-red-100 shrink-0"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* ── Content ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                Start exploring opportunities and apply to jobs that match your
                skills.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push("/jobs")}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {applications.map(
                (application: JobApplication, index: number) => {
                  const job =
                    typeof application.job === "object" &&
                    application.job !== null
                      ? application.job
                      : null;
                  const status = (
                    application.status || "PENDING"
                  ).toUpperCase();
                  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
                  const Icon = s.icon;

                  return (
                    <div
                      key={application.id || `app-${index}`}
                      onClick={() => {
                        const jobId =
                          typeof application.job === "object" &&
                          application.job !== null
                            ? (application.job as { id: string }).id
                            : application.job;
                        if (jobId) router.push(`/jobs/${jobId}`);
                      }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Job icon */}
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>

                      {/* Job title + description */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700 transition-colors">
                          {job?.title || "Job Title Not Available"}
                        </p>
                        {job?.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {job.description}
                          </p>
                        )}
                      </div>

                      {/* Meta — hidden on mobile */}
                      <div className="hidden md:flex items-center gap-6 shrink-0">
                        {job?.location ? (
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {job.location}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No location
                          </span>
                        )}

                        {job?.salary_range ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <DollarSign className="w-3.5 h-3.5 shrink-0" />
                            {job.salary_range}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 w-20">—</span>
                        )}

                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          {formatDate(application.created_at)}
                        </span>
                      </div>

                      {/* Status badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0",
                          s.color
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {s.label}
                      </span>

                      {/* Arrow hint */}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors" />
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
