"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  X,
  Save,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Loader2,
  Briefcase,
} from "lucide-react";
import { useSelector } from "react-redux";
import { usePosts } from "@/lib/redux/usePosts";
import {
  CreatePostRequest,
  POST_TYPES,
  PRIORITY_LEVELS,
  ACCOUNT_TYPES,
} from "@/lib/types";
import { AddressAutocomplete } from "@/components/address-auto-complete";
import { cn } from "@/lib/utils";

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
interface JobFormData extends Omit<CreatePostRequest, "image"> {
  is_active?: boolean;
}
interface JobCreationFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  [PRIORITY_LEVELS.LOW]: {
    label: "Low",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  [PRIORITY_LEVELS.MEDIUM]: {
    label: "Medium",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  [PRIORITY_LEVELS.HIGH]: {
    label: "High",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  [PRIORITY_LEVELS.URGENT]: {
    label: "Urgent",
    color: "bg-red-50 text-red-700 border-red-200",
  },
};

function FieldWrapper({
  label,
  required,
  hint,
  error,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
        {label}{" "}
        {required && (
          <span className="text-red-500 normal-case font-normal">*</span>
        )}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 z-10">
            {icon}
          </div>
        )}
        <div
          className={icon ? "[&>*]:pl-9 [&>input]:pl-9 [&>textarea]:pl-9" : ""}
        >
          {children}
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed",
    err ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"
  );

export default function JobCreationForm({
  onCancel,
  onSuccess,
}: JobCreationFormProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { addPost, loading, error, clearPostError } = usePosts();

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    post_type: POST_TYPES.JOB,
    priority: PRIORITY_LEVELS.MEDIUM,
    location: "",
    salary_range: "",
    requirements: "",
    expires_at: "",
    is_featured: false,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAuthorized = user?.account_type === ACCOUNT_TYPES.BUSINESS;

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-sm mx-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            You need a business account to create job postings.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/jobs")}
            className="w-full border-gray-200 rounded-xl"
          >
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const set = (field: keyof JobFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = "Job title is required";
    else if (formData.title.length > 250)
      e.title = "Title must be less than 250 characters";
    if (!formData.description.trim())
      e.description = "Job description is required";
    else if (formData.description.length > 1000)
      e.description = "Description must be less than 1000 characters";
    if (!formData.location?.trim()) e.location = "Location is required";
    if (formData.requirements && formData.requirements.length > 500)
      e.requirements = "Requirements must be less than 500 characters";
    if (formData.salary_range && formData.salary_range.length > 100)
      e.salary_range = "Salary range must be less than 100 characters";
    if (formData.expires_at) {
      const d = new Date(formData.expires_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) e.expires_at = "Expiry date cannot be in the past";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    clearPostError();
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("post_type", formData.post_type);
      fd.append("priority", formData.priority || PRIORITY_LEVELS.MEDIUM);
      if (formData.location) fd.append("location", formData.location);
      if (formData.salary_range)
        fd.append("salary_range", formData.salary_range);
      if (formData.requirements)
        fd.append("requirements", formData.requirements);
      if (formData.expires_at) fd.append("expires_at", formData.expires_at);
      fd.append("is_featured", String(formData.is_featured || false));
      fd.append("is_active", "true");
      const result = await addPost(fd as FormData);
      if (result.type === "posts/createPost/fulfilled") {
        onSuccess ? onSuccess() : router.push("/jobs?success=created");
      }
    } catch {
      /* handled by redux */
    }
  };

  const currentPriority =
    PRIORITY_CONFIG[formData.priority ?? PRIORITY_LEVELS.MEDIUM];

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-8xl">
        {/* ── Back nav ── */}
        <button
          onClick={() => (onCancel ? onCancel() : router.push("/jobs"))}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors group mb-5"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Job Posting
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Fill in the details below to publish a new listing
          </p>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={clearPostError}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Core details card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Job Details
            </p>

            {/* Title + Location */}
            <div className="grid sm:grid-cols-2 gap-5">
              <FieldWrapper
                label="Job Title"
                required
                error={errors.title}
                icon={<Briefcase className="w-4 h-4" />}
              >
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => set("title", e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Senior Frontend Developer"
                  className={inputCls(errors.title) + " pl-9"}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Location"
                required
                error={errors.location}
                hint="Start typing to search"
                icon={<MapPin className="w-4 h-4" />}
              >
                <AddressAutocomplete
                  value={formData.location || ""}
                  onChange={(address) => set("location", address)}
                  onPlaceSelected={(place) => set("location", place.address)}
                  placeholder="Search for job location..."
                  className={inputCls(errors.location) + " pl-9"}
                />
              </FieldWrapper>
            </div>

            {/* Post type + Priority */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Post Type
                </Label>
                <Select
                  value={formData.post_type}
                  onValueChange={(v) => set("post_type", v)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full h-10 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={POST_TYPES.JOB}>Job Posting</SelectItem>
                    <SelectItem value={POST_TYPES.GENERAL}>
                      General / Announcement
                    </SelectItem>
                    <SelectItem value={POST_TYPES.ANNOUNCEMENT}>
                      Announcement
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Priority Level
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => set("priority", v)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full h-10 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <SelectValue>
                      {formData.priority && (
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full border",
                            currentPriority.color
                          )}
                        >
                          {currentPriority.label}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(
                      ([value, { label, color }]) => (
                        <SelectItem key={value} value={value}>
                          <span
                            className={cn(
                              "text-xs font-semibold px-2 py-0.5 rounded-full border",
                              color
                            )}
                          >
                            {label}
                          </span>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary + Expiry */}
            <div className="grid sm:grid-cols-2 gap-5">
              <FieldWrapper
                label="Salary Range"
                hint="Optional"
                error={errors.salary_range}
                icon={<DollarSign className="w-4 h-4" />}
              >
                <input
                  type="text"
                  value={formData.salary_range || ""}
                  onChange={(e) => set("salary_range", e.target.value)}
                  disabled={loading}
                  placeholder="e.g. USh 1,000,000 – 2,000,000"
                  className={inputCls(errors.salary_range) + " pl-9"}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Expiry Date"
                hint="Optional"
                error={errors.expires_at}
                icon={<Calendar className="w-4 h-4" />}
              >
                <input
                  type="date"
                  value={formData.expires_at || ""}
                  onChange={(e) => set("expires_at", e.target.value)}
                  disabled={loading}
                  min={new Date().toISOString().split("T")[0]}
                  className={inputCls(errors.expires_at) + " pl-9"}
                />
              </FieldWrapper>
            </div>
          </div>

          {/* ── Description card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Job Description{" "}
                <span className="text-red-500 font-normal normal-case">*</span>
              </Label>
              <span
                className={cn(
                  "text-xs font-medium",
                  formData.description.length > 900
                    ? "text-red-500"
                    : "text-gray-400"
                )}
              >
                {formData.description.length}/1000
              </span>
            </div>
            <Textarea
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
              rows={8}
              placeholder="Describe the role, responsibilities, and what you're looking for in the ideal candidate..."
              className={cn(
                "resize-none border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                errors.description
                  ? "border-red-300 bg-red-50/30"
                  : "border-gray-200"
              )}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
          </div>

          {/* ── Requirements card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Requirements
              </Label>
              <span
                className={cn(
                  "text-xs font-medium",
                  (formData.requirements?.length ?? 0) > 450
                    ? "text-red-500"
                    : "text-gray-400"
                )}
              >
                {formData.requirements?.length ?? 0}/500
              </span>
            </div>
            <Textarea
              value={formData.requirements || ""}
              onChange={(e) => set("requirements", e.target.value)}
              rows={6}
              placeholder="List key skills, qualifications, and experience — one per line works great..."
              className={cn(
                "resize-none border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                errors.requirements
                  ? "border-red-300 bg-red-50/30"
                  : "border-gray-200"
              )}
              disabled={loading}
            />
            {errors.requirements && (
              <p className="text-red-500 text-xs">{errors.requirements}</p>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => (onCancel ? onCancel() : router.push("/jobs"))}
              className="flex-1 h-11 border-gray-200 rounded-xl font-semibold"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Publish Job Posting
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
