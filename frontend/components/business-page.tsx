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

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "gray";
}> = ({ title, value, icon: Icon, color }) => {
  const bgClass = `bg-${color}-50`;
  const iconClass = `text-${color}-600`;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-600 mt-0.5">{title}</p>
        </div>
        <div
          className={`w-10 h-10 ${bgClass} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
};

const getCategoryLabel = (categoryValue: string): string => {
  const cat = BUSINESS_CATEGORIES.find((c) => c.value === categoryValue);
  return cat ? cat.label : "Other";
};

const MyBusinessPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const {
    businesses,
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
      street: business?.street ?? "",
      city: business?.city ?? "",
      country: business?.country ?? "Uganda",
      postal_code: business?.postal_code ?? "",
      service_time: business?.service_time ?? "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    const convertTo12Hour = (
      time24: string
    ): { hour: string; minute: string; period: "AM" | "PM" } => {
      if (!time24) return { hour: "", minute: "", period: "AM" };
      const [hour, minute] = time24.split(":").map(Number);
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return {
        hour: hour12.toString().padStart(2, "0"),
        minute: minute.toString().padStart(2, "0"),
        period,
      };
    };

    const convertTo24Hour = (
      hour12: string,
      minute: string,
      period: "AM" | "PM"
    ): string => {
      if (!hour12 || !minute) return "";
      let hour = parseInt(hour12);
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, "0")}:${minute}`;
    };

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
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center min-w-0">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
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
                    onChange={(e) =>
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
                      onChange={(e) =>
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
                      onChange={(e) =>
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
                      onChange={(e) =>
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
                      onChange={(e) =>
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
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
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
                    onChange={(e) =>
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
                        street: place.street,
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* ← ADD THIS NEW STREET INPUT HERE */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.street || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="e.g. Plot 123, Acacia Avenue"
                    />
                  </div>
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
                    {/* Opening Time */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Opening Time
                      </label>
                      <div className="flex gap-2">
                        {/* Native time picker (user selects in their preferred format) */}
                        <input
                          type="time"
                          value={formData.service_time.split(" - ")[0] || ""}
                          onChange={(e) => {
                            const openTime24 = e.target.value;
                            const closeTime =
                              formData.service_time.split(" - ")[1]?.trim() ||
                              "";
                            setFormData({
                              ...formData,
                              service_time: closeTime
                                ? `${openTime24} - ${closeTime}`
                                : openTime24,
                            });
                          }}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                        {/* AM/PM Selector */}
                        <select
                          value={
                            convertTo12Hour(
                              formData.service_time.split(" - ")[0] || ""
                            ).period
                          }
                          onChange={(e) => {
                            const current = convertTo12Hour(
                              formData.service_time.split(" - ")[0] || ""
                            );
                            const newTime24 = convertTo24Hour(
                              current.hour,
                              current.minute,
                              e.target.value as "AM" | "PM"
                            );
                            const closeTime =
                              formData.service_time.split(" - ")[1]?.trim() ||
                              "";
                            setFormData({
                              ...formData,
                              service_time: closeTime
                                ? `${newTime24} - ${closeTime}`
                                : newTime24,
                            });
                          }}
                          className="px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm sm:text-base bg-white"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Select time + AM/PM
                      </p>
                    </div>

                    {/* Closing Time - Repeat the same pattern */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Closing Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={
                            formData.service_time.split(" - ")[1]?.trim() || ""
                          }
                          onChange={(e) => {
                            const closeTime24 = e.target.value;
                            const openTime =
                              formData.service_time.split(" - ")[0]?.trim() ||
                              "";
                            setFormData({
                              ...formData,
                              service_time: openTime
                                ? `${openTime} - ${closeTime24}`
                                : closeTime24,
                            });
                          }}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                        <select
                          value={
                            convertTo12Hour(
                              formData.service_time.split(" - ")[1]?.trim() ||
                                ""
                            ).period
                          }
                          onChange={(e) => {
                            const current = convertTo12Hour(
                              formData.service_time.split(" - ")[1]?.trim() ||
                                ""
                            );
                            const newTime24 = convertTo24Hour(
                              current.hour,
                              current.minute,
                              e.target.value as "AM" | "PM"
                            );
                            const openTime =
                              formData.service_time.split(" - ")[0]?.trim() ||
                              "";
                            setFormData({
                              ...formData,
                              service_time: openTime
                                ? `${openTime} - ${newTime24}`
                                : newTime24,
                            });
                          }}
                          className="px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm sm:text-base bg-white"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Select time + AM/PM
                      </p>
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
                      Category: {getCategoryLabel(formData.category)}
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
                    {formData.street && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        Street: {formData.street}
                      </p>
                    )}
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
      <div className="bg-white flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-sm sm:text-base text-gray-600">
          Loading your business...
        </p>
      </div>
    );
  }

  if (!hasBusiness) {
    return (
      <div className="bg-white rounded-lg p-6 -ml-4 -mt-5 min-h-screen -mr-4">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Container - No Border */}
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to Your Business Dashboard
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Create your business profile to start managing your workforce
              </p>

              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Business Profile
              </Button>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                What you can do
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Manage Staff
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add and organize your team members with detailed
                        profiles
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
            </div>
          </div>

          {showCreateModal && (
            <BusinessModal
              business={null}
              onClose={() => setShowCreateModal(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
              <div className="flex-1">
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

        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            My Business
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Manage your business profile and settings
          </p>
        </div>

        {/* Business Header Card */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {business.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    CATEGORY: {business.category}
                  </p>
                </div>
              </div>
              {business.description && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 sm:line-clamp-none">
                  {business.description}
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="w-full sm:w-auto flex-shrink-0 text-sm"
              size="sm"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-700 truncate">
                {business.address}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-700 truncate">
                {business.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-700 truncate">
                {business.phone}
              </span>
            </div>
            {business.service_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 truncate">
                  {business.service_time}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            title="Total Staff"
            value={business.staff_count || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Jobs"
            value={business.active_jobs || 0}
            icon={Briefcase}
            color="green"
          />
          <StatCard
            title="Applications"
            value={business.total_applications || 0}
            icon={BarChart3}
            color="purple"
          />
          <StatCard
            title="Category"
            value={getCategoryLabel(business.category)}
            icon={Building2}
            color="gray"
          />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Link
                href="/staff"
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white hover:bg-blue-50 rounded-lg transition-all group border border-gray-200 hover:border-blue-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    Manage Staff
                  </p>
                  <p className="text-xs text-gray-600 truncate">View and edit team</p>
                </div>
              </Link>

              <Link
                href="/shifts"
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white hover:bg-green-50 rounded-lg transition-all group border border-gray-200 hover:border-green-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    Schedule Shifts
                  </p>
                  <p className="text-xs text-gray-600 truncate">Manage schedules</p>
                </div>
              </Link>

              <Link
                href="/jobs/create"
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white hover:bg-purple-50 rounded-lg transition-all group border border-gray-200 hover:border-purple-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    Post New Job
                  </p>
                  <p className="text-xs text-gray-600 truncate">Create listing</p>
                </div>
              </Link>

              <Link
                href="/manage-applications"
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white hover:bg-orange-50 rounded-lg transition-all group border border-gray-200 hover:border-orange-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    Applications
                  </p>
                  <p className="text-xs text-gray-600 truncate">Review applicants</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Workplace Location Settings */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
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
            business={business}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MyBusinessPage;

