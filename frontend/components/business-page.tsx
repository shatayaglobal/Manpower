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
import { WorkplaceLocationSettings } from "./business-location-settings";
import { AddressAutocomplete } from "./address-auto-complete";

interface BusinessModalProps {
  business: Business | null;
  onClose: () => void;
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
        const errorMessage = "Failed to save business. Please try again.";
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                {business ? "Edit Business" : "Add New Business"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-lg sm:text-xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
              {steps.map((step: Step, index: number) => (
                <div key={step.number} className="flex items-center min-w-0">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                  ${
                    currentStep >= step.number
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  >
                    {step.number}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        currentStep >= step.number
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-4 sm:w-6 md:w-8 h-px mx-2 sm:mx-4 ${
                        currentStep > step.number
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
            {currentStep === 1 && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Business Name/Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter your business name"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          category: e.target
                            .value as BusinessFormData["category"],
                        })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      {BUSINESS_CATEGORIES.slice(1).map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Business Size
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          size: e.target.value as BusinessFormData["size"],
                        })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="SMALL">1-10 employees</option>
                      <option value="MEDIUM">11-50 employees</option>
                      <option value="LARGE">51-200 employees</option>
                      <option value="ENTERPRISE">200+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                        errors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="business@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs sm:text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                        errors.phone ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="+256-700-000000"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-xs sm:text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Website(Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Brief description of your business..."
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Business Address *
                  </label>
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={(address) =>
                      setFormData({ ...formData, address })
                    }
                    onPlaceSelected={(place) => {
                      setFormData({
                        ...formData,
                        address: place.address,
                        city: place.city,
                        country: place.country,
                        postal_code: place.postal_code || formData.postal_code,
                        workplace_latitude: Number(place.latitude.toFixed(6)),
                        workplace_longitude: Number(place.longitude.toFixed(6)),
                      });
                    }}
                  />
                  {errors.address && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Start typing to search for your address
                  </p>
                </div>

                {/* City and Country are now auto-filled but still editable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                        errors.city ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Kampala"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-xs sm:text-sm mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                        errors.country ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Uganda"
                    />
                    {errors.country && (
                      <p className="text-red-600 text-xs sm:text-sm mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          postal_code: e.target.value,
                        })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="00000"
                    />
                  </div>
                </div>

                {/* Show coordinates preview if set */}
                {formData.workplace_latitude &&
                  formData.workplace_longitude && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-900 font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Workplace Location Automatically Set
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Coordinates: {formData.workplace_latitude.toFixed(6)},{" "}
                        {formData.workplace_longitude.toFixed(6)}
                      </p>
                    </div>
                  )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Service Hours
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-600">
                    Hours:{" "}
                    {formData.service_time ||
                      "Select opening and closing times"}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  Review Your Information
                </h3>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      Basic Information
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Name: {formData.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Category:{" "}
                      {
                        BUSINESS_CATEGORIES.find(
                          (c) => c.value === formData.category
                        )?.label
                      }
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Email: {formData.email}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Phone: {formData.phone}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      Location
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {formData.address}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {formData.city}, {formData.country}
                    </p>
                    {formData.postal_code && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        Postal Code: {formData.postal_code}
                      </p>
                    )}
                  </div>

                  {formData.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                        Description
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {formData.description}
                      </p>
                    </div>
                  )}

                  {formData.service_time && (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                        Service Hours
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">
                        {formData.service_time}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 mr-2" />
                    <p className="text-xs sm:text-sm text-blue-500">
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
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={submitting}
                  className="w-full sm:w-auto border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600 text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto border-gray-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600 text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                Cancel
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 mr-2 animate-spin text-blue-500" />
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
        <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-sm sm:text-base text-gray-600">
          Loading your business...
        </p>
      </div>
    );
  }

  if (!hasBusiness) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <div className="text-center mb-6 sm:mb-10">
            <Building2 className="w-12 sm:w-16 h-12 sm:h-16 text-blue-500 mx-auto mb-4 sm:mb-6" />
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Welcome to Your Business Dashboard
            </h1>
            <p className="text-sm sm:text-lg text-gray-600">
              Let&apos;s get started by setting up your business profile
            </p>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white shadow-lg px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-amber-600" />
              Create Your Business Profile
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              What you&apos;ll be able to do:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Manage Staff
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Add and organize your team members with detailed profiles
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Schedule Shifts
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Create and manage work schedules efficiently
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Post Jobs
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Attract talented workers and manage applications
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Track Performance
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Monitor hours worked and business analytics
                  </p>
                </div>
              </div>
            </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">{error}</p>
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

        {/* 1. Quick Stats — Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {business.staff_count || 0}
                </p>
                <p className="text-gray-600 text-sm">Total Staff</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {business.active_jobs || 0}
                </p>
                <p className="text-gray-600 text-sm">Active Jobs</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {business.total_applications || 0}
                </p>
                <p className="text-gray-600 text-sm">Applications</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions — Full Width */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/staff"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Staff</p>
                <p className="text-xs text-gray-600">
                  Add or edit team members
                </p>
              </div>
            </Link>

            <Link
              href="/shifts"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all group"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Schedule Shifts</p>
                <p className="text-xs text-gray-600">Plan work schedules</p>
              </div>
            </Link>

            <Link
              href="/jobs/create"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all group"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Post Job</p>
                <p className="text-xs text-gray-600">Create new job listing</p>
              </div>
            </Link>

            {/* Fixed: Added missing </p> and proper structure */}
            <Link
              href="/manage-applications"
              className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all group"
            >
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Applications</p>
                <p className="text-xs text-gray-600">Review applicants</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 3. Business Info + Workplace Settings — Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Business Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {business.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {business.business_id}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectBusiness(business);
                  setShowCreateModal(true);
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>

            {business.description && (
              <p className="text-gray-600 text-sm sm:text-base mb-5">
                {business.description}
              </p>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-amber-600" />
                {business.city}, {business.country}
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-amber-600" />
                {business.email}
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-amber-600" />
                {business.phone}
              </div>
              <div className="flex items-center text-gray-700">
                <Building2 className="w-4 h-4 mr-2 text-amber-600" />
                {business.size === "SMALL" && "1–10 employees"}
                {business.size === "MEDIUM" && "11–50 employees"}
                {business.size === "LARGE" && "51–200 employees"}
                {business.size === "ENTERPRISE" && "200+ employees"}
              </div>
              {business.service_time && (
                <div className="flex items-center text-gray-700">
                  <Clock className="w-4 h-4 mr-220 text-amber-600" />
                  {business.service_time}
                </div>
              )}
            </div>
          </div>

          {/* Workplace Location Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <WorkplaceLocationSettings
              business={business}
              onUpdate={async (data) => {
                await editBusiness(business.id, data);
                loadBusinesses();
              }}
            />
          </div>
        </div>

        {/* Modal */}
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
