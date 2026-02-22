"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkforce } from "@/lib/redux/use-workforce";
import {
  BusinessStaff,
  StaffFormData,
  EmploymentType,
  StaffStatus,
} from "@/lib/workforce-types";
import { toast } from "sonner";
import { UserSearchSelect } from "@/components/staff/UserSearchSelect";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StaffModalProps {
  staff: BusinessStaff | null;
  onClose: () => void;
  businessId: string;
  onSuccess: () => void;
}

const labelCls =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const inputCls = (err?: string, disabled?: boolean) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    err ? "border-red-300 bg-red-50/30" : "border-gray-200",
    disabled ? "bg-gray-50 cursor-not-allowed text-gray-500" : "bg-white"
  );
const selectCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export const StaffModal: React.FC<StaffModalProps> = ({
  staff,
  onClose,
  businessId,
  onSuccess,
}) => {
  const { addStaff, editStaff } = useWorkforce();

  const [formData, setFormData] = useState<StaffFormData>({
    name: staff?.name || "",
    job_title: staff?.job_title || "",
    department: staff?.department || "",
    employment_type: staff?.employment_type || "FULL_TIME",
    status: staff?.status || "ACTIVE",
    email: staff?.email || "",
    phone: staff?.phone || "",
    hourly_rate: staff?.hourly_rate || "",
    hire_date: staff?.hire_date || new Date().toISOString().split("T")[0],
    user: staff?.user || undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(!staff);

  const set = (k: keyof StaffFormData, v: string) => {
    setFormData((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        job_title: staff.job_title || "",
        department: staff.department || "",
        employment_type: staff.employment_type || "FULL_TIME",
        status: staff.status || "ACTIVE",
        email: staff.email || "",
        phone: staff.phone || "",
        hourly_rate: staff.hourly_rate || "",
        hire_date: staff.hire_date || new Date().toISOString().split("T")[0],
        user: staff.user || undefined,
      });
      setShowUserSearch(false);
    }
  }, [staff]);

  useEffect(() => {
    if (selectedUser) {
      setFormData((p) => ({
        ...p,
        name: `${selectedUser.first_name} ${selectedUser.last_name}`,
        email: selectedUser.email,
        user: selectedUser.id as string,
      }));
    }
  }, [selectedUser]);

  const handleUserSelect = (user: User | null) => {
    setSelectedUser(user);
    if (!user)
      setFormData((p) => ({ ...p, user: undefined, name: "", email: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.job_title.trim()) e.job_title = "Job title is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Invalid email address";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...formData, business: businessId };
      if (staff) {
        await editStaff(staff.id, payload);
        toast.success("Staff member updated!");
      } else {
        await addStaff(payload);
        toast.success("Staff member added!");
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      let msg = "Failed to save staff member.";
      if (error && typeof error === "object" && "response" in error) {
        const r = (
          error as {
            response?: { data?: { business?: string[]; detail?: string } };
          }
        ).response;
        msg = r?.data?.business?.[0] || r?.data?.detail || msg;
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isLinked = !!selectedUser || !!staff?.user;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {staff ? "Edit Staff Member" : "Add New Staff Member"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Link user banner — new staff only */}
          {!staff &&
            (showUserSearch ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Link to registered user
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Auto-fill name and email from an existing account
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUserSearch(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-blue-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <UserSearchSelect
                  onSelectUser={handleUserSelect}
                  selectedUser={selectedUser}
                  disabled={false}
                />
              </div>
            ) : !selectedUser ? (
              <button
                onClick={() => setShowUserSearch(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Link to existing user account (optional)
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-700">
                    User linked — name and email auto-filled
                  </p>
                  <p className="text-xs text-emerald-600 truncate">
                    {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => handleUserSelect(null)}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold shrink-0"
                >
                  Unlink
                </button>
              </div>
            ))}

          {/* Personal details card */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Personal Details
            </p>

            <div>
              <label className={labelCls}>
                Full Name{" "}
                <span className="text-red-500 normal-case font-normal">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
                disabled={isLinked}
                placeholder="John Doe"
                className={inputCls(errors.name, isLinked)}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Email{" "}
                  <span className="text-red-500 normal-case font-normal">
                    *
                  </span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={isLinked}
                  placeholder="john@example.com"
                  className={inputCls(errors.email, isLinked)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>
                  Phone{" "}
                  <span className="text-red-500 normal-case font-normal">
                    *
                  </span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+256-700-000000"
                  className={inputCls(errors.phone)}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job details card */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Job Details
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Job Title{" "}
                  <span className="text-red-500 normal-case font-normal">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => set("job_title", e.target.value)}
                  placeholder="e.g. Manager"
                  className={inputCls(errors.job_title)}
                />
                {errors.job_title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.job_title}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => set("department", e.target.value)}
                  placeholder="e.g. Sales"
                  className={inputCls()}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Employment Type</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) =>
                    set("employment_type", e.target.value as EmploymentType)
                  }
                  className={selectCls}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => set("status", e.target.value as StaffStatus)}
                  className={selectCls}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Hire Date</label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => set("hire_date", e.target.value)}
                  className={inputCls()}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Hourly Rate{" "}
                  <span className="text-gray-300 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => set("hourly_rate", e.target.value)}
                  placeholder="25.00"
                  className={inputCls()}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl flex gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border-gray-200 h-10 rounded-xl font-semibold text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl font-semibold text-sm shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {staff ? "Updating..." : "Adding..."}
              </>
            ) : staff ? (
              "Update Staff"
            ) : (
              "Add Staff Member"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
