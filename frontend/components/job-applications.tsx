"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Briefcase,
  DollarSign,
} from "lucide-react";
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return <Clock className="h-3 w-3 text-amber-600" />;
      case "REVIEWED":
        return <AlertCircle className="h-3 w-3 text-blue-600" />;
      case "ACCEPTED":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* Title + description stacked vertically */}
            <div className="flex-1 flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900">
                My Job Applications
              </h1>
              <p className="text-gray-600 text-lg">
                Track your job applications and their current status.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
            <Button
              variant="outline"
              onClick={clearApplicationError}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          </div>
        ) : (
          <>
            {/* Applications Table */}
            {applications.length > 0 ? (
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Applications ({applications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Job Title
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Location
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Salary
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Applied Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {applications.map(
                          (application: JobApplication, index: number) => {
                            // Type guard to check if job is an object
                            const job =
                              typeof application.job === "object" &&
                              application.job !== null
                                ? application.job
                                : null;

                            return (
                              <tr
                                key={
                                  application.id ||
                                  `temp-app-${index}-${application.created_at}`
                                }
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-4 px-4">
                                  <div className="font-medium text-gray-900">
                                    {job?.title || "Job Title Not Available"}
                                  </div>
                                  {job?.description && (
                                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                      {job.description}
                                    </div>
                                  )}
                                </td>

                                <td className="py-4 px-4">
                                  <div className="flex items-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                    <span className="text-sm">
                                      {job?.location || "Not specified"}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-4 px-4">
                                  {job?.salary_range ? (
                                    <div className="flex items-center text-gray-600">
                                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                                      <span className="text-sm">
                                        {job.salary_range}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-400">
                                      Not specified
                                    </span>
                                  )}
                                </td>

                                <td className="py-4 px-4">
                                  <div className="flex items-center text-gray-600">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                    <span className="text-sm">
                                      {formatDate(application.created_at)}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-4 px-4">
                                  <Badge
                                    className={`flex items-center gap-1 border w-fit ${getStatusColor(
                                      application.status || "PENDING"
                                    )}`}
                                  >
                                    {getStatusIcon(
                                      application.status || "PENDING"
                                    )}
                                    <span className="text-xs">
                                      {(application.status || "Pending")
                                        .charAt(0)
                                        .toUpperCase() +
                                        (application.status || "Pending")
                                          .slice(1)
                                          .toLowerCase()}
                                    </span>
                                  </Badge>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Applications Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven&apos;t applied to any jobs yet. Start exploring
                  opportunities and submit your first application.
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/jobs")}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
