"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, MapPin, Clock, DollarSign, Eye, Edit, Users,
  Building2, Briefcase, Calendar, Loader2, Bookmark, ThumbsUp,
  CheckCircle2, AlertCircle, ChevronRight, TrendingUp,
} from "lucide-react";
import { usePosts } from "@/lib/redux/usePosts";
import { useSelector } from "react-redux";

interface AuthState {
  user: {
    id: string; email: string;
    account_type: "WORKER" | "BUSINESS";
    first_name: string; last_name: string;
  } | null;
  isAuthenticated: boolean;
}
interface RootState { auth: AuthState; }

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  LOW:    { label: "Part-time",  color: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-200" },
  MEDIUM: { label: "Full-time",  color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  HIGH:   { label: "Contract",   color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200" },
  URGENT: { label: "Urgent",     color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200" },
};

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Just posted";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { selectedPost: job, loading, error, loadPost, likePost, pokePost } = usePosts();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (jobId && isAuthenticated) loadPost(jobId);
  }, [jobId, isAuthenticated, loadPost]);

  if (!isAuthenticated || !user) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (loading) {
    return (
      <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5 animate-pulse">
          <div className="h-7 w-28 bg-gray-200 rounded-lg" />
          <div className="h-40 bg-white rounded-2xl border border-gray-100" />
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="h-72 bg-white rounded-2xl border border-gray-100" />
              <div className="h-52 bg-white rounded-2xl border border-gray-100" />
            </div>
            <div className="h-64 bg-white rounded-2xl border border-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4 flex items-center justify-center">
        <Card className="shadow-none border border-gray-100 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{error ? "Error loading job" : "Job not found"}</h3>
            <p className="text-gray-500 text-sm mb-6">{error || "This job doesn't exist or has been removed."}</p>
            <Button onClick={() => router.push("/jobs")} className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = job && user && (typeof job.user === "object" ? job.user.id === user.id : job.user === user.id);
  const priority = PRIORITY_CONFIG[job.priority] ?? PRIORITY_CONFIG.MEDIUM;
  const isUrgent = job.priority === "URGENT";
  const descriptionParagraphs = job.description?.split(/\n\n+/).filter(Boolean) || [];
  const requirementLines = job.requirements?.split(/\n/).filter((l: string) => l.trim()) || [];

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* ── Back ── */}
        <button
          onClick={() => router.push("/jobs")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        {/* ────────────────────────────────────────────────────────────
            HEADER CARD
            Layout: icon | title+meta (flex-1) | actions (shrink-0)
            No empty right side — actions column fills it intentionally
        ──────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {isUrgent && <div className="h-1 bg-gradient-to-r from-red-400 via-red-500 to-orange-400" />}

          <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-start gap-5">

            {/* Company icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center shrink-0">
              <Building2 className="h-7 w-7 text-blue-600" />
            </div>

            {/* Title + meta — takes remaining space */}
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${priority.bg} ${priority.color} ${priority.border}`}>
                  {priority.label}
                </span>
                {isUrgent && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />Hiring Now
                  </span>
                )}
                {job.is_featured && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">⭐ Featured</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-3">{job.title}</h1>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500">
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />{job.location}
                  </span>
                )}
                {job.salary_range && (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <DollarSign className="h-3.5 w-3.5 shrink-0" />{job.salary_range}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />{timeAgo(job.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-gray-400 shrink-0" />{job.view_count ?? 0} views
                </span>
                {job.expires_at && (
                  <span className="flex items-center gap-1.5 text-orange-600">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Closes {new Date(job.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>

            {/* ── Right actions column — fills the empty space ── */}
            <div className="flex flex-col items-stretch gap-2.5 shrink-0 sm:min-w-[180px]">
              {isOwner ? (
                <>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
                    onClick={() => router.push(`/jobs/${job.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1.5" />Edit Job
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 h-10"
                    onClick={() => router.push(`/jobs/${job.id}/applications`)}
                  >
                    <Users className="h-4 w-4 mr-1.5" />
                    {job.total_applications || 0} Applicants
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 shadow-sm hover:shadow-md transition-all"
                    onClick={() => router.push(`/jobs/${job.id}/apply`)}
                  >
                    Apply Now <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-700 h-10 gap-1.5"
                    onClick={() => pokePost(job.id)}
                  >
                    <Bookmark className="h-4 w-4" />
                    Save Job
                    {job.total_pokes > 0 && <span className="text-xs text-gray-400 ml-1">({job.total_pokes})</span>}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:border-violet-200 hover:text-violet-700 h-10 gap-1.5"
                    onClick={() => likePost(job.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Like
                    {job.total_likes > 0 && <span className="text-xs text-gray-400 ml-1">({job.total_likes})</span>}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />Job Description
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed text-sm">
                {descriptionParagraphs.length > 0
                  ? descriptionParagraphs.map((para: string, i: number) => <p key={i}>{para}</p>)
                  : <p>{job.description}</p>}
              </div>
            </div>

            {job.requirements && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-violet-500 rounded-full" />Requirements
                </h2>
                <ul className="space-y-2.5">
                  {requirementLines.map((line: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{line.replace(/^[-•*\d+.]\s*/, "").trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Job details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Job Details</p>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Job Type</p>
                    <p className="text-sm font-semibold text-gray-900">{priority.label}</p>
                  </div>
                </div>
                {job.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-sm font-semibold text-gray-900">{job.location}</p>
                    </div>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Salary</p>
                      <p className="text-sm font-semibold text-emerald-700">{job.salary_range}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Posted</p>
                    <p className="text-sm font-semibold text-gray-900">{timeAgo(job.created_at)}</p>
                  </div>
                </div>
                {job.expires_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Deadline</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(job.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance — owner only */}
            {isOwner && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />Performance
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-gray-900">{job.view_count ?? 0}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Views</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-blue-700">{job.total_applications ?? 0}</p>
                    <p className="text-xs text-blue-400 mt-0.5">Applied</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3">
                    <p className="text-xl font-bold text-violet-700">{job.total_likes ?? 0}</p>
                    <p className="text-xs text-violet-400 mt-0.5">Likes</p>
                  </div>
                </div>
                {job.updated_at && job.updated_at !== job.created_at && (
                  <p className="text-xs text-gray-400 text-center mt-3">Updated {timeAgo(job.updated_at)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
