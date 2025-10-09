"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Heart,
  Users,
  Building,
  Briefcase,
  Calendar,
  Loader2,
} from "lucide-react";
import { usePosts } from "@/lib/redux/usePosts";
import { useSelector } from "react-redux";

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

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    selectedPost: job,
    loading,
    error,
    loadPost,
    likePost,
    pokePost,
  } = usePosts();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (jobId && isAuthenticated) {
      loadPost(jobId);
    }
  }, [jobId, isAuthenticated, loadPost]);

  const handleSaveJob = async () => {
    if (!job) return;
    try {
      await pokePost(job.id);
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleLikeJob = async () => {
    if (!job) return;
    try {
      await likePost(job.id);
    } catch (error) {
      console.error("Failed to like job:", error);
    }
  };

  const formatJobType = (priority: string) => {
    const typeMap = {
      LOW: "Low Priority",
      MEDIUM: "Medium Priority",
      HIGH: "High Priority",
      URGENT: "Urgent",
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

  const isBusinessUser = user?.account_type === "BUSINESS";
  const isOwner =
    job &&
    user &&
    (typeof job.user === "object"
      ? job.user.id === user.id
      : job.user === user.id);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <Briefcase className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Job
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => router.push("/jobs")}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Job Not Found
              </h3>
              <p className="text-gray-600 mb-4">
                The job you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
              <Button variant="outline" onClick={() => router.push("/jobs")}>
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Navigation */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/jobs")}
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            {/* Job Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <Building className="h-8 w-8 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-amber-600" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-amber-600" />
                    Posted {formatDate(job.created_at)}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-amber-600" />
                    {job.view_count} views
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-amber-600" />
                      {job.salary_range}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 font-medium"
                >
                  {formatJobType(job.priority)}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {isOwner ? (
                <>
                  <Button
                    className="bg-blue-700 hover:bg-blue-800"
                    onClick={() => router.push(`/jobs/${job.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Job
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300"
                    onClick={() => router.push(`/jobs/${job.id}/applications`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Applications ({job.total_applications || 0})
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="bg-blue-700 hover:bg-blue-800 text-lg px-8 py-3"
                    onClick={() => router.push(`/jobs/${job.id}/apply`)}
                  >
                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveJob}
                    className="border-gray-300"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Save ({job.total_pokes})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLikeJob}
                    className="border-gray-300"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Like ({job.total_likes})
                  </Button>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Job Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Job Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Requirements
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Job Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Job Type</span>
                    <p className="font-medium">{formatJobType(job.priority)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Location</span>
                    <p className="font-medium">{job.location}</p>
                  </div>
                  {job.salary_range && (
                    <div>
                      <span className="text-sm text-gray-500">
                        Salary Range
                      </span>
                      <p className="font-medium">{job.salary_range}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Timeline</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Posted</span>
                    <p className="font-medium">{formatDate(job.created_at)}</p>
                  </div>
                  {job.expires_at && (
                    <div>
                      <span className="text-sm text-gray-500">
                        Application Deadline
                      </span>
                      <p className="font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-amber-600" />
                        {new Date(job.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Business Owner Only Fields */}
                  {isBusinessUser && isOwner && (
                    <>
                      {job.updated_at && job.updated_at !== job.created_at && (
                        <div>
                          <span className="text-sm text-gray-500">
                            Last Updated
                          </span>
                          <p className="font-medium">
                            {formatDate(job.updated_at)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
