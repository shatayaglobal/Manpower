"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MapPin, DollarSign, Save } from "lucide-react";
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

    if (jobId) {
      loadPost(jobId);
    }
  }, [isAuthenticated, jobId, loadPost, router]);

  useEffect(() => {
    if (selectedPost) {
      const postOwnerId =
        typeof selectedPost.user === "object"
          ? selectedPost.user.id
          : selectedPost.user;

      if (user?.id !== postOwnerId) {
        toast.error("You don't have permission to edit this job");
        router.push("/jobs");
        return;
      }

      setFormData({
        title: selectedPost.title || "",
        description: selectedPost.description || "",
        post_type: (selectedPost.post_type || "JOB"),
        priority: (selectedPost.priority || "MEDIUM"),
        location: selectedPost.location || "",
        salary_range: selectedPost.salary_range || "",
        requirements: selectedPost.requirements || "",
        expires_at: selectedPost.expires_at
          ? selectedPost.expires_at.split("T")[0]
          : "",
      });
    }
  }, [selectedPost, user, router]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim())
      newErrors.description = "Job description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-2 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/jobs")}
              className="shrink-0 -mt-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Job Posting
              </h1>
              <p className="text-gray-600 text-base">
                Update the details below
              </p>
            </div>
          </div>
        </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Row 1: Title + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div>
                  <Label htmlFor="title">
                    Job Title <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      disabled={isSubmitting}
                      placeholder="e.g. Senior Frontend Developer"
                      className={`
                        w-full px-4 py-2.5 pl-11 pr-11 border rounded-lg
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${
                          errors.title
                            ? "border-red-300 focus:ring-red-300"
                            : "border-gray-300"
                        }
                        ${isSubmitting ? "bg-gray-100" : "bg-white"}
                      `}
                    />
                  </div>
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Job Location */}
                <div>
                  <Label htmlFor="location">
                    Job Location <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <AddressAutocomplete
                      value={formData.location}
                      onChange={(address) =>
                        handleInputChange("location", address)
                      }
                      onPlaceSelected={(place) =>
                        handleInputChange("location", place.address)
                      }
                      placeholder="Search for job location..."
                      className={`
                        w-full px-4 py-2.5 pl-11 pr-11 border rounded-lg
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${
                          errors.location
                            ? "border-red-300 focus:ring-red-300"
                            : "border-gray-300"
                        }
                        ${isSubmitting ? "bg-gray-100" : "bg-white"}
                      `}
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.location}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Start typing to search for the workplace location
                  </p>
                </div>
              </div>

              {/* Row 2: Post Type + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Post Type</Label>
                  <div className="relative">
                    <Select
                      value={formData.post_type}
                      onValueChange={(v) => handleInputChange("post_type", v)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={`
                          w-full px-4 py-5 pl-11 pr-11 border rounded-lg
                          transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          disabled:cursor-not-allowed
                          ${
                            isSubmitting ? "bg-gray-100 opacity-70" : "bg-white"
                          }
                          [&>span:last-child]:hidden
                        `}
                      >
                        <SelectValue placeholder="Select post type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JOB">Job Posting</SelectItem>
                        <SelectItem value="GENERAL">
                          General Post/Announcement
                        </SelectItem>
                        <SelectItem value="ANNOUNCEMENT">
                          Announcement
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Priority Level</Label>
                  <div className="relative">
                    <Select
                      value={formData.priority}
                      onValueChange={(v) => handleInputChange("priority", v)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={`
                          w-full px-4 py-5 pl-11 pr-11 border rounded-lg
                          transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          disabled:cursor-not-allowed
                          ${
                            isSubmitting ? "bg-gray-100 opacity-70" : "bg-white"
                          }
                          [&>span:last-child]:hidden
                        `}
                      >
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low Priority</SelectItem>
                        <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                        <SelectItem value="HIGH">High Priority</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Row 3: Salary + Expiry Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="salary_range">Salary Range</Label>
                  <div className="relative">
                    <input
                      id="salary_range"
                      type="text"
                      value={formData.salary_range}
                      onChange={(e) =>
                        handleInputChange("salary_range", e.target.value)
                      }
                      disabled={isSubmitting}
                      placeholder="e.g. USh 1,000,000 - 2,000,000"
                      className={`
                        w-full px-4 py-2.5 pl-11 pr-11 border rounded-lg
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${
                          errors.salary_range
                            ? "border-red-300 focus:ring-red-300"
                            : "border-gray-300"
                        }
                        ${isSubmitting ? "bg-gray-100" : "bg-white"}
                      `}
                    />
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.salary_range && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.salary_range}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Optional</p>
                </div>

                <div>
                  <Label htmlFor="expires_at">Expiry Date</Label>
                  <div className="relative">
                    <input
                      id="expires_at"
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) =>
                        handleInputChange("expires_at", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      disabled={isSubmitting}
                      className={`
                        w-full px-4 py-2.5 pl-11 pr-4 border rounded-lg
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${
                          errors.expires_at
                            ? "border-red-300 focus:ring-red-300"
                            : "border-gray-300"
                        }
                        ${isSubmitting ? "bg-gray-100" : "bg-white"}
                      `}
                    />
                  </div>
                  {errors.expires_at && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.expires_at}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Optional</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">
                  Job Description <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={12}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  className={`
                    w-full px-4 py-3 border rounded-lg resize-none
                    transition-all duration-200 min-h-30   h-30
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${
                      errors.description
                        ? "border-red-300 focus:ring-red-300"
                        : "border-gray-300"
                    }
                    ${isSubmitting ? "bg-gray-100" : "bg-white"}
                  `}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/1000
                  </p>
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  rows={8}
                  placeholder="List key skills, qualifications, and experience needed..."
                  className={`
                    w-full px-4 py-3 border rounded-lg resize-none
                    transition-all duration-200 min-h-30 h-30
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${
                      errors.requirements
                        ? "border-red-300 focus:ring-red-300"
                        : "border-gray-300"
                    }
                    ${isSubmitting ? "bg-gray-100" : "bg-white"}
                  `}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.requirements.length}/500
                  </p>
                </div>
                {errors.requirements && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.requirements}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/jobs")}
                  className="flex-1 h-11 rounded-2xl"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 rounded-2xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Job
                    </>
                  )}
                </Button>
              </div>
            </form>
      </div>
    </div>
  );
}
