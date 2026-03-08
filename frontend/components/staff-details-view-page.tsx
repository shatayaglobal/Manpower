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
  BadgeCheck,
  Clock,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { EmploymentType, StaffStatus } from "@/lib/workforce-types";
import { cn } from "@/lib/utils";

/* ── Badge configs matching staff list page ─────────────────────── */
const STATUS_CONFIG: Record<StaffStatus, { label: string; color: string }> = {
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  INACTIVE: {
    label: "Inactive",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
  TERMINATED: {
    label: "Terminated",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  ON_LEAVE: {
    label: "On Leave",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

const EMP_TYPE_CONFIG: Record<
  EmploymentType,
  { label: string; color: string }
> = {
  FULL_TIME: {
    label: "Full Time",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  PART_TIME: {
    label: "Part Time",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  CONTRACT: {
    label: "Contract",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  INTERN: {
    label: "Intern",
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
};

function Badge({ config }: { config: { label: string; color: string } }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border",
        config.color
      )}
    >
      {config.label}
    </span>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
        {icon}
      </div>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        {children}
      </span>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-500",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          iconBg,
          iconColor
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <div className="text-sm font-semibold text-gray-900">{children}</div>
      </div>
    </div>
  );
}

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
    if (staffId) loadStaffById(staffId);
  }, [staffId, loadStaffById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-base text-gray-500">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm mx-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Staff member not found
          </h2>
          <Button
            onClick={() => router.push("/staff")}
            variant="outline"
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff List
          </Button>
        </div>
      </div>
    );
  }

  /* Invitation status badge */
  const invitationBadge = (() => {
    if (!staff.user) return null;
    const s = staff.invitation_status;
    if (!s || s === "ACCEPTED")
      return {
        icon: <BadgeCheck className="w-3.5 h-3.5" />,
        label: "Confirmed",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    if (s === "PENDING")
      return {
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "Invite Pending",
        color: "bg-amber-50 text-amber-700 border-amber-200",
      };
    if (s === "REJECTED")
      return {
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: "Declined",
        color: "bg-red-50 text-red-700 border-red-200",
      };
    return null;
  })();

  const initials = staff.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Back ── */}
        <button
          onClick={() => router.push("/staff")}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Staff List
        </button>

        {/* ── Hero card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm">
              {initials}
            </div>

            {/* Name + badges */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{staff.name}</h1>
              <p className="text-base text-gray-400 mt-0.5">
                {staff.job_title}
                {staff.department ? ` · ${staff.department}` : ""}
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge
                  config={STATUS_CONFIG[staff.status] ?? STATUS_CONFIG.INACTIVE}
                />
                <Badge
                  config={
                    EMP_TYPE_CONFIG[staff.employment_type] ??
                    EMP_TYPE_CONFIG.FULL_TIME
                  }
                />
                {invitationBadge && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-semibold border",
                      invitationBadge.color
                    )}
                  >
                    {invitationBadge.icon}
                    {invitationBadge.label}
                  </span>
                )}
              </div>
            </div>

            {/* Staff ID chip */}
            <div className="shrink-0">
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-500 tracking-widest uppercase">
                {staff.staff_id}
              </span>
            </div>
          </div>
        </div>

        {/* ── Two-column detail cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Job Information */}
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
            <SectionLabel icon={<Briefcase className="w-3.5 h-3.5" />}>
              Job Information
            </SectionLabel>

            <InfoRow
              icon={<Briefcase className="w-4 h-4" />}
              label="Job Title"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            >
              {staff.job_title}
            </InfoRow>

            {staff.department && (
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Department"
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              >
                {staff.department}
              </InfoRow>
            )}

            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Hire Date"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            >
              {new Date(staff.hire_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </InfoRow>

            {staff.hourly_rate != null && (
              <InfoRow
                icon={<DollarSign className="w-4 h-4" />}
                label="Hourly Rate"
                iconBg="bg-green-50"
                iconColor="text-green-600"
              >
                ${staff.hourly_rate}/hr
              </InfoRow>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
            <SectionLabel icon={<Mail className="w-3.5 h-3.5" />}>
              Contact Information
            </SectionLabel>

            <InfoRow
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            >
              <a
                href={`mailto:${staff.email}`}
                className="text-blue-600 hover:underline break-all"
              >
                {staff.email}
              </a>
            </InfoRow>

            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            >
              <a
                href={`tel:${staff.phone}`}
                className="text-blue-600 hover:underline"
              >
                {staff.phone}
              </a>
            </InfoRow>

            {/* Linked account notice */}
            {staff.user && (
              <div className="mt-4 flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Linked Account
                  </p>
                  <p className="text-xs text-blue-600">
                    This staff member has a registered user account
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
