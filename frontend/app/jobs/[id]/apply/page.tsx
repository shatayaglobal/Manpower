"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  Upload,
  X,
  Send,
  Briefcase,
  User,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { usePosts } from "@/lib/redux/usePosts";
import { useSelector } from "react-redux";
import { useApplications } from "@/lib/redux/use-applications";

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

interface ApplicationFormData {
  cover_letter: string;
  resume: File | null;
  additional_info: string;
}

export default function JobApplicationForm() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const {
    selectedPost: job,
    loadPost
  } = usePosts();

  const [success, setSuccess] = useState(false);
  const [resumePreview, setResumePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ApplicationFormData>({
    cover_letter: "",
    resume: null,
    additional_info: "",
  });

  const {
    submitApplication,
    loading: applicationLoading,
    error: applicationError,
    clearApplicationError
  } = useApplications();

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only workers can apply
    if (user?.account_type !== 'WORKER') {
      router.push('/jobs');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (jobId && isAuthenticated) {
      loadPost(jobId);
    }
  }, [jobId, isAuthenticated, loadPost]);

  const handleInputChange = (field: keyof ApplicationFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };


  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: "Please select a PDF, DOC, or DOCX file"
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: "Resume file size should be less than 5MB"
        }));
        return;
      }

      setFormData(prev => ({ ...prev, resume: file }));
      setResumePreview(file.name);

      // Clear resume error
      if (errors.resume) {
        setErrors(prev => ({ ...prev, resume: "" }));
      }
    }
  };

  const removeResume = () => {
    setFormData(prev => ({ ...prev, resume: null }));
    setResumePreview(null);
    // Reset file input
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cover_letter.trim()) {
      newErrors.cover_letter = "Cover letter is required";
    } else if (formData.cover_letter.length < 50) {
      newErrors.cover_letter = "Cover letter should be at least 50 characters";
    } else if (formData.cover_letter.length > 2000) {
      newErrors.cover_letter = "Cover letter should be less than 2000 characters";
    }

    if (!formData.resume) {
      newErrors.resume = "Resume is required";
    }

    if (formData.additional_info && formData.additional_info.length > 500) {
      newErrors.additional_info = "Additional information should be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  clearApplicationError();

  const applicationData = new FormData();
  applicationData.append('job', jobId);
  applicationData.append('cover_letter', formData.cover_letter);
  applicationData.append('additional_info', formData.additional_info || '');

  if (formData.resume) {
    applicationData.append('resume', formData.resume);
  }

  const result = await submitApplication(applicationData);

  if (result.type === 'applications/submitApplication/fulfilled') {
    setSuccess(true);
  }
};
  const formatJobType = (priority: string) => {
    const typeMap = {
      'LOW': 'Part-time',
      'MEDIUM': 'Full-time',
      'HIGH': 'Contract',
      'URGENT': 'Temporary'
    };
    return typeMap[priority as keyof typeof typeMap] || priority;
  };

  if (!isAuthenticated || !user || user.account_type !== 'WORKER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-800 mb-2">
                Application Submitted Successfully!
              </h1>
              <p className="text-green-700 mb-6">
                Your application for &quot;{job?.title}&quot; has been sent to the employer.
                You&apos;ll receive an email confirmation shortly.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/jobs')}
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  Browse More Jobs
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/applications')}
                  className="w-full border-green-300 text-green-700 hover:bg-green-100"
                >
                  View My Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-2 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(job ? `/jobs/${job.id}` : '/jobs')}
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job
          </Button>
        </div>

        {/* Job Summary Card */}
        {job && (
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {job.title}
                  </CardTitle>
                  <CardDescription className="text-base text-blue-700 mt-1">
                  {typeof job.user === 'object'
                      ? `${job.user.first_name || ''} ${job.user.last_name || ''}`.trim() || job.user.email
                      : job.user
                    } • {job.location} • {formatJobType(job.priority)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
        )}

        {/* Application Form */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="h-6 w-6 text-blue-700" />
              Apply for this Position
            </CardTitle>
            <CardDescription>
              Tell the employer why you&apos;re the perfect fit for this role
            </CardDescription>
          </CardHeader>

          {/* Error Alert */}
          {applicationError  && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Error</h4>
                  <p className="text-red-700 text-sm mt-1">{applicationError }</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearApplicationError}
                  className="ml-auto p-1 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <Label htmlFor="cover_letter" className="text-sm font-medium text-gray-700">
                  Cover Letter *
                </Label>
                <Textarea
                  id="cover_letter"
                  placeholder="Tell the employer why you're interested in this position and what makes you qualified..."
                  value={formData.cover_letter}
                  onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                  rows={8}
                  className={`mt-1 resize-none ${errors.cover_letter ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={applicationLoading}
                />
                {errors.cover_letter && (
                  <p className="mt-1 text-sm text-red-600">{errors.cover_letter}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.cover_letter.length}/2000 characters (minimum 50)
                </p>
              </div>

              {/* Resume Upload */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Resume/CV *
                </Label>
                <div className="mt-1 space-y-4">
                  {!resumePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload your resume
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        PDF, DOC, DOCX up to 5MB
                      </p>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeUpload}
                        className="hidden"
                        disabled={applicationLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                        disabled={applicationLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">{resumePreview}</p>
                          <p className="text-sm text-blue-700">Ready to upload</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeResume}
                        className="text-blue-600 hover:text-blue-700"
                        disabled={applicationLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {errors.resume && (
                    <p className="text-sm text-red-600">{errors.resume}</p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="additional_info" className="text-sm font-medium text-gray-700">
                  Additional Information
                </Label>
                <Textarea
                  id="additional_info"
                  placeholder="Any additional information you'd like to share (portfolio links, references, etc.)..."
                  value={formData.additional_info}
                  onChange={(e) => handleInputChange('additional_info', e.target.value)}
                  rows={4}
                  className={`mt-1 resize-none ${errors.additional_info ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={applicationLoading}
                />
                {errors.additional_info && (
                  <p className="mt-1 text-sm text-red-600">{errors.additional_info}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.additional_info.length}/500 characters (optional)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(job ? `/jobs/${job.id}` : '/jobs')}
                  className="flex-1 border-gray-300"
                  disabled={applicationLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applicationLoading}
                  className="flex-1 bg-blue-700 hover:bg-blue-800"
                >
                  {applicationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
      </div>
    </div>
  );
}
