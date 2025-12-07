"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  Briefcase,
  Loader2,
} from "lucide-react";
import { usePosts } from "@/lib/redux/usePosts";
import { useSelector } from "react-redux";
import { PostListItem, PostFilters } from "@/lib/types";
import { toast } from "sonner";
import { useProfile } from "@/lib/redux/useProfile";

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

export default function Jobs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { handleApplyWithProfileCheck } = useProfile();
  const {
    posts: jobs,
    loading,
    loadPosts,
    removePost,
    pokePost,
    hasNextPage,
    hasPreviousPage,
    totalPosts,
    currentPage,
  } = usePosts();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [filters, setFilters] = useState<PostFilters>({
    page: 1,
    ordering: "-created_at",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchParams.get("success") === "created") {
      toast.success("Job posting created successfully!", {
        description: "Your job is now live and visible to candidates.",
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      const filterParams: PostFilters = {
        ...filters,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedLocation && { location: selectedLocation }),
        ...(selectedType && {
          priority: selectedType as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        }),
      };
      loadPosts(filterParams);
    }
  }, [
    isAuthenticated,
    loadPosts,
    filters,
    searchTerm,
    selectedLocation,
    selectedType,
  ]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const isBusinessUser = user.account_type === "BUSINESS";

  const handleSearch = () => setFilters((prev) => ({ ...prev, page: 1 }));
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      await pokePost(jobId);
    } catch (err) {
      // handled in Redux
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      await removePost(jobId);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setSelectedType("");
    setFilters({
      post_type: "JOB",
      page: 1,
      ordering: "-created_at",
    });
  };

  const getUniqueLocations = () => {
    const locations = jobs
      .map((job) => job.location)
      .filter(
        (loc): loc is string => typeof loc === "string" && loc.trim() !== ""
      );
    return [...new Set(locations)];
  };

  const showJobDetails = (job: PostListItem) => {
    router.push(`/jobs/${job.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const jobTypes = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const formatJobType = (priority: string) => {
    const map = {
      LOW: "Part-time",
      MEDIUM: "Full-time",
      HIGH: "Contract",
      URGENT: "Temporary",
    };
    return map[priority as keyof typeof map] || priority;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-4 lg:px-4 py-6">
        {/* Page Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isBusinessUser ? "Manage Jobs" : "Find Your Dream Job"}
            </h1>
            <p className="mt-2 text-gray-600">
              {isBusinessUser
                ? "Post and manage job openings"
                : "Browse and apply to jobs that match your skills"}
            </p>
          </div>

          {isBusinessUser && (
            <Button
              size="lg"
              onClick={() => router.push("/jobs/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Post New Job
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search jobs, companies, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-12 pl-10 bg-white border-gray-300 shadow-sm"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="h-12 rounded-lg border border-gray-300 bg-white px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {getUniqueLocations().map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="h-12 rounded-lg border border-gray-300 bg-white px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {formatJobType(type)}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-12 shadow-sm hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-lg font-medium text-gray-700">
            {totalPosts} {totalPosts === 1 ? "job" : "jobs"} found
          </p>
        </div>

        {/* Loading / Empty State / Jobs Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="mb-3 text-2xl font-semibold text-gray-900">
              No jobs found
            </h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => showJobDetails(job)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <Building className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
                          {job.title}
                        </h3>
                      </div>

                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!isBusinessUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveJob(job.id)}
                          >
                            <Heart className="h-5 w-5" />
                          </Button>
                        )}
                        {isBusinessUser &&
                          user.id ===
                            (typeof job.user === "object"
                              ? job.user.id
                              : job.user) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/jobs/${job.id}/edit`)
                                }
                              >
                                <Edit className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                              >
                                <Trash2 className="h-5 w-5 text-red-500" />
                              </Button>
                            </>
                          )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-amber-600" />
                        {job.location || "Remote"}
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          {job.salary_range}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {formatDate(job.created_at)}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <Badge variant="secondary" className="font-medium">
                        {formatJobType(job.priority)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {job.total_likes} likes • {job.total_pokes} saved
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-gray-600">
                      {job.description}
                    </p>

                    {/* Actions */}
                    <div className="mt-6 space-y-3 border-t pt-5">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          showJobDetails(job);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      {!isBusinessUser && (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyWithProfileCheck(job.id, job.title);
                          }}
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {(hasNextPage || hasPreviousPage) && jobs.length > 0 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={!hasPreviousPage}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="font-medium text-gray-700">
                  Page {currentPage}
                </span>
                <Button
                  variant="outline"
                  disabled={!hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
