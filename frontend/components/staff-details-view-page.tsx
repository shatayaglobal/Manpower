"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  User as UserIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { EmploymentType, StaffStatus } from "@/lib/workforce-types";

const StaffDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const staffId = params?.uuid as string;

  const {
    selectedStaff: staff,
    staffLoading: loading,
    loadStaffById,
  } = useWorkforce();

  useEffect(() => {
    if (staffId) {
      loadStaffById(staffId);
    }
  }, [staffId, loadStaffById]);

  const getInvitationStatusBadge = () => {
    if (!staff?.user) {
      return null;
    }

    const status = staff.invitation_status;

    if (!status || status === "ACCEPTED") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          ✓ Invitation Confirmed
        </span>
      );
    }

    if (status === "PENDING") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
          ⏳ Invitation Pending
        </span>
      );
    }

    if (status === "REJECTED") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
          ✗ Invitation Declined
        </span>
      );
    }

    return null;
  };

  const getStatusBadge = (status: StaffStatus) => {
    const statusConfig: Record<
      StaffStatus,
      { bg: string; text: string; label: string }
    > = {
      ACTIVE: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      INACTIVE: { bg: "bg-gray-100", text: "text-gray-800", label: "Inactive" },
      TERMINATED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Terminated",
      },
      ON_LEAVE: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        label: "On Leave",
      },
    };

    const config = statusConfig[status] ?? statusConfig.INACTIVE;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getEmploymentTypeBadge = (type: EmploymentType) => {
    const typeConfig: Record<EmploymentType, { label: string; color: string }> =
      {
        FULL_TIME: {
          label: "Full Time",
          color: "bg-blue-50 text-blue-600 border border-blue-200",
        },
        PART_TIME: {
          label: "Part Time",
          color: "bg-purple-50 text-purple-600 border border-purple-200",
        },
        CONTRACT: {
          label: "Contract",
          color: "bg-orange-50 text-orange-600 border border-orange-200",
        },
        INTERN: {
          label: "Intern",
          color: "bg-pink-50 text-pink-600 border border-pink-200",
        },
      };

    const config = typeConfig[type] ?? typeConfig.FULL_TIME;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-6">Staff member not found</p>
          <Button onClick={() => router.push("/staff")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/staff")}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Staff List
        </Button>

        {/* Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {staff.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {staff.name}
                </h1>
                <p className="text-gray-500">{staff.staff_id}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {getStatusBadge(staff.status)}
            {getEmploymentTypeBadge(staff.employment_type)}
            {getInvitationStatusBadge()}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Information */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Job Information
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Job Title</p>
                  <p className="font-medium text-gray-900">{staff.job_title}</p>
                </div>
              </div>

              {staff.department && (
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">
                      {staff.department}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Hire Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(staff.hire_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {staff.hourly_rate != null && (
                <div className="flex items-start gap-4">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="text-base font-medium text-gray-900">
                      ${staff.hourly_rate}/hr
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Contact Information
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${staff.email}`}
                    className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {staff.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a
                    href={`tel:${staff.phone}`}
                    className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {staff.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Linked User Account Badge */}
            {staff.user && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Linked Account:</span> This
                    staff member has a registered user account
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailPage;
