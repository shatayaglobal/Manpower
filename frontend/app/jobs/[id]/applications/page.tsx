"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Users, Loader2, FileText, Calendar,
  ChevronDown, ChevronUp, CheckCircle, XCircle,
  Clock, Briefcase, Eye, Filter,
} from "lucide-react";
import { useSelector } from "react-redux";
import { usePosts } from "@/lib/redux/usePosts";
import { useApplications } from "@/lib/redux/use-applications";
import { JobApplication } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  applications: {
    applications: JobApplication[];
    loading: boolean;
    error: string | null;
  };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const STATUS_CONFIG = {
  PENDING:  { label: "Pending",  color: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-400" },
  REVIEWED: { label: "Reviewed", color: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-400" },
  ACCEPTED: { label: "Accepted", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  REJECTED: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200",        dot: "bg-red-400" },
} as const;

function ApplicationSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-gray-100 rounded w-32" />
            <div className="h-2.5 bg-gray-100 rounded w-24" />
          </div>
        </div>
        <div className="h-6 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-100 rounded-xl flex-1" />
        <div className="h-8 bg-gray-100 rounded-xl flex-1" />
      </div>
    </div>
  );
}

function ApplicationCard({
  application,
  onAccept,
  onReject,
  loading,
}: {
  application: JobApplication;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const initials = application.applicant_name
    ? application.applicant_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-blue-700">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {application.applicant_name || "Unknown Applicant"}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 shrink-0" />
                Applied {formatDate(application.created_at)}
              </p>
            </div>
          </div>

          {/* Right side: status + actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status badge */}
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", status.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>

            {/* Resume */}
            {application.resume_url && (
              <a
                href={application.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors"
                title="View Resume"
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Expand */}
            <button
              onClick={() => setExpanded((p) => !p)}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Action buttons for PENDING */}
        {application.status === "PENDING" && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onAccept(application.id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Accept
            </button>
            <button
              onClick={() => onReject(application.id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          {application.cover_letter && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cover Letter</p>
              <div className="bg-gray-50 rounded-xl p-3.5 max-h-36 overflow-y-auto">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {application.cover_letter}
                </p>
              </div>
            </div>
          )}

          {application.additional_info && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Additional Info</p>
              <div className="bg-gray-50 rounded-xl p-3.5">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {application.additional_info}
                </p>
              </div>
            </div>
          )}

          {application.reviewed_at && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              Reviewed {formatDate(application.reviewed_at)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_FILTERS = ["ALL", "PENDING", "REVIEWED", "ACCEPTED", "REJECTED"] as const;

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { selectedPost: job, loadPost } = usePosts();
  const {
    applications,
    loading: applicationsLoading,
    error: applicationsError,
    loadJobApplications,
    updateApplicationStatus,
  } = useApplications();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (jobId) {
      loadPost(jobId);
      loadJobApplications(jobId);
    }
  }, [jobId, isAuthenticated]);

  const isOwner =
    job && user &&
    (typeof job.user === "object" ? job.user.id === user.id : job.user === user.id);

  const filteredApplications = applications.filter((app) =>
    statusFilter === "ALL" ? true : app.status === statusFilter
  );

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAccept = async (id: string) => {
    try {
      await updateApplicationStatus(id, "ACCEPTED");
      toast.success("Application accepted!");
      loadJobApplications(jobId);
    } catch {
      toast.error("Failed to accept application");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateApplicationStatus(id, "REJECTED");
      toast.success("Application rejected.");
      loadJobApplications(jobId);
    } catch {
      toast.error("Failed to reject application");
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isOwner && !applicationsLoading) {
    return (
      <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md mx-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-sm text-gray-500 mb-5">You don&apos;t have permission to view applications for this job.</p>
          <Button onClick={() => router.push("/jobs")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => router.push(`/jobs/${jobId}`)}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                Applications — {job?.title || "Loading..."}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {applications.length} {applications.length === 1 ? "applicant" : "applicants"} total
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"] as const).map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{cfg.label}</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts[s] || 0}</p>
              </div>
            );
          })}
        </div>

        {/* ── Filter tabs ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {STATUS_FILTERS.map((f) => {
              const count = f === "ALL" ? applications.length : (statusCounts[f] || 0);
              const active = statusFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all",
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  )}
                >
                  {f === "ALL" ? "All" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG].label}
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-bold",
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Applications list ── */}
        {applicationsLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <ApplicationSkeleton key={i} />)}
          </div>
        ) : applicationsError ? (
          <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Failed to load applications</p>
            <p className="text-xs text-gray-400 mb-4">{applicationsError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadJobApplications(jobId)}
              className="border-gray-200 rounded-xl text-sm"
            >
              Try Again
            </Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No applications found</p>
            <p className="text-xs text-gray-400">
              {statusFilter === "ALL"
                ? "No one has applied to this job yet."
                : `No ${statusFilter.toLowerCase()} applications.`}
            </p>
            {statusFilter !== "ALL" && (
              <button
                onClick={() => setStatusFilter("ALL")}
                className="mt-4 text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View all applications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onAccept={handleAccept}
                onReject={handleReject}
                loading={applicationsLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
