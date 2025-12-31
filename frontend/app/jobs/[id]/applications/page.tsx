"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Loader2,
  FileText,
  Calendar,
  ChevronUp,
  Eye,
} from "lucide-react";
import { useSelector } from "react-redux";
import { usePosts } from "@/lib/redux/usePosts";
import { useApplications } from "@/lib/redux/use-applications";
import { JobApplication } from "@/lib/types";

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
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
};

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  // Redux selectors
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { selectedPost: job, loadPost } = usePosts();
  const {
    applications,
    loading: applicationsLoading,
    error: applicationsError,
    loadJobApplications,
  } = useApplications();

  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(
    new Set()
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (jobId && isAuthenticated) {
      loadPost(jobId);
      loadJobApplications(jobId);
    }
  }, [jobId, isAuthenticated, loadPost, loadJobApplications, router]);

  const toggleExpanded = (applicationId: string) => {
    const newExpanded = new Set(expandedApplications);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedApplications(newExpanded);
  };

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "ALL") return true;
    return app.status === statusFilter;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Access Denied
              </h3>
              <p className="text-red-700 mb-4">
                You do not have permission to view applications for this job.
              </p>
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

  if (applicationsLoading) {
    return (
      <div className="min-h-screen bg-whites">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          </div>
        </div>
      </div>
    );
  }

  if (applicationsError) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Applications
              </h3>
              <p className="text-red-700 mb-4">{applicationsError}</p>
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

  return (
     <div className="bg-white rounded-lg p-2 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Navigation */}
        {/* Header */}
        <div className="mb-6 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/jobs/${jobId}`)}
              className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 p-2 -ml-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Applications for {job?.title || "Job"}
            </h1>
          </div>
          <p className="text-gray-600">
            {applications.length}{" "}
            {applications.length === 1 ? "application" : "applications"}{" "}
            received
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("ALL")}
              className="text-sm"
            >
              All ({applications.length})
            </Button>
            <Button
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("PENDING")}
              className="text-sm"
            >
              Pending ({statusCounts["PENDING"] || 0})
            </Button>
            <Button
              variant={statusFilter === "REVIEWED" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("REVIEWED")}
              className="text-sm"
            >
              Reviewed ({statusCounts["REVIEWED"] || 0})
            </Button>
            <Button
              variant={statusFilter === "ACCEPTED" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("ACCEPTED")}
              className="text-sm"
            >
              Accepted ({statusCounts["ACCEPTED"] || 0})
            </Button>
            <Button
              variant={statusFilter === "REJECTED" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("REJECTED")}
              className="text-sm"
            >
              Rejected ({statusCounts["REJECTED"] || 0})
            </Button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-3">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Applications Found
                </h3>
                <p className="text-gray-600">
                  {statusFilter === "ALL"
                    ? "No one has applied to this job yet."
                    : `No ${statusFilter.toLowerCase()} applications found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => {
              const isExpanded = expandedApplications.has(application.id);
              return (
                <Card
                  key={application.id}
                  className="border-gray-200 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    {/* Compact View */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900">
                              {application.applicant_name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={
                                application.status === "ACCEPTED"
                                  ? "border-green-300 text-green-700 bg-green-50"
                                  : application.status === "REJECTED"
                                  ? "border-red-300 text-red-700 bg-red-50"
                                  : application.status === "PENDING"
                                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                                  : "border-blue-300 text-blue-700 bg-blue-50"
                              }
                            >
                              {application.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Applied {formatDate(application.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {application.resume_url && (
                            <a
                              href={application.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Download Resume"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          )}

                          {application.status === "PENDING" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 py-1 text-xs border-green-300 text-green-700 hover:bg-green-50"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 py-1 text-xs border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(application.id)}
                            className="p-2"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Cover Letter
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {application.cover_letter}
                            </p>
                          </div>
                        </div>

                        {application.additional_info && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Additional Information
                            </h4>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {application.additional_info}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Applied {formatDate(application.created_at)}
                          {application.reviewed_at && (
                            <span className="ml-3">
                              • Reviewed {formatDate(application.reviewed_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Load More / Pagination can go here if needed */}
      </div>
    </div>
  );
}
