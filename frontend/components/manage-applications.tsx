"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Users,
  Eye,
  FileText,
  Check,
  X,
  User,
} from "lucide-react";
import { useApplications } from "@/lib/redux/use-applications";
import { JobApplication } from "@/lib/types";
import { toast } from "sonner";

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

export default function ManageApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    applications,
    loading,
    error,
    clearApplicationError,
    loadBusinessApplications,
    updateApplicationStatus,
  } = useApplications();

  const [filteredApplications, setFilteredApplications] = useState<
    JobApplication[]
  >([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.account_type !== "BUSINESS") {
      router.push("/jobs");
      return;
    }

    loadBusinessApplications();
  }, [isAuthenticated, user, router, loadBusinessApplications]);

  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.status === statusFilter.toUpperCase()
      );
    }
    if (jobFilter !== "all") {
      filtered = filtered.filter((app) => {
        const jobId =
          typeof app.job === "string"
            ? app.job
            : (app.job as { id: string })?.id;
        return jobId === jobFilter;
      });
    }
    setFilteredApplications(filtered);
  }, [applications, statusFilter, jobFilter]);

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    const currentApplication = applications.find(
      (app) => app.id === applicationId
    );

    if (currentApplication?.status === "ACCEPTED" && newStatus === "REJECTED") {
      toast.error(
        "Cannot reject an application that has already been accepted"
      );
      return;
    }

    if (currentApplication?.status === "REJECTED" && newStatus === "ACCEPTED") {
      toast.error(
        "Cannot accept an application that has already been rejected"
      );
      return;
    }

    setIsUpdating(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      loadBusinessApplications();
    } catch {
      toast.error(`Failed to ${newStatus.toLowerCase()} application`);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "REVIEWED":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getUniqueJobs = () => {
    const jobs = applications
      .map((app) => app.job)
      .filter((job): job is Extract<typeof job, { id: string; title: string }> => {
        return (
          job !== null &&
          job !== undefined &&
          typeof job === "object" &&
          "id" in job
        );
      })
      .filter(
        (job, index, self) => self.findIndex((j) => j.id === job.id) === index
      );
    return jobs;
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(
      (app) => app.status === "PENDING"
    ).length;
    const reviewed = applications.filter(
      (app) => app.status === "REVIEWED"
    ).length;
    const accepted = applications.filter(
      (app) => app.status === "ACCEPTED"
    ).length;
    const rejected = applications.filter(
      (app) => app.status === "REJECTED"
    ).length;

    return { total, pending, reviewed, accepted, rejected };
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setJobFilter("all");
  };

  const canTakeAction = (status: string) => {
    return status === "PENDING" || status === "REVIEWED";
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  const stats = getApplicationStats();

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6 mt-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Applications
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Review and manage job applications for your posted positions.
          </p>
        </div>

        {/* Stats Cards - Minimal */}
        <div className="grid grid-cols-5 gap-3 mb-2 border-b">
          <div className="bg-white border rounded p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-sm font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-3 w-3 text-gray-600" />
          </div>

          <div className="bg-white border rounded p-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-sm font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <Clock className="h-3 w-3 text-yellow-600" />
          </div>

          <div className="bg-white border rounded p-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Reviewed</p>
              <p className="text-sm font-bold text-blue-600">
                {stats.reviewed}
              </p>
            </div>
            <AlertCircle className="h-3 w-3 text-blue-600" />
          </div>

          <div className="bg-white border rounded p-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Accepted</p>
              <p className="text-sm font-bold text-green-600">
                {stats.accepted}
              </p>
            </div>
            <CheckCircle className="h-3 w-3 text-green-600" />
          </div>

          <div className="bg-white border rounded p-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Rejected</p>
              <p className="text-sm font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-3 w-3 text-red-600" />
          </div>
        </div>
        {/* Filters - Compact */}
        <div className="bg-white border rounded p-2 mb-3">
          <div className="flex gap-2 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-7 w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="h-7 w-40">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {getUniqueJobs().map((job) => (
                  <SelectItem key={job?.id} value={job?.id || ""}>
                    {job?.title || "Untitled Job"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearApplicationError}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Applications Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Applications ({filteredApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Applicant
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Job Title
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Applied Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredApplications.map(
                        (application: JobApplication) => (
                          <tr
                            key={application.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {application.applicant_name ||
                                      "Unknown Applicant"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">
                                {typeof application.job === "object" &&
                                application.job?.title
                                  ? application.job.title
                                  : "Job Title Not Available"}
                              </div>
                              {typeof application.job === "object" &&
                                application.job?.location && (
                                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {application.job.location}
                                  </div>
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
                                  application.status
                                )}`}
                              >
                                {getStatusIcon(application.status)}
                                <span className="text-xs">
                                  {application.status?.charAt(0).toUpperCase() +
                                    application.status
                                      ?.slice(1)
                                      .toLowerCase() || "Pending"}
                                </span>
                              </Badge>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {/* View Details Dialog */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedApplication(application)
                                      }
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Application Details
                                      </DialogTitle>
                                      <DialogDescription>
                                        Review applicant information and
                                        application details
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedApplication && (
                                      <div className="space-y-6">
                                        {/* Applicant Info */}
                                        <div>
                                          <h4 className="font-medium text-gray-900 mb-3">
                                            Applicant Information
                                          </h4>
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <label className="text-sm font-medium text-gray-600">
                                                  Name
                                                </label>
                                                <p className="text-gray-900">
                                                  {
                                                    selectedApplication.applicant_name
                                                  }
                                                </p>
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium text-gray-600">
                                                  Applied Date
                                                </label>
                                                <p className="text-gray-900">
                                                  {formatDate(
                                                    selectedApplication.created_at
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Cover Letter */}
                                        {selectedApplication.cover_letter && (
                                          <div>
                                            <h4 className="font-medium text-gray-900 mb-3">
                                              Cover Letter
                                            </h4>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                              <p className="text-gray-700 whitespace-pre-wrap">
                                                {
                                                  selectedApplication.cover_letter
                                                }
                                              </p>
                                            </div>
                                          </div>
                                        )}

                                        {/* Resume */}
                                        {selectedApplication.resume && (
                                          <div>
                                            <h4 className="font-medium text-gray-900 mb-3">
                                              Resume
                                            </h4>
                                            <Button
                                              variant="outline"
                                              onClick={() => {
                                                if (
                                                  selectedApplication.resume
                                                ) {
                                                  window.open(
                                                    selectedApplication.resume,
                                                    "_blank"
                                                  );
                                                }
                                              }}
                                              className="flex items-center gap-2"
                                            >
                                              <FileText className="h-4 w-4" />
                                              View Resume
                                            </Button>
                                          </div>
                                        )}

                                        {/* Action Buttons */}
                                        {canTakeAction(
                                          selectedApplication.status
                                        ) && (
                                          <div className="flex gap-3 pt-4 border-t">
                                            <Button
                                              onClick={() =>
                                                handleStatusUpdate(
                                                  selectedApplication.id,
                                                  "ACCEPTED"
                                                )
                                              }
                                              disabled={
                                                isUpdating ===
                                                selectedApplication.id
                                              }
                                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                            >
                                              <Check className="h-4 w-4" />
                                              Accept
                                            </Button>
                                            <Button
                                              variant="outline"
                                              onClick={() =>
                                                handleStatusUpdate(
                                                  selectedApplication.id,
                                                  "REJECTED"
                                                )
                                              }
                                              disabled={
                                                isUpdating ===
                                                selectedApplication.id
                                              }
                                              className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                                            >
                                              <X className="h-4 w-4" />
                                              Reject
                                            </Button>
                                          </div>
                                        )}

                                        {!canTakeAction(
                                          selectedApplication.status
                                        ) && (
                                          <div className="pt-4 border-t">
                                            <Badge
                                              className={`${getStatusColor(
                                                selectedApplication.status
                                              )} text-sm px-3 py-1`}
                                            >
                                              {getStatusIcon(
                                                selectedApplication.status
                                              )}
                                              <span className="ml-2">
                                                Application{" "}
                                                {selectedApplication.status.toLowerCase()}
                                              </span>
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                {/* Quick Actions */}
                                {canTakeAction(application.status) && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          application.id,
                                          "ACCEPTED"
                                        )
                                      }
                                      disabled={isUpdating === application.id}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          application.id,
                                          "REJECTED"
                                        )
                                      }
                                      disabled={isUpdating === application.id}
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Applications Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No applications match your current filters or you
                    haven&apos;t received any applications yet.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
