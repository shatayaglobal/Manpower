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
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/lib/redux/useBusiness";
import {
  Business,
  BusinessFormData,
  BUSINESS_CATEGORIES,
} from "@/lib/business-types";
import { toast } from "sonner";
import Link from "next/link";
import { WorkplaceLocationSettings } from "./business-location-settings";
import { AddressAutocomplete } from "./address-auto-complete";
import { cn } from "@/lib/utils";

const getCategoryLabel = (v: string) =>
  BUSINESS_CATEGORIES.find((c) => c.value === v)?.label ?? "Other";

function StatCard({
  title,
  value,
  icon: Icon,
  border,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  border: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border p-5", border)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {title}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  color,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ElementType;
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
          color
        )}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
    </Link>
  );
}

interface ModalProps {
  business: Business | null;
  onClose: () => void;
}

function BusinessModal({ business, onClose }: ModalProps) {
  const { submitBusiness, editBusiness, selectBusiness, loadBusinesses } =
    useBusiness();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const set = (k: string, v: string | number) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!formData.name.trim()) e.name = "Business name is required";
      if (!formData.email.trim()) e.email = "Email is required";
      if (!formData.phone.trim()) e.phone = "Phone is required";
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        e.email = "Invalid email";
      if (formData.website?.trim() && !/^https?:\/\/.+/.test(formData.website))
        e.website = "Must start with http:// or https://";
    }
    if (s === 2) {
      if (!formData.address.trim()) e.address = "Address is required";
      if (!formData.city.trim()) e.city = "City is required";
      if (!formData.country.trim()) e.country = "Country is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate(2)) return;
    setSubmitting(true);
    try {
      if (business) {
        await editBusiness(business.id, formData);
        toast.success("Business updated!");
      } else {
        await submitBusiness(formData);
        toast.success("Business created!");
      }
      onClose();
      selectBusiness(null);
      loadBusinesses();
    } catch {
      toast.error("Failed to save business.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (err?: string) =>
    cn(
      "w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      err ? "border-red-300 bg-red-50" : "border-gray-200"
    );
  const selectCls =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

  const STEPS = ["Basic Info", "Location", "Review"];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {business ? "Edit Business" : "Create Business"}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <React.Fragment key={n}>
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {done ? <CheckCircle className="w-4 h-4" /> : n}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold hidden sm:block",
                        active
                          ? "text-blue-600"
                          : done
                          ? "text-emerald-600"
                          : "text-gray-400"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-px transition-colors",
                        step > n ? "bg-emerald-300" : "bg-gray-100"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div>
                <label className={labelCls}>
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls(errors.name)}
                  placeholder="Enter your business name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => set("category", e.target.value)}
                    className={selectCls}
                  >
                    {BUSINESS_CATEGORIES.slice(1).map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Business Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => set("size", e.target.value)}
                    className={selectCls}
                  >
                    <option value="SMALL">1–10 employees</option>
                    <option value="MEDIUM">11–50 employees</option>
                    <option value="LARGE">51–200 employees</option>
                    <option value="ENTERPRISE">200+ employees</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputCls(errors.email)}
                    placeholder="business@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputCls(errors.phone)}
                    placeholder="+256-700-000000"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Website{" "}
                  <span className="text-gray-300 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => set("website", e.target.value)}
                  className={inputCls(errors.website)}
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Brief description of your business..."
                />
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div>
                <label className={labelCls}>
                  Business Address <span className="text-red-500">*</span>
                </label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={(address) => set("address", address)}
                  onPlaceSelected={(place) =>
                    setFormData((p) => ({
                      ...p,
                      address: place.address,
                      street: place.street,
                      city: place.city,
                      country: place.country,
                      postal_code: place.postal_code || p.postal_code,
                      workplace_latitude: Number(place.latitude.toFixed(6)),
                      workplace_longitude: Number(place.longitude.toFixed(6)),
                    }))
                  }
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Start typing to search for your address
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Street Address</label>
                  <input
                    value={formData.street || ""}
                    onChange={(e) => set("street", e.target.value)}
                    className={inputCls()}
                    placeholder="e.g. Plot 123, Acacia Avenue"
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={inputCls(errors.city)}
                    placeholder="Kampala"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={inputCls(errors.country)}
                    placeholder="Uganda"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Postal Code</label>
                  <input
                    value={formData.postal_code}
                    onChange={(e) => set("postal_code", e.target.value)}
                    className={inputCls()}
                    placeholder="00000"
                  />
                </div>
              </div>
              {formData.workplace_latitude && formData.workplace_longitude && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">
                      Location pinned
                    </p>
                    <p className="text-xs text-emerald-600">
                      {formData.workplace_latitude.toFixed(6)},{" "}
                      {formData.workplace_longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}
              {/* Service hours */}
              <div>
                <label className={labelCls}>Service Hours</label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(["Opening", "Closing"] as const).map((label, idx) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 mb-1.5">
                        {label} Time
                      </p>
                      <input
                        type="time"
                        value={
                          formData.service_time.split(" - ")[idx]?.trim() || ""
                        }
                        onChange={(e) => {
                          const parts = formData.service_time
                            .split(" - ")
                            .map((s) => s.trim());
                          parts[idx] = e.target.value;
                          set(
                            "service_time",
                            parts.filter(Boolean).join(" - ")
                          );
                        }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
                {formData.service_time && (
                  <p className="text-xs text-gray-400 mt-2">
                    Hours: {formData.service_time}
                  </p>
                )}
              </div>
            </>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Basic Information
                  </p>
                  <div className="space-y-1">
                    {[
                      ["Name", formData.name],
                      ["Category", getCategoryLabel(formData.category)],
                      ["Email", formData.email],
                      ["Phone", formData.phone],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-400">{k}</span>
                        <span className="font-medium text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Location
                  </p>
                  <div className="space-y-1">
                    {[
                      ["Address", formData.address],
                      ["City", formData.city],
                      ["Country", formData.country],
                    ].map(
                      ([k, v]) =>
                        v && (
                          <div
                            key={k}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-400">{k}</span>
                            <span className="font-medium text-gray-900">
                              {v}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>
                {formData.service_time && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Service Hours
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.service_time}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  By {business ? "updating" : "creating"} this business, you
                  agree to our terms of service and may need to complete
                  verification to access all features.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl flex items-center justify-between gap-3 shrink-0">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={submitting}
                className="border-gray-200 h-9 px-4 rounded-xl text-sm"
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="border-gray-200 h-9 px-4 rounded-xl text-sm"
            >
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => {
                  if (validate(step)) setStep((s) => s + 1);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-xl text-sm font-semibold"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 rounded-xl text-sm font-semibold"
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
}

export default function MyBusinessPage() {
  const [showModal, setShowModal] = useState(false);
  const {
    businesses,
    loading,
    error,
    loadBusinesses,
    editBusiness,
    clearBusinessError,
  } = useBusiness();
  const business = businesses[0] ?? null;

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 px-8 py-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Your Business Dashboard
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Create your business profile to start managing your workforce,
              scheduling shifts, and posting jobs.
            </p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 h-11 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Business Profile
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Users,
                color: "bg-blue-100 text-blue-600",
                title: "Manage Staff",
                desc: "Add and organize your team members with detailed profiles",
              },
              {
                icon: Calendar,
                color: "bg-emerald-100 text-emerald-600",
                title: "Schedule Shifts",
                desc: "Create and manage work schedules efficiently",
              },
              {
                icon: Briefcase,
                color: "bg-violet-100 text-violet-600",
                title: "Post Jobs",
                desc: "Attract talented workers and manage applications",
              },
              {
                icon: BarChart3,
                color: "bg-amber-100 text-amber-600",
                title: "Track Performance",
                desc: "Monitor hours worked and business analytics",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    color
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {showModal && (
          <BusinessModal business={null} onClose={() => setShowModal(false)} />
        )}
      </div>
    );
  }

  // ── Has business ──
  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearBusinessError}
              className="border-red-200 text-red-700 hover:bg-red-100 shrink-0 h-8 px-3 text-xs rounded-xl"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* ── Business header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {business.name}
                </h1>
                <p className="text-sm text-blue-600 font-medium mt-0.5">
                  {getCategoryLabel(business.category)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 h-9 px-4 rounded-xl shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          </div>

          {business.description && (
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              {business.description}
            </p>
          )}

          {/* Contact row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: MapPin, value: business.address },
              { icon: Mail, value: business.email },
              { icon: Phone, value: business.phone },
              ...(business.service_time
                ? [{ icon: Clock, value: business.service_time }]
                : []),
            ].map(({ icon: Icon, value }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-600 truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Staff"
            value={business.staff_count || 0}
            icon={Users}
            border="border-blue-100"
          />
          <StatCard
            title="Active Jobs"
            value={business.active_jobs || 0}
            icon={Briefcase}
            border="border-emerald-100"
          />
          <StatCard
            title="Applications"
            value={business.total_applications || 0}
            icon={BarChart3}
            border="border-violet-100"
          />
          <StatCard
            title="Category"
            value={getCategoryLabel(business.category)}
            icon={Building2}
            border="border-gray-100"
          />
        </div>

        {/* ── Two-column ── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <QuickAction
                href="/staff"
                icon={Users}
                color="bg-blue-600"
                title="Manage Staff"
                subtitle="View and edit team members"
              />
              <QuickAction
                href="/shifts"
                icon={Calendar}
                color="bg-emerald-600"
                title="Schedule Shifts"
                subtitle="Create and manage schedules"
              />
              <QuickAction
                href="/jobs/create"
                icon={Briefcase}
                color="bg-violet-600"
                title="Post New Job"
                subtitle="Create a job listing"
              />
              <QuickAction
                href="/manage-applications"
                icon={BarChart3}
                color="bg-amber-500"
                title="Applications"
                subtitle="Review applicants"
              />
            </div>
          </div>

          {/* Location settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <WorkplaceLocationSettings
              business={business}
              onUpdate={async (data) => {
                await editBusiness(business.id, data);
                loadBusinesses();
              }}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <BusinessModal
          business={business}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
