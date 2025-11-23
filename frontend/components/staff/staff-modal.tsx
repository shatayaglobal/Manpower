"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
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

interface StaffModalProps {
  staff: BusinessStaff | null;
  onClose: () => void;
  businessId: string;
  onSuccess: () => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  staff,
  onClose,
  businessId,
  onSuccess,
}) => {
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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserSearch, setShowUserSearch] = useState<boolean>(!staff);

  const { addStaff, editStaff } = useWorkforce();

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
      setFormData((prev) => ({
        ...prev,
        name: `${selectedUser.first_name} ${selectedUser.last_name}`,
        email: selectedUser.email,
        phone: prev.phone,
        user: selectedUser.id as string,
      }));
    }
  }, [selectedUser]);

  const handleUserSelect = (user: User | null) => {
    setSelectedUser(user);
    if (!user) {
      setFormData((prev) => ({
        ...prev,
        user: undefined,
        name: "",
        email: "",
        phone: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.job_title.trim())
      newErrors.job_title = "Job title is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        business: businessId,
      };

      if (staff) {
        await editStaff(staff.id, submitData);
        toast.success("Staff member updated successfully!");
      } else {
        await addStaff(submitData);
        toast.success("Staff member added successfully!");
      }
      onSuccess(); // Reload staff list
      onClose();
    } catch (error: unknown) {
      let errorMessage = "Failed to save staff member. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const response = (
          error as {
            response?: { data?: { business?: string[]; detail?: string } };
          }
        ).response;
        errorMessage =
          response?.data?.business?.[0] ||
          response?.data?.detail ||
          errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const isUserLinked = !!selectedUser || !!staff?.user;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-full w-full sm:max-w-lg md:max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {staff ? "Edit Staff Member" : "Add New Staff Member"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* User Search Section - Only show for new staff */}
            {!staff && showUserSearch && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Link to Registered User (Optional)
                    </h3>
                    <p className="text-xs text-gray-600">
                      Search and select an existing user to auto-fill their
                      details
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUserSearch(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <UserSearchSelect
                  onSelectUser={handleUserSelect}
                  selectedUser={selectedUser}
                  disabled={false}
                />
              </div>
            )}

            {/* Show button to enable user search if hidden */}
            {!staff && !showUserSearch && !selectedUser && (
              <button
                type="button"
                onClick={() => setShowUserSearch(true)}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Link to existing user account
              </button>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isUserLinked}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                } ${isUserLinked ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
              {isUserLinked && (
                <p className="text-xs text-gray-500 mt-1">
                  Name is auto-filled from linked user account
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) =>
                    setFormData({ ...formData, job_title: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.job_title ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Manager"
                />
                {errors.job_title && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.job_title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sales"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type *
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employment_type: e.target.value as EmploymentType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as StaffStatus,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isUserLinked}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } ${isUserLinked ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
                {isUserLinked && (
                  <p className="text-xs text-gray-500 mt-1">
                    Email is auto-filled from linked user account
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="+256-700-000000"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourly_rate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hire Date *
                </label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) =>
                    setFormData({ ...formData, hire_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end space-x-0 sm:space-x-3 gap-4 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600 min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white min-w-[120px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" />
                {staff ? "Updating..." : "Adding..."}
              </>
            ) : staff ? (
              "Update Staff"
            ) : (
              "Add Staff"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
