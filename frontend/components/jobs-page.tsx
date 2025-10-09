"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Users,
  X,
  Loader2,
} from "lucide-react";
import { usePosts } from "@/lib/redux/usePosts";
import { useSelector } from "react-redux";
import { PostListItem, PostFilters } from "@/lib/types";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
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
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { handleApplyWithProfileCheck } = useProfile();
  const {
    posts: jobs,
    selectedPost: selectedJob,
    loading,
    error,
    loadPosts,
    removePost,
    pokePost,
    clearPostError,
    hasNextPage,
    hasPreviousPage,
    totalPosts,
    currentPage,
  } = usePosts();

  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [filters, setFilters] = useState<PostFilters>({
    //post_type: 'JOB',
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  const isBusinessUser = user.account_type === "BUSINESS";

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

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
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await removePost(jobId);
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
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
      .filter((location): location is string => {
        return typeof location === "string" && location.trim() !== "";
      });

    const uniqueLocations = [...new Set(locations)];
    return uniqueLocations.length > 0
      ? uniqueLocations
      : ["No locations available"];
  };

  const showJobDetails = (job: PostListItem) => {
    router.push(`/jobs/${job.id}`);
  };

  const closeJobDetails = () => {
    setShowJobDetail(false);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const jobTypes = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const formatJobType = (priority: string) => {
    const typeMap = {
      LOW: "Part-time",
      MEDIUM: "Full-time",
      HIGH: "Contract",
      URGENT: "Temporary",
    };
    return typeMap[priority as keyof typeof typeMap] || priority;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  if (showJobDetail && selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            variant="outline"
            onClick={closeJobDetails}
            className="mb-6 border-gray-300 text-blue-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
          >
            ← Back to Jobs
          </Button>

          <Card className="bg-white border-gray-200 shadow-md rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    {selectedJob.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-blue-700 mt-1">
                    {typeof selectedJob.user === "object"
                      ? selectedJob.user.email
                      : selectedJob.user}{" "}
                    • {selectedJob.location}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={closeJobDetails}
                  className="p-2 text-blue-700 hover:text-blue-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 font-medium"
                >
                  {formatJobType(selectedJob.priority)}
                </Badge>
                {selectedJob.salary_range && (
                  <div className="flex items-center text-base text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-amber-600" />
                    {selectedJob.salary_range}
                  </div>
                )}
                <div className="flex items-center text-base text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-amber-600" />
                  Posted {formatDate(selectedJob.created_at)}
                </div>
                <div className="flex items-center text-base text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-amber-600" />
                  {selectedJob.location}
                </div>
                <div className="flex items-center text-base text-gray-600">
                  <Eye className="h-4 w-4 mr-2 text-amber-600" />
                  {selectedJob.view_count} views
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-xl text-gray-900 mb-3">
                  Job Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">
                    Requirements
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                    {selectedJob.requirements}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                {!isBusinessUser ? (
                  <>
                    <Button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-base py-6 rounded-md">
                      Apply Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSaveJob(selectedJob.id)}
                      className="py-6 border-gray-300 text-blue-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                    >
                      <Heart className="h-5 w-5 text-blue-700" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 py-6 border-gray-300 text-blue-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                    >
                      <Users className="h-5 w-5 mr-2 text-amber-600" />
                      View Applications
                    </Button>
                    <Button
                      className="flex-1 py-6 bg-blue-700 hover:bg-blue-800 text-white rounded-md"
                      onClick={() => router.push(`/edit-job/${selectedJob.id}`)}
                    >
                      <Edit className="h-5 w-5 mr-2 text-amber-600" />
                      Edit Job
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
            <Button variant="outline" onClick={clearPostError} className="mt-2">
              Dismiss
            </Button>
          </div>
        )}

        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isBusinessUser ? "Manage Jobs" : "Find Your Dream Job"}
              </h1>
              <p className="text-base text-gray-600 mt-2">
                {isBusinessUser
                  ? "Manage your job postings and view applications"
                  : "Discover opportunities that match your skills and interests"}
              </p>
            </div>

            {isBusinessUser && (
              <Button
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-md shadow-md"
                onClick={() => router.push("/jobs/create")}
              >
                <Plus className="h-4 w-4 mr-2 text-amber-600" />
                Post New Job
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-10 bg-white border-gray-200 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {isBusinessUser ? "Filter Your Jobs" : "Search Jobs"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-600" />
                  <Input
                    placeholder={
                      isBusinessUser
                        ? "Search your jobs..."
                        : "Search jobs, companies, or keywords..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-gray-300 focus:ring-blue-700 bg-white rounded-md text-base"
                  />
                </div>
              </div>

              <div className="w-full lg:w-48">
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2.5 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white shadow-sm"
                >
                  <option value="">All Locations</option>
                  {getUniqueLocations().map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full lg:w-40">
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2.5 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white shadow-sm"
                >
                  <option value="">All Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatJobType(type)}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full lg:w-auto border-gray-300 text-blue-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600 text-base">
            {totalPosts} {totalPosts === 1 ? "job" : "jobs"} found
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="bg-white border-gray-200 shadow-md rounded-lg group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center shadow-sm">
                          <Building className="h-6 w-6 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-base text-blue-700 mt-1">
                            {typeof job.user === "object"
                              ? `${job.user.first_name || ""} ${
                                  job.user.last_name || ""
                                }`.trim() || job.user.email
                              : job.user}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isBusinessUser ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveJob(job.id)}
                            className="p-2 text-blue-700 hover:text-amber-600"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        ) : (
                          user.id ===
                            (typeof job.user === "object"
                              ? job.user.id
                              : job.user) && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-blue-700 hover:text-blue-800"
                                onClick={() =>
                                  router.push(`/jobs/${job.id}/edit`)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-blue-700 hover:text-amber-600"
                                onClick={() => handleDeleteJob(job.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-base">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-amber-600" />
                        <span>{job.location}</span>
                      </div>

                      {job.salary_range && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2 text-amber-600" />
                          <span>{job.salary_range}</span>
                        </div>
                      )}

                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-amber-600" />
                        <span>Posted {formatDate(job.created_at)}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Eye className="h-4 w-4 mr-2 text-amber-600" />
                        <span>{job.view_count} views</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 font-medium"
                      >
                        {formatJobType(job.priority)}
                      </Badge>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{job.total_likes} likes</span>
                        <span>{job.total_pokes} saved</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-base line-clamp-2">
                      {job.description}
                    </p>

                    <div className="pt-4 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-blue-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                        onClick={() => showJobDetails(job)}
                      >
                        <Eye className="h-4 w-4 mr-2 text-blue-700" />
                        View Details
                      </Button>

                      {!isBusinessUser && (
                        <Button
                          className="w-full bg-blue-700 hover:bg-blue-800 text-lg px-8 py-3"
                          //onClick={() => router.push(`/jobs/${job.id}/apply`)}
                          onClick={() =>
                            handleApplyWithProfileCheck(job.id, job.title)
                          }
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {(hasNextPage || hasPreviousPage) && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="border-gray-300 text-blue-700 hover:bg-amber-50 hover:text-amber-600"
                >
                  Previous
                </Button>
                <span className="text-gray-600">Page {currentPage}</span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="border-gray-300 text-blue-700 hover:bg-amber-50 hover:text-amber-600"
                >
                  Next
                </Button>
              </div>
            )}

            {jobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 text-base mb-4">
                  Try adjusting your search criteria or clearing filters
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-gray-300 text-blue-700 hover:bg-amber-50 hover:text-amber-600 rounded-md"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
