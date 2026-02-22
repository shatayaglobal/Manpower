"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Clock, DollarSign, Building2, Plus,
  Edit, Trash2, Bookmark, Loader2, SlidersHorizontal,
  ChevronLeft, ChevronRight, X, Briefcase, TrendingUp,
} from "lucide-react";
import { usePosts } from "@/lib/redux/usePosts";
import { useSelector } from "react-redux";
import { PostListItem, PostFilters } from "@/lib/types";
import { toast } from "sonner";
import { useProfile } from "@/lib/redux/useProfile";
import { cn } from "@/lib/utils";

interface AuthState {
  user: {
    id: string; email: string;
    account_type: "WORKER" | "BUSINESS";
    first_name: string; last_name: string;
  } | null;
  isAuthenticated: boolean;
}
interface RootState { auth: AuthState; }

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  LOW:    { label: "Part-time",  color: "bg-sky-50 text-sky-700 border-sky-200" },
  MEDIUM: { label: "Full-time",  color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  HIGH:   { label: "Contract",   color: "bg-violet-50 text-violet-700 border-violet-200" },
  URGENT: { label: "Temporary",  color: "bg-red-50 text-red-700 border-red-200" },
};

const TYPE_PILLS = [
  { value: "LOW",    label: "Part-time" },
  { value: "MEDIUM", label: "Full-time" },
  { value: "HIGH",   label: "Contract" },
  { value: "URGENT", label: "Temporary" },
];

function timeAgo(dateString: string) {
  const diffHours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Just posted";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-7 bg-gray-100 rounded-lg w-24" />
      </div>
    </div>
  );
}

function JobCard({
  job, isBusinessUser, currentUserId, onApply, onSave, onEdit, onDelete,
}: {
  job: PostListItem;
  isBusinessUser: boolean;
  currentUserId: string;
  onApply: (id: string, title: string) => void;
  onSave: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const priority = PRIORITY_MAP[job.priority] ?? PRIORITY_MAP.LOW;
  const isOwner = typeof job.user === "object" ? job.user.id === currentUserId : job.user === currentUserId;
  const isUrgent = job.priority === "URGENT";

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="group bg-white rounded-2xl border border-gray-100 p-2 cursor-pointer hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 flex flex-col"
    >
      {/* Top: icon + title + quick actions */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
              {job.title}
            </h3>
            {isUrgent && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 shrink-0 ml-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Urgent
              </span>
            )}
          </div>
          {job.location && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3 shrink-0" />{job.location}
            </div>
          )}
        </div>

        {/* Icon actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          {!isBusinessUser && (
            <button
              onClick={() => onSave(job.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Save"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          )}
          {isBusinessUser && isOwner && (
            <>
              <button
                onClick={() => onEdit(job.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(job.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description preview */}
      {job.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{job.description}</p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-4">
        {job.salary_range && (
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <DollarSign className="w-3 h-3" />{job.salary_range}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />{timeAgo(job.created_at)}
        </span>

      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", priority.color)}>
          {priority.label}
        </span>

        {!isBusinessUser && (
          <button
            onClick={e => { e.stopPropagation(); onApply(job.id, job.title); }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Apply Now →
          </button>
        )}
        {/* {isBusinessUser && isOwner && (
          <span className="text-xs text-gray-400 font-medium">{job.total_applications ?? 0} applicants</span>
        )} */}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { handleApplyWithProfileCheck } = useProfile();
  const {
    posts: jobs, loading, loadPosts, removePost, pokePost,
    hasNextPage, hasPreviousPage, totalPosts, currentPage,
  } = usePosts();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PostFilters>({ page: 1, ordering: "-created_at", post_type: "JOB" });

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchParams.get("success") === "created") {
      toast.success("Job posted successfully!", { description: "Your job is now live and visible to candidates." });
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadPosts({
      ...filters,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedLocation && { location: selectedLocation }),
      ...(selectedType && { priority: selectedType as "LOW" | "MEDIUM" | "HIGH" | "URGENT" }),
    });
  }, [isAuthenticated, loadPosts, filters, searchTerm, selectedLocation, selectedType]);

  if (!isAuthenticated || !user) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  const isBusinessUser = user.account_type === "BUSINESS";
  const activeFilterCount = [selectedLocation, selectedType].filter(Boolean).length;
  const uniqueLocations = [...new Set(jobs.map(j => j.location).filter((l): l is string => !!l?.trim()))];

  const clearFilters = () => {
    setSearchTerm(""); setSelectedLocation(""); setSelectedType("");
    setFilters({ post_type: "JOB", page: 1, ordering: "-created_at" });
  };

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isBusinessUser ? "Manage Jobs" : "Find Jobs"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isBusinessUser
                ? "Post and manage your open positions"
                : totalPosts > 0 ? `${totalPosts} positions available` : "Browse open positions"}
            </p>
          </div>
          {isBusinessUser && (
            <Button
              onClick={() => router.push("/jobs/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0"
            >
              <Plus className="w-4 h-4 mr-1.5" />Post a Job
            </Button>
          )}
        </div>

        {/* ── Search + filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs, keywords..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setFilters(p => ({ ...p, page: 1 }))}
                className="pl-9 h-10 border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(p => !p)}
              className={cn(
                "h-10 px-4 rounded-xl border-gray-200 gap-2 shrink-0 text-sm",
                showFilters && "border-blue-300 bg-blue-50 text-blue-700"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Job Type</p>
                <div className="flex flex-wrap gap-2">
                  {TYPE_PILLS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(selectedType === t.value ? "" : t.value)}
                      className={cn(
                        "text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all",
                        selectedType === t.value
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-600"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {uniqueLocations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Location</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueLocations.map(loc => (
                      <button
                        key={loc}
                        onClick={() => setSelectedLocation(selectedLocation === loc ? "" : loc)}
                        className={cn(
                          "text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all inline-flex items-center gap-1",
                          selectedLocation === loc
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-600"
                        )}
                      >
                        <MapPin className="w-3 h-3" />{loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  <X className="w-3.5 h-3.5" />Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Results ── */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">
              {activeFilterCount > 0 || searchTerm
                ? "Try adjusting your search or clearing your filters."
                : isBusinessUser
                ? "Post your first job to start attracting candidates."
                : "Check back soon for new openings."}
            </p>
            {(activeFilterCount > 0 || searchTerm) ? (
              <Button variant="outline" onClick={clearFilters} className="border-gray-200 text-sm">
                <X className="w-3.5 h-3.5 mr-1.5" />Clear Filters
              </Button>
            ) : isBusinessUser ? (
              <Button onClick={() => router.push("/jobs/create")} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                <Plus className="w-4 h-4 mr-1.5" />Post a Job
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Count row */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{totalPosts}</span> {totalPosts === 1 ? "job" : "jobs"} found
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <TrendingUp className="w-3.5 h-3.5" />Newest first
              </div>
            </div>

            {/* Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  isBusinessUser={isBusinessUser}
                  currentUserId={user.id}
                  onApply={(id, title) => handleApplyWithProfileCheck(id, title)}
                  onSave={id => pokePost(id)}
                  onEdit={id => router.push(`/jobs/${id}/edit`)}
                  onDelete={async id => {
                    if (window.confirm("Delete this job?")) await removePost(id);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {(hasNextPage || hasPreviousPage) && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPreviousPage}
                  onClick={() => setFilters(p => ({ ...p, page: (p.page ?? 1) - 1 }))}
                  className="border-gray-200 h-9 px-4 rounded-xl disabled:opacity-40 text-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />Previous
                </Button>
                <span className="text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-4 h-9 flex items-center min-w-[40px] justify-center">
                  {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage}
                  onClick={() => setFilters(p => ({ ...p, page: (p.page ?? 1) + 1 }))}
                  className="border-gray-200 h-9 px-4 rounded-xl disabled:opacity-40 text-sm"
                >
                  Next<ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
