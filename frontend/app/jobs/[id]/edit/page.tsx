"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  DollarSign,
  Save,
  Calendar,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { usePosts } from "@/lib/redux/usePosts";
import { useAuthState } from "@/lib/redux/redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/address-auto-complete";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-sky-50 text-sky-700 border-sky-200" },
  MEDIUM: {
    label: "Medium",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  HIGH: {
    label: "High",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  URGENT: { label: "Urgent", color: "bg-red-50 text-red-700 border-red-200" },
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
      <div className={cn("relative", icon && "[&>input]:pl-9 [&>*]:pl-9")}>
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 z-10">
            {icon}
          </div>
        )}
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

const inputCls = (err?: string, disabled?: boolean) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed",
    err ? "border-red-300 bg-red-50/30" : "border-gray-200",
    disabled ? "bg-gray-50" : "bg-white"
  );

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const { user, isAuthenticated } = useAuthState();
  const { selectedPost, loading, loadPost, editPost } = usePosts();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    post_type: "JOB" as "JOB" | "GENERAL" | "ANNOUNCEMENT",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    location: "",
    salary_range: "",
    requirements: "",
    expires_at: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (jobId) loadPost(jobId);
  }, [isAuthenticated, jobId, loadPost, router]);

  useEffect(() => {
    if (selectedPost) {
      const ownerId =
        typeof selectedPost.user === "object"
          ? selectedPost.user.id
          : selectedPost.user;
      if (user?.id !== ownerId) {
        toast.error("You don't have permission to edit this job");
        router.push("/jobs");
        return;
      }
      setFormData({
        title: selectedPost.title || "",
        description: selectedPost.description || "",
        post_type: (selectedPost.post_type ||
          "JOB") as (typeof formData)["post_type"],
        priority: (selectedPost.priority ||
          "MEDIUM") as (typeof formData)["priority"],
        location: selectedPost.location || "",
        salary_range: selectedPost.salary_range || "",
        requirements: selectedPost.requirements || "",
        expires_at: selectedPost.expires_at
          ? selectedPost.expires_at.split("T")[0]
          : "",
      });
    }
  }, [selectedPost, user, router]);

  const set = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = "Job title is required";
    if (!formData.description.trim())
      e.description = "Job description is required";
    if (!formData.location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setIsSubmitting(true);
    try {
      await editPost(jobId, formData);
      toast.success("Job updated successfully!");
      router.push("/jobs");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update job"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentPriority = PRIORITY_CONFIG[formData.priority];

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-8xl">
        {/* ── Back nav ── */}
        <button
          onClick={() => router.push("/jobs")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors group mb-5"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Edit Job Posting</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Update the details below to save your changes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Core details card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Job Details
            </p>

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
                  disabled={isSubmitting}
                  placeholder="e.g. Senior Frontend Developer"
                  className={inputCls(errors.title, isSubmitting) + " pl-9"}
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
                  value={formData.location}
                  onChange={(address) => set("location", address)}
                  onPlaceSelected={(place) => set("location", place.address)}
                  placeholder="Search for job location..."
                  className={inputCls(errors.location, isSubmitting) + " pl-9"}
                />
              </FieldWrapper>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Post Type
                </Label>
                <Select
                  value={formData.post_type}
                  onValueChange={(v) => set("post_type", v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full h-10 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JOB">Job Posting</SelectItem>
                    <SelectItem value="GENERAL">
                      General / Announcement
                    </SelectItem>
                    <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
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
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full h-10 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <SelectValue>
                      {formData.priority && currentPriority && (
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

            <div className="grid sm:grid-cols-2 gap-5">
              <FieldWrapper
                label="Salary Range"
                hint="Optional"
                error={errors.salary_range}
                icon={<DollarSign className="w-4 h-4" />}
              >
                <input
                  type="text"
                  value={formData.salary_range}
                  onChange={(e) => set("salary_range", e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g. USh 1,000,000 – 2,000,000"
                  className={
                    inputCls(errors.salary_range, isSubmitting) + " pl-9"
                  }
                />
              </FieldWrapper>

              <FieldWrapper
                label="Expiry Date"
                hint="Optional"
                icon={<Calendar className="w-4 h-4" />}
              >
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => set("expires_at", e.target.value)}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split("T")[0]}
                  className={inputCls(undefined, isSubmitting) + " pl-9"}
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
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className={cn(
                "resize-none border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                errors.description
                  ? "border-red-300 bg-red-50/30"
                  : "border-gray-200"
              )}
              disabled={isSubmitting}
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
                  formData.requirements.length > 450
                    ? "text-red-500"
                    : "text-gray-400"
                )}
              >
                {formData.requirements.length}/500
              </span>
            </div>
            <Textarea
              value={formData.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              rows={6}
              placeholder="List key skills, qualifications, and experience needed..."
              className={cn(
                "resize-none border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                errors.requirements
                  ? "border-red-300 bg-red-50/30"
                  : "border-gray-200"
              )}
              disabled={isSubmitting}
            />
            {errors.requirements && (
              <p className="text-red-500 text-xs">{errors.requirements}</p>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/jobs")}
              className="flex-1 h-11 border-gray-200 rounded-xl font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
