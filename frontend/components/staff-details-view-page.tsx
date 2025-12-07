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
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/staff")}
          className="mb-8 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Staff List
        </Button>

        {/* Header Card - Clean & Compact */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3 mb-8 -mt-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar - Perfect Size */}
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-blue-100">
              {staff.name.charAt(0).toUpperCase()}
            </div>

            {/* Name, ID & Badges */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{staff.name}</h1>
              <p className="text-base text-gray-500 mt-1">
                ID: {staff.staff_id}
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-4">
                {getStatusBadge(staff.status)}
                {getEmploymentTypeBadge(staff.employment_type)}
                {getInvitationStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Information Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Job Information
              </h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Job Title</p>
                  <p className="text-base font-medium text-gray-900">
                    {staff.job_title}
                  </p>
                </div>
              </div>

              {staff.department && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="text-base font-medium text-gray-900">
                      {staff.department}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hire Date</p>
                  <p className="text-base font-medium text-gray-900">
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
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
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

          {/* Contact Information Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${staff.email}`}
                    className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline break-all"
                  >
                    {staff.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
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

            {/* Linked Account Badge - Cleaned Up */}
            {staff.user && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Linked Account
                    </p>
                    <p className="text-sm text-blue-700">
                      This staff member has a registered user account
                    </p>
                  </div>
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
