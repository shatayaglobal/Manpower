"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Calendar,
  BarChart3,
  Briefcase,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/lib/redux/useBusiness";
import { Business, BusinessFormData } from "@/lib/business-types";
import { BUSINESS_CATEGORIES } from "@/lib/business-types";
import { toast } from "sonner";
import Link from "next/link";

interface BusinessModalProps {
  business: Business | null;
  onClose: () => void;
}

interface VerificationStatus {
  text: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

const MyBusinessPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const {
    businesses,
    selectedBusiness,
    loading,
    error,
    loadBusinesses,
    submitBusiness,
    editBusiness,
    clearBusinessError,
    selectBusiness,
  } = useBusiness();

  const business = businesses[0] || null;
  const hasBusiness = businesses.length > 0;

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const getVerificationStatus = (status: string): VerificationStatus => {
    switch (status) {
      case "verified":
        return { text: "Verified", color: "green", icon: CheckCircle };
      case "documents_pending":
        return {
          text: "Documents Required",
          color: "yellow",
          icon: AlertCircle,
        };
      case "under_review":
        return { text: "Under Review", color: "blue", icon: Clock };
      default:
        return { text: "Not Verified", color: "gray", icon: XCircle };
    }
  };

  // const handleDeleteBusiness = async (businessId: string) => {
  //   if (
  //     window.confirm(
  //       "Are you sure you want to delete your business? This action cannot be undone."
  //     )
  //   ) {
  //     try {
  //       await removeBusiness(businessId);
  //       toast.success("Business deleted successfully");
  //     } catch (error) {
  //       console.error("Error deleting business:", error);
  //       toast.error("Failed to delete business");
  //     }
  //   }
  // };

  // const handleRequestVerification = async (businessId: string) => {
  //   try {
  //     await requestBusinessVerification(businessId);
  //     toast.success("Verification request submitted");
  //   } catch (error) {
  //     console.error("Error requesting verification:", error);
  //     toast.error("Failed to request verification");
  //   }
  // };

  const BusinessModal: React.FC<BusinessModalProps> = ({
    business,
    onClose,
  }) => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<BusinessFormData>({
      name: business?.name ?? "",
      category: business?.category ?? "OTHER",
      size: business?.size ?? "SMALL",
      description: business?.description ?? "",
      email: business?.email ?? "",
      phone: business?.phone ?? "",
      website: business?.website ?? "",
      address: business?.address ?? "",
      city: business?.city ?? "",
      country: business?.country ?? "Uganda",
      postal_code: business?.postal_code ?? "",
      service_time: business?.service_time ?? "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
      if (business) {
        setFormData({
          name: business.name ?? "",
          category: business.category ?? "OTHER",
          size: business.size ?? "SMALL",
          description: business.description ?? "",
          email: business.email ?? "",
          phone: business.phone ?? "",
          website: business.website ?? "",
          address: business.address ?? "",
          city: business.city ?? "",
          country: business.country ?? "Uganda",
          postal_code: business.postal_code ?? "",
          service_time: business.service_time ?? "",
        });
      }
    }, [business]);

    const validateStep = (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === 1) {
        if (!formData.name.trim()) newErrors.name = "Business name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (
          formData.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          newErrors.email = "Please enter a valid email";
        }
        if (
          formData.website &&
          formData.website.trim() &&
          !/^https?:\/\/.+/.test(formData.website)
        ) {
          newErrors.website =
            "Website must be a valid URL starting with http:// or https://";
        }
      }

      if (step === 2) {
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.country.trim()) newErrors.country = "Country is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleNext = (): void => {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      }
    };

    const handleSubmit = async (): Promise<void> => {
      if (!validateStep(2)) return;

      setSubmitting(true);
      try {
        if (business) {
          await editBusiness(business.id, formData);
          toast.success("Business updated successfully!");
        } else {
          await submitBusiness(formData);
          toast.success("Business created successfully!");
        }
        onClose();
        selectBusiness(null);
        loadBusinesses();
      } catch {
        const errorMessage =
          "Failed to save business. Please try again.";
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    };

    const steps: Step[] = [
      {
        number: 1,
        title: "Basic Info",
        description: "Business details and contact",
      },
      {
        number: 2,
        title: "Location",
        description: "Address and service information",
      },
      { number: 3, title: "Review", description: "Confirm your information" },
    ];

    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {business ? "Edit Business" : "Add New Business"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              {steps.map((step: Step, index: number) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${
                      currentStep >= step.number
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.number
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-px mx-4 ${
                        currentStep > step.number
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter your business name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as BusinessFormData['category'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {BUSINESS_CATEGORIES.slice(1).map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Size
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          size: e.target.value as BusinessFormData['size'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SMALL">1-10 employees</option>
                      <option value="MEDIUM">11-50 employees</option>
                      <option value="LARGE">51-200 employees</option>
                      <option value="ENTERPRISE">200+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="business@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="+256-700-000000"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your business..."
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Street address, building, floor"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Kampala"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.country ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Uganda"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          postal_code: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="00000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Hours
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        onChange={(e) => {
                          const openTime = e.target.value;
                          const closeTime =
                            formData.service_time.split(" - ")[1] || "";
                          setFormData({
                            ...formData,
                            service_time: closeTime
                              ? `${openTime} - ${closeTime}`
                              : openTime,
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        onChange={(e) => {
                          const closeTime = e.target.value;
                          const openTime =
                            formData.service_time.split(" - ")[0] || "";
                          setFormData({
                            ...formData,
                            service_time: openTime
                              ? `${openTime} - ${closeTime}`
                              : closeTime,
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    Hours:{" "}
                    {formData.service_time ||
                      "Select opening and closing times"}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Review Your Information
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Basic Information
                    </h4>
                    <p className="text-sm text-gray-600">
                      Name: {formData.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Category:{" "}
                      {
                        BUSINESS_CATEGORIES.find(
                          (c) => c.value === formData.category
                        )?.label
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      Email: {formData.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {formData.phone}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <p className="text-sm text-gray-600">{formData.address}</p>
                    <p className="text-sm text-gray-600">
                      {formData.city}, {formData.country}
                    </p>
                    {formData.postal_code && (
                      <p className="text-sm text-gray-600">
                        Postal Code: {formData.postal_code}
                      </p>
                    )}
                  </div>

                  {formData.description && (
                    <div>
                      <h4 className="font-medium text-gray-900">Description</h4>
                      <p className="text-sm text-gray-600">
                        {formData.description}
                      </p>
                    </div>
                  )}

                  {formData.service_time && (
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Service Hours
                      </h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {formData.service_time}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-sm text-blue-800">
                      By creating this business, you agree to our terms of
                      service and will need to complete verification to access
                      all features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={submitting}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {business ? "Updating..." : "Creating..."}
                    </>
                  ) : business ? (
                    "Update Business"
                  ) : (
                    "Create Business"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-600">Loading your business...</p>
      </div>
    );
  }

  // No business created yet - show setup wizard
  if (!hasBusiness) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Building2 className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Business Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Let&apos;s get started by setting up your business profile
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What you&apos;ll be able to do:
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Manage Staff
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add and organize your team members with detailed profiles
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Schedule Shifts
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create and manage work schedules efficiently
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Post Jobs
                  </h3>
                  <p className="text-sm text-gray-600">
                    Attract talented workers and manage applications
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Track Performance
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monitor hours worked and business analytics
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8 py-6 text-lg"
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Your Business Profile
            </Button>
          </div>
        </div>

        {showCreateModal && (
          <BusinessModal
            business={null}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    );
  }

  // Business exists - show dashboard
  const verification = getVerificationStatus(
    business.verification_status || "not_started"
  );
  const StatusIcon = verification.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-800">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearBusinessError}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Business Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {business.name}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${
                    verification.color === "green"
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                  ${
                    verification.color === "yellow"
                      ? "bg-yellow-100 text-yellow-800"
                      : ""
                  }
                  ${
                    verification.color === "blue"
                      ? "bg-blue-100 text-blue-800"
                      : ""
                  }
                  ${
                    verification.color === "gray"
                      ? "bg-gray-100 text-gray-800"
                      : ""
                  }
                `}
                >
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {verification.text}
                </span>
              </div>
              <p className="text-gray-500 mb-4">{business.business_id}</p>
              <p className="text-gray-600">{business.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  selectBusiness(business);
                  setShowCreateModal(true);
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Business
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-700">
                {business.city}, {business.country}
              </span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-700">{business.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-700">{business.phone}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {business.staff_count || 0}
                </p>
                <p className="text-gray-600 text-sm">Total Staff</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {business.active_jobs || 0}
                </p>
                <p className="text-gray-600 text-sm">Active Jobs</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {business.total_applications || 0}
                </p>
                <p className="text-gray-600 text-sm">Applications</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/staff"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Staff</p>
                <p className="text-sm text-gray-600">Add or edit staff</p>
              </div>
            </Link>

            <Link
              href="/shifts"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Schedule Shifts</p>
                <p className="text-sm text-gray-600">Plan work schedules</p>
              </div>
            </Link>

            <Link
              href="/post-job"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Post Job</p>
                <p className="text-sm text-gray-600">Create job listing</p>
              </div>
            </Link>

            <Link
              href="/manage-applications"
              className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Applications</p>
                <p className="text-sm text-gray-600">Review applicants</p>
              </div>
            </Link>
          </div>
        </div>

        {showCreateModal && (
          <BusinessModal
            business={selectedBusiness}
            onClose={() => {
              setShowCreateModal(false);
              selectBusiness(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MyBusinessPage;
