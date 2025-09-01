"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Upload,
  X,
  Briefcase,
  Save,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { usePosts } from "@/lib/redux/usePosts";
import { CreatePostRequest, POST_TYPES, PRIORITY_LEVELS, ACCOUNT_TYPES } from "@/lib/types";

interface AuthState {
  user: {
    id: string;
    email: string;
    account_type: 'WORKER' | 'BUSINESS';
    first_name: string;
    last_name: string;
  } | null;
  isAuthenticated: boolean;
}

interface RootState {
  auth: AuthState;
}

interface JobFormData extends Omit<CreatePostRequest, 'image'> {
  image: File | null;
  is_active?: boolean;
}

interface JobCreationFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function JobCreationForm({ onCancel, onSuccess }: JobCreationFormProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Use your Redux hook
  const {
    addPost,
    loading,
    error,
    clearPostError
  } = usePosts();

  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    image: null,
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
              onClick={() => router.push('/jobs')}
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: "Please select a valid image file"
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: "Image size should be less than 5MB"
        }));
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));


      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors(prev => ({ ...prev, image: "" }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
      formDataPayload.append('title', formData.title);
      formDataPayload.append('description', formData.description);
      formDataPayload.append('post_type', formData.post_type);
      formDataPayload.append('priority', formData.priority || PRIORITY_LEVELS.MEDIUM);

      if (formData.location) {
        formDataPayload.append('location', formData.location);
      }

      if (formData.salary_range) {
        formDataPayload.append('salary_range', formData.salary_range);
      }

      if (formData.requirements) {
        formDataPayload.append('requirements', formData.requirements);
      }

      if (formData.expires_at) {
        formDataPayload.append('expires_at', formData.expires_at);
      }

      formDataPayload.append('is_featured', String(formData.is_featured || false));
      formDataPayload.append('is_active', 'true');

      if (formData.image instanceof File) {
        formDataPayload.append('image', formData.image);
      }

      const result = await addPost(formDataPayload as FormData);

      if (result.type === 'posts/createPost/fulfilled') {
        if (onSuccess) {
          onSuccess();
        } else {
            router.push('/jobs?success=created');
        }
      }

    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const priorityOptions = [
    {
      value: PRIORITY_LEVELS.LOW,
      label: 'Low Priority',
      description: 'Standard job posting'
    },
    {
      value: PRIORITY_LEVELS.MEDIUM,
      label: 'Medium Priority',
      description: 'Regular visibility'
    },
    {
      value: PRIORITY_LEVELS.HIGH,
      label: 'High Priority',
      description: 'Increased visibility'
    },
    {
      value: PRIORITY_LEVELS.URGENT,
      label: 'Urgent',
      description: 'Maximum visibility'
    },
  ];

  const postTypeOptions = [
    {
      value: POST_TYPES.JOB,
      label: 'Job Posting',
      description: 'Standard job listing'
    },
    {
      value: POST_TYPES.GENERAL,
      label: 'General Post',
      description: 'General announcement'
    },
    {
      value: POST_TYPES.ANNOUNCEMENT,
      label: 'Announcement',
      description: 'Company announcement'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onCancel ? onCancel() : router.push('/jobs')}
            className="mb-4 text-blue-700 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Job Posting</h1>
              <p className="text-gray-600 mt-1">
                Post a new job opportunity for candidates to discover
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Error</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPostError}
                  className="ml-auto p-1 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-700" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the essential details for your job posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Job Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Job Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Senior Software Developer"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`mt-1 ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.title.length}/250 characters
                </p>
              </div>

              {/* Job Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Job Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={5}
                  className={`mt-1 resize-none ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Location *
                </Label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., New York, NY or Remote"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`pl-10 ${errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-700" />
                Job Details
              </CardTitle>
              <CardDescription>
                Specify the type, priority, and compensation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Post Type */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Post Type
                  </Label>
                  <Select
                    value={formData.post_type}
                    onValueChange={(value: typeof POST_TYPES[keyof typeof POST_TYPES]) =>
                      handleInputChange('post_type', value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS]) =>
                      handleInputChange('priority', value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <Label htmlFor="salary_range" className="text-sm font-medium text-gray-700">
                  Salary Range
                </Label>
                <div className="mt-1 relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="salary_range"
                    type="text"
                    placeholder="e.g., $80,000 - $120,000 annually"
                    value={formData.salary_range || ''}
                    onChange={(e) => handleInputChange('salary_range', e.target.value)}
                    className={`pl-10 ${errors.salary_range ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.salary_range && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Leave blank if salary is negotiable
                </p>
              </div>

              {/* Requirements */}
              <div>
                <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">
                  Requirements
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="List the required skills, experience, and qualifications..."
                  value={formData.requirements || ''}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={4}
                  className={`mt-1 resize-none ${errors.requirements ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.requirements && (
                  <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {(formData.requirements || '').length}/500 characters
                </p>
              </div>

              {/* Expiry Date */}
              <div>
                <Label htmlFor="expires_at" className="text-sm font-medium text-gray-700">
                  Expiry Date
                </Label>
                <div className="mt-1 relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="expires_at"
                    type="date"
                    value={formData.expires_at || ''}
                    onChange={(e) => handleInputChange('expires_at', e.target.value)}
                    className={`pl-10 ${errors.expires_at ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>
                {errors.expires_at && (
                  <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Leave blank for no expiry
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-700" />
                Job Image
              </CardTitle>
              <CardDescription>
                Add an attractive image to make your job posting stand out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={loading}
                    >
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Job preview"
                      width={800}
                      height={192}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onCancel ? onCancel() : router.push('/jobs')}
              className="flex-1 border-gray-300"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-700 hover:bg-blue-800"
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
