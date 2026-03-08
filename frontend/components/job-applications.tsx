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
  MoreHorizontal,
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

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50">
          <td className="px-5 py-3.5">
            <div className="space-y-1.5">
              <div className="h-3.5 bg-gray-100 rounded w-36" />
              <div className="h-3 bg-gray-100 rounded w-52" />
            </div>
          </td>
          <td className="px-5 py-3.5 hidden md:table-cell">
            <div className="h-3 bg-gray-100 rounded w-28" />
          </td>
          <td className="px-5 py-3.5 hidden lg:table-cell">
            <div className="h-3 bg-gray-100 rounded w-20" />
          </td>
          <td className="px-5 py-3.5 hidden sm:table-cell">
            <div className="h-3 bg-gray-100 rounded w-24" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-6 bg-gray-100 rounded-full w-20" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-7 bg-gray-100 rounded-lg w-16 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

function ActionMenu({ onView }: { onView: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, right: 0 });
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((p) => !p);
  };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos.top,
            right: pos.right,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[120px]"
        >
          <button
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            View Job
          </button>
        </div>
      )}
    </>
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

  const counts = applications.reduce((acc, app) => {
    const s = (app.status || "PENDING").toUpperCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Back ── */}
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
          {applications.length > 0 && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {Object.entries(counts).map(([status, count]) => {
                const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
                const Icon = s.icon;
                return (
                  <span
                    key={status}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-base font-semibold px-3 py-1.5 rounded-full border",
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

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {applications.length === 0 && !loading ? (
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-5 py-3.5 text-base font-semibold text-gray-400 uppercase tracking-wide">
                      Job
                    </th>
                    <th className="text-left px-5 py-3.5 text-base font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">
                      Location
                    </th>
                    <th className="text-left px-5 py-3.5 text-base font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                      Salary
                    </th>
                    <th className="text-left px-5 py-3.5 text-base font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                      Applied
                    </th>
                    <th className="text-left px-5 py-3.5 text-base font-semibold text-gray-400 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-base font-semibold text-gray-400 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <TableSkeleton />
                  ) : (
                    applications.map(
                      (application: JobApplication, index: number) => {
                        const job =
                          typeof application.job === "object" &&
                          application.job !== null
                            ? application.job
                            : null;
                        const status = (
                          application.status || "PENDING"
                        ).toUpperCase();
                        const s =
                          STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
                        const Icon = s.icon;
                        const jobId =
                          typeof application.job === "object" &&
                          application.job !== null
                            ? (application.job as { id: string }).id
                            : application.job;

                        return (
                          <tr
                            key={application.id || `app-${index}`}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            {/* Job */}
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px] sm:max-w-[260px]">
                                {job?.title || "Job Title Not Available"}
                              </p>
                              {job?.description && (
                                <p className="text-base text-gray-400 truncate mt-0.5 max-w-[180px] sm:max-w-[260px]">
                                  {job.description}
                                </p>
                              )}
                            </td>

                            {/* Location */}
                            <td className="px-5 py-3.5 hidden md:table-cell">
                              {job?.location ? (
                                <span className="flex items-center gap-1.5 text-base text-gray-500">
                                  {job.location}
                                </span>
                              ) : (
                                <span className="text-base text-gray-300">—</span>
                              )}
                            </td>

                            {/* Salary */}
                            <td className="px-5 py-3.5 hidden lg:table-cell">
                              {job?.salary_range ? (
                                <span className="flex items-center gap-1 text-base text-emerald-700 font-semibold">
                                  {job.salary_range}
                                </span>
                              ) : (
                                <span className="text-base text-gray-300">—</span>
                              )}
                            </td>

                            {/* Applied date */}
                            <td className="px-5 py-3.5 hidden sm:table-cell">
                              <span className="flex items-center gap-1.5 text-base text-gray-400">
                                {formatDate(application.created_at)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 text-base font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap",
                                  s.color
                                )}
                              >
                                <Icon className="w-3 h-3" />
                                {s.label}
                              </span>
                            </td>
                            {/* Action */}
                            <td className="px-5 py-3.5">
                              <div className="flex justify-end">
                                <ActionMenu
                                  onView={() => {
                                    if (jobId) router.push(`/jobs/${jobId}`);
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
