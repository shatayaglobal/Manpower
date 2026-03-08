"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowLeft,
  Save,
  Briefcase,
  FileText,
  ListChecks,
  Zap,
  ChevronRight,
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

const PRIORITY_CONFIG: Record<string, { label: string; dot: string }> = {
  LOW: { label: "Low", dot: "bg-sky-400" },
  MEDIUM: { label: "Medium", dot: "bg-emerald-400" },
  HIGH: { label: "High", dot: "bg-violet-400" },
  URGENT: { label: "Urgent", dot: "bg-red-500" },
};

const inputCls = (err?: string, disabled?: boolean) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:cursor-not-allowed",
    err
      ? "border-red-300 bg-red-50/30"
      : "border-gray-200 hover:border-gray-300",
    disabled ? "bg-gray-50" : "bg-white"
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
      const payload = {
        ...formData,
        expires_at: formData.expires_at || undefined,
      };
      await editPost(jobId, payload);
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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Back ── */}
        <button
          onClick={() => router.push("/jobs")}
          className="inline-flex items-center gap-1.5 text-base text-gray-400 hover:text-gray-900 transition-colors group mb-6"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>

        {/* ── Page title ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Job Posting</h1>
          <p className="text-gray-500 text-base mt-1">
            Update the details below to save your changes
          </p>
        </div>

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
                    disabled={isSubmitting}
                    placeholder="e.g. Senior Frontend Developer"
                    className={inputCls(errors.title, isSubmitting)}
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
                    value={formData.location}
                    onChange={(address) => set("location", address)}
                    onPlaceSelected={(place) => set("location", place.address)}
                    placeholder="Search for job location..."
                    className={inputCls(errors.location, isSubmitting)}
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
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full h-[42px] border-gray-200 rounded-xl text-base hover:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
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

                {/* Priority */}
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => set("priority", v)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full h-[42px] border-gray-200 rounded-xl text-base hover:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                      <SelectValue>
                        {formData.priority && currentPriority && (
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
                    value={formData.salary_range}
                    onChange={(e) => set("salary_range", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. USh 1,000,000 – 2,000,000"
                    className={inputCls(errors.salary_range, isSubmitting)}
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
                    value={formData.expires_at}
                    onChange={(e) => set("expires_at", e.target.value)}
                    disabled={isSubmitting}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCls(undefined, isSubmitting)}
                  />
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
                disabled={isSubmitting}
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
                style={{ minHeight: "160px" }}
                placeholder="List key skills, qualifications, and experience needed..."
                className={cn(
                  "w-full resize-none border rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors",
                  errors.requirements
                    ? "border-red-300 bg-red-50/30"
                    : "border-gray-200 hover:border-gray-300"
                )}
                disabled={isSubmitting}
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
                Changes will go live immediately after saving
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/jobs")}
                  className="flex-1 sm:flex-none sm:w-28 h-10 border-gray-200 rounded-xl font-semibold text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none sm:w-44 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Save Changes
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
