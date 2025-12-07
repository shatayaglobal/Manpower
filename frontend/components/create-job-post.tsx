"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { useSelector } from "react-redux";
import { usePosts } from "@/lib/redux/usePosts";
import {
  CreatePostRequest,
  POST_TYPES,
  PRIORITY_LEVELS,
  ACCOUNT_TYPES,
} from "@/lib/types";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 mb-4">
              You need a business account to create job postings.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/jobs")}
              className="w-full"
            >
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: keyof JobFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (formData.title.length > 250) {
      newErrors.title = "Title must be less than 250 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    } else if (formData.location && formData.location.length > 550) {
      newErrors.location = "Location must be less than 550 characters";
    }

    if (formData.requirements && formData.requirements.length > 500) {
      newErrors.requirements = "Requirements must be less than 500 characters";
    }

    if (formData.salary_range && formData.salary_range.length > 100) {
      newErrors.salary_range = "Salary range must be less than 100 characters";
    }

    if (formData.expires_at) {
      const expiryDate = new Date(formData.expires_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        newErrors.expires_at = "Expiry date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearPostError();

    try {
      const formDataPayload = new FormData();
      formDataPayload.append("title", formData.title);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("post_type", formData.post_type);
      formDataPayload.append(
        "priority",
        formData.priority || PRIORITY_LEVELS.MEDIUM
      );

      if (formData.location) {
        formDataPayload.append("location", formData.location);
      }

      if (formData.salary_range) {
        formDataPayload.append("salary_range", formData.salary_range);
      }

      if (formData.requirements) {
        formDataPayload.append("requirements", formData.requirements);
      }

      if (formData.expires_at) {
        formDataPayload.append("expires_at", formData.expires_at);
      }

      formDataPayload.append(
        "is_featured",
        String(formData.is_featured || false)
      );
      formDataPayload.append("is_active", "true");

      const result = await addPost(formDataPayload as FormData);

      if (result.type === "posts/createPost/fulfilled") {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/jobs?success=created");
        }
      }
    } catch  {
      //console.error("Error creating job:", error);
    }
  };

  const priorityOptions = [
    {
      value: PRIORITY_LEVELS.LOW,
      label: "Low Priority",
    },
    {
      value: PRIORITY_LEVELS.MEDIUM,
      label: "Medium Priority",
    },
    {
      value: PRIORITY_LEVELS.HIGH,
      label: "High Priority",
    },
    {
      value: PRIORITY_LEVELS.URGENT,
      label: "Urgent",
    },
  ];

  const postTypeOptions = [
    {
      value: POST_TYPES.JOB,
      label: "Job Posting",
    },
    {
      value: POST_TYPES.GENERAL,
      label: "General Post/Announcement",
    },
    {
      value: POST_TYPES.ANNOUNCEMENT,
      label: "Announcement",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (onCancel ? onCancel() : router.push("/jobs"))}
              className="shrink-0 -mt-4"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                Create Job Posting
              </h1>
              <p className="text-gray-600 text-base">
                Fill in the details below
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearPostError}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Row 1: Job Title + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">
                Job Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-red-300" : ""}
                disabled={loading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">
                Location <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className={`pl-10 ${errors.location ? "border-red-300" : ""}`}
                  disabled={loading}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Row 2: Post Type + Priority Level – FORCED SAME WIDTH & HEIGHT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Post Type</Label>
              <Select
                value={formData.post_type}
                onValueChange={(v) => handleInputChange("post_type", v)}
                disabled={loading}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => handleInputChange("priority", v)}
                disabled={loading}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Salary Range + Expiry Date – SAME LINE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="salary_range">Salary Range</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="salary_range"
                  value={formData.salary_range || ""}
                  onChange={(e) =>
                    handleInputChange("salary_range", e.target.value)
                  }
                  className={`pl-10 ${
                    errors.salary_range ? "border-red-300" : ""
                  }`}
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Optional</p>
            </div>

            <div>
              <Label htmlFor="expires_at">Expiry Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at || ""}
                  onChange={(e) =>
                    handleInputChange("expires_at", e.target.value)
                  }
                  className={`pl-10 ${
                    errors.expires_at ? "border-red-300" : ""
                  }`}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Optional</p>
            </div>
          </div>

          {/* Full-width Textareas */}
          <div>
            <Label htmlFor="description">
              Job Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={10}
              className={`resize-none ${
                errors.description ? "border-red-300" : ""
              }`}
              disabled={loading}
            />
            <div className="flex justify-end mt-1">
              <p className="text-xs text-gray-500">
                {formData.description.length}/1000
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements || ""}
              onChange={(e) =>
                handleInputChange("requirements", e.target.value)
              }
              rows={8}
              className={`resize-none ${
                errors.requirements ? "border-red-300" : ""
              }`}
              disabled={loading}
            />
            <div className="flex justify-end mt-1">
              <p className="text-xs text-gray-500">
                {(formData.requirements || "").length}/500
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => (onCancel ? onCancel() : router.push("/jobs"))}
              className="flex-1 h-11"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Job Posting
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
