"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Loader2,
  Briefcase,
  FileText,
  ListChecks,
  Zap,
  ChevronRight,
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

const PRIORITY_CONFIG: Record<string, { label: string; dot: string }> = {
  [PRIORITY_LEVELS.LOW]: { label: "Low", dot: "bg-sky-400" },
  [PRIORITY_LEVELS.MEDIUM]: { label: "Medium", dot: "bg-emerald-400" },
  [PRIORITY_LEVELS.HIGH]: { label: "High", dot: "bg-violet-400" },
  [PRIORITY_LEVELS.URGENT]: { label: "Urgent", dot: "bg-red-500" },
};

const inputCls = (err?: string) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50 disabled:cursor-not-allowed",
    err
      ? "border-red-300 bg-red-50/30"
      : "border-gray-200 bg-white hover:border-gray-300"
  );

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
      <span className="text-base font-bold text-gray-500 uppercase tracking-widest">
        {children}
      </span>
    </div>
  );
}

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
          <p className="text-gray-500 text-base mb-5">
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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Back ── */}
        <button
          onClick={() => (onCancel ? onCancel() : router.push("/jobs"))}
          className="inline-flex items-center gap-1.5 text-base text-gray-400 hover:text-gray-900 transition-colors group mb-6"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        {/* ── Page title ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Job Posting
          </h1>
          <p className="text-gray-500 text-base mt-1">
            Fill in the details below to publish a new listing
          </p>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-base text-red-700">{error}</p>
            </div>
            <button
              onClick={clearPostError}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {/* ── Section 1: Basic Info ── */}
            <div className="p-6">
              <SectionLabel icon={<Briefcase className="w-3.5 h-3.5" />}>
                Basic Information
              </SectionLabel>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Title */}
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Job Title{" "}
                    <span className="text-red-400 normal-case font-normal">
                      *
                    </span>
                  </Label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => set("title", e.target.value)}
                    disabled={loading}
                    placeholder="e.g. Senior Frontend Developer"
                    className={inputCls(errors.title)}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-base mt-1.5">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Location{" "}
                    <span className="text-red-400 normal-case font-normal">
                      *
                    </span>
                  </Label>
                  <AddressAutocomplete
                    value={formData.location || ""}
                    onChange={(address) => set("location", address)}
                    onPlaceSelected={(place) => set("location", place.address)}
                    placeholder="Search for job location..."
                    className={inputCls(errors.location)}
                  />
                  {errors.location ? (
                    <p className="text-red-500 text-base mt-1.5">
                      {errors.location}
                    </p>
                  ) : (
                    <p className="text-base text-gray-400 mt-1.5">
                      Start typing to search
                    </p>
                  )}
                </div>

                {/* Post Type */}
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Post Type
                  </Label>
                  <Select
                    value={formData.post_type}
                    onValueChange={(v) => set("post_type", v)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full h-[42px] border-gray-200 rounded-xl text-base hover:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={POST_TYPES.JOB}>
                        Job Posting
                      </SelectItem>
                      <SelectItem value={POST_TYPES.GENERAL}>
                        General / Announcement
                      </SelectItem>
                      <SelectItem value={POST_TYPES.ANNOUNCEMENT}>
                        Announcement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => set("priority", v)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full h-[42px] border-gray-200 rounded-xl text-base hover:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                      <SelectValue>
                        {formData.priority && (
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                currentPriority.dot
                              )}
                            />
                            <span className="text-base text-gray-700">
                              {currentPriority.label}
                            </span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(
                        ([value, { label, dot }]) => (
                          <SelectItem key={value} value={value}>
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full shrink-0",
                                  dot
                                )}
                              />
                              {label}
                            </span>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary */}
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Salary Range{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      — Optional
                    </span>
                  </Label>
                  <input
                    type="text"
                    value={formData.salary_range || ""}
                    onChange={(e) => set("salary_range", e.target.value)}
                    disabled={loading}
                    placeholder="e.g. $500 – $1,000 / month"
                    className={inputCls(errors.salary_range)}
                  />
                  {errors.salary_range && (
                    <p className="text-red-500 text-base mt-1.5">
                      {errors.salary_range}
                    </p>
                  )}
                </div>

                {/* Expiry */}
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Expiry Date{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      — Optional
                    </span>
                  </Label>
                  <input
                    type="date"
                    value={formData.expires_at || ""}
                    onChange={(e) => set("expires_at", e.target.value)}
                    disabled={loading}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCls(errors.expires_at)}
                  />
                  {errors.expires_at && (
                    <p className="text-red-500 text-base mt-1.5">
                      {errors.expires_at}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 2: Description ── */}
            <div className="p-6">
              <SectionLabel icon={<FileText className="w-3.5 h-3.5" />}>
                Job Description
              </SectionLabel>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide">
                  Description{" "}
                  <span className="text-red-400 normal-case font-normal">
                    *
                  </span>
                </Label>
                <span
                  className={cn(
                    "text-base font-medium",
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
                style={{ minHeight: "160px" }}
                placeholder="Describe the role, responsibilities, and what you're looking for in the ideal candidate..."
                className={cn(
                  "w-full resize-none border rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors",
                  errors.description
                    ? "border-red-300 bg-red-50/30"
                    : "border-gray-200 hover:border-gray-300"
                )}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-red-500 text-base mt-1.5">
                  {errors.description}
                </p>
              )}
            </div>

            {/* ── Section 3: Requirements ── */}
            <div className="p-6">
              <SectionLabel icon={<ListChecks className="w-3.5 h-3.5" />}>
                Requirements
              </SectionLabel>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide">
                  Requirements{" "}
                  <span className="text-gray-300 normal-case font-normal">
                    — Optional
                  </span>
                </Label>
                <span
                  className={cn(
                    "text-base font-medium",
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
                style={{ minHeight: "160px" }}
                placeholder="List key skills, qualifications, and experience — one per line works great..."
                className={cn(
                  "w-full resize-none border rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors",
                  errors.requirements
                    ? "border-red-300 bg-red-50/30"
                    : "border-gray-200 hover:border-gray-300"
                )}
                disabled={loading}
              />
              {errors.requirements && (
                <p className="text-red-500 text-base mt-1.5">
                  {errors.requirements}
                </p>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 bg-gray-50/50 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-base text-gray-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Posting will go live immediately after publishing
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (onCancel ? onCancel() : router.push("/jobs"))}
                  className="flex-1 sm:flex-none sm:w-28 h-10 border-gray-200 rounded-xl font-semibold text-base"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none sm:w-44 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Posting
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
