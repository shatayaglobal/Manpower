"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Mail,
  Globe,
  Edit,
  Save,
  X,
  Clock,
  Phone,
  Loader2,
  Briefcase,
  Users,
  ChevronRight,
} from "lucide-react";
import type { RootState } from "@/lib/redux/store";
import { useBusiness } from "@/lib/redux/useBusiness";
import type {
  BusinessCategory,
  BusinessSize,
  CreateBusinessRequest,
} from "@/lib/business-types";
import { AddressAutocomplete } from "@/components/address-auto-complete";
import { cn } from "@/lib/utils";

const inputCls = (disabled?: boolean) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
    disabled
      ? "bg-gray-50 cursor-not-allowed border-gray-200"
      : "bg-white border-gray-200 hover:border-gray-300"
  );

const selectCls = (disabled?: boolean) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none",
    disabled
      ? "bg-gray-50 cursor-not-allowed border-gray-200"
      : "bg-white border-gray-200 hover:border-gray-300"
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

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-base font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-base font-medium text-gray-900">
        {value || <span className="text-gray-300 font-normal">Not set</span>}
      </p>
    </div>
  );
}

export default function BusinessProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { businesses, loading, loadBusinesses, submitBusiness, editBusiness } =
    useBusiness();

  const [isEditing, setIsEditing] = useState(false);
  const [isNewBusiness, setIsNewBusiness] = useState(false);

  const [formData, setFormData] = useState<CreateBusinessRequest>({
    name: "",
    category: "OTHER" as BusinessCategory,
    size: "SMALL" as BusinessSize,
    description: "",
    email: user?.email || "",
    phone: "",
    website: "",
    address: "",
    street: "",
    city: "",
    country: "",
    postal_code: "",
    service_time: "",
    workplace_latitude: null,
    workplace_longitude: null,
    clock_in_radius_meters: 100,
    require_location_for_clock_in: true,
  });

  const business = businesses[0];

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    if (user.account_type !== "BUSINESS") {
      toast.error("This page is for business accounts only");
      router.push("/profile");
      return;
    }
    loadBusinesses();
  }, [isAuthenticated, user, router, loadBusinesses]);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        category: business.category || "",
        size: business.size || "SMALL",
        description: business.description || "",
        email: business.email || user?.email || "",
        phone: business.phone || "",
        website: business.website || "",
        address: business.address || "",
        street: business.street || "",
        city: business.city || "",
        country: business.country || "",
        postal_code: business.postal_code || "",
        service_time: business.service_time || "",
        workplace_latitude: business.workplace_latitude ?? null,
        workplace_longitude: business.workplace_longitude ?? null,
        clock_in_radius_meters: business.clock_in_radius_meters ?? 100,
        require_location_for_clock_in:
          business.require_location_for_clock_in ?? true,
      });
      setIsNewBusiness(false);
    } else if (!loading) {
      setIsNewBusiness(true);
      setIsEditing(true);
    }
  }, [business, loading, user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) return toast.error("Business name is required");
    if (!formData.email?.trim()) return toast.error("Email is required");
    if (!formData.phone?.trim()) return toast.error("Phone is required");
    if (!formData.address?.trim()) return toast.error("Address is required");
    if (!formData.city?.trim()) return toast.error("City is required");
    if (!formData.country?.trim()) return toast.error("Country is required");

    try {
      if (isNewBusiness) {
        const result = await submitBusiness(formData);
        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Business profile created successfully!");
          setIsNewBusiness(false);
          setIsEditing(false);
          await loadBusinesses();
        } else {
          toast.error("Failed to create business profile");
        }
      } else if (business) {
        const result = await editBusiness(business.id, formData);
        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Business profile updated successfully!");
          setIsEditing(false);
          await loadBusinesses();
        } else {
          toast.error("Failed to update business profile");
        }
      }
    } catch (error) {
      toast.error("Something went wrong while saving");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (business) {
      setFormData({
        name: business.name || "",
        category: business.category || "",
        size: business.size || "SMALL",
        description: business.description || "",
        email: business.email || user?.email || "",
        phone: business.phone || "",
        website: business.website || "",
        address: business.address || "",
        street: business.street || "",
        city: business.city || "",
        country: business.country || "",
        postal_code: business.postal_code || "",
        service_time: business.service_time || "",
        workplace_latitude: business.workplace_latitude ?? null,
        workplace_longitude: business.workplace_longitude ?? null,
        clock_in_radius_meters: business.clock_in_radius_meters ?? 100,
        require_location_for_clock_in:
          business.require_location_for_clock_in ?? true,
      });
    } else {
      toast.info("Please complete your business profile to continue");
    }
  };

  if (!isAuthenticated || !user) return null;

  if (loading && !business) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  const sizeLabel: Record<string, string> = {
    SMALL: "1–10 employees",
    MEDIUM: "11–50 employees",
    LARGE: "51–200 employees",
    ENTERPRISE: "200+ employees",
  };

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page title ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isNewBusiness ? "Create Business Profile" : "Business Profile"}
          </h1>
          <p className="text-gray-500 text-base mt-1">
            {isNewBusiness
              ? "Set up your business so workers and customers can find you."
              : "Manage and update your business information."}
          </p>
        </div>

        {/* ── Hero summary strip ── */}
        {!isNewBusiness && business && (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {business.name}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                {(business.city || business.country) && (
                  <span className="flex items-center gap-1 text-base text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {[business.city, business.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                {business.email && (
                  <span className="flex items-center gap-1 text-base text-gray-500">
                    <Mail className="w-3.5 h-3.5" />
                    {business.email}
                  </span>
                )}
                {business.service_time && (
                  <span className="flex items-center gap-1 text-base text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {business.service_time}
                  </span>
                )}
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 text-base font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}
          </div>
        )}

        {/* ── View mode ── */}
        {!isEditing && business && (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {/* Basic Info */}
            <div className="p-6">
              <SectionLabel icon={<Briefcase className="w-3.5 h-3.5" />}>
                Basic Information
              </SectionLabel>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <InfoRow label="Business Name" value={business.name} />
                <InfoRow
                  label="Category"
                  value={
                    business.category
                      ? business.category.charAt(0) +
                        business.category.slice(1).toLowerCase()
                      : null
                  }
                />
                <InfoRow
                  label="Company Size"
                  value={business.size ? sizeLabel[business.size] : null}
                />
                <InfoRow label="Service Hours" value={business.service_time} />
              </div>
              {business.description && (
                <div className="mt-5">
                  <p className="text-base font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Description
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {business.description}
                  </p>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="p-6">
              <SectionLabel icon={<Mail className="w-3.5 h-3.5" />}>
                Contact
              </SectionLabel>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <InfoRow label="Email" value={business.email} />
                <InfoRow label="Phone" value={business.phone} />
                <div>
                  <p className="text-base font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Website
                  </p>
                  {business.website ? (
                    <a
                      href={
                        business.website.startsWith("http")
                          ? business.website
                          : `https://${business.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Visit website
                    </a>
                  ) : (
                    <span className="text-base text-gray-300">Not set</span>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="p-6">
              <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />}>
                Location
              </SectionLabel>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <InfoRow label="Street" value={business.street} />
                <InfoRow label="Address" value={business.address} />
                <InfoRow label="City" value={business.city} />
                <InfoRow label="Country" value={business.country} />
                <InfoRow label="Postal Code" value={business.postal_code} />
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isEditing && !business && (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No business profile yet
            </h3>
            <p className="text-gray-500 text-base mb-6 max-w-xs mx-auto">
              Create your profile to start managing your business on the
              platform.
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              Create Business Profile
            </Button>
          </div>
        )}

        {/* ── Edit / Create form ── */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {/* Section 1: Basic Info */}
            <div className="p-6">
              <SectionLabel icon={<Briefcase className="w-3.5 h-3.5" />}>
                Basic Information
              </SectionLabel>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Business Name{" "}
                    <span className="text-red-400 normal-case font-normal">
                      *
                    </span>
                  </Label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Company Ltd"
                    className={inputCls(loading)}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Category
                  </Label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={selectCls(loading)}
                    disabled={loading}
                  >
                    <option value="">Select category</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="RETAIL">Retail</option>
                    <option value="HEALTHCARE">Healthcare</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="CONSTRUCTION">Construction</option>
                    <option value="EDUCATION">Education</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="SERVICES">Services</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Company Size
                  </Label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className={selectCls(loading)}
                    disabled={loading}
                  >
                    <option value="SMALL">1–10 employees</option>
                    <option value="MEDIUM">11–50 employees</option>
                    <option value="LARGE">51–200 employees</option>
                    <option value="ENTERPRISE">200+ employees</option>
                  </select>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Service Hours{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      — Optional
                    </span>
                  </Label>
                  <input
                    name="service_time"
                    value={formData.service_time}
                    onChange={handleInputChange}
                    placeholder="Mon–Fri 9:00 AM – 5:00 PM"
                    className={inputCls(loading)}
                  />
                </div>
              </div>

              <div className="mt-5">
                <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Description{" "}
                  <span className="text-gray-300 normal-case font-normal">
                    — Optional
                  </span>
                </Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell people about your business, what you do, your values..."
                  style={{ minHeight: "120px" }}
                  className="w-full resize-none border border-gray-200 hover:border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Section 2: Contact */}
            <div className="p-6">
              <SectionLabel icon={<Mail className="w-3.5 h-3.5" />}>
                Contact
              </SectionLabel>
              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Email{" "}
                    <span className="text-red-400 normal-case font-normal">
                      *
                    </span>
                  </Label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputCls(loading)}
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Phone{" "}
                    <span className="text-red-400 normal-case font-normal">
                      *
                    </span>
                  </Label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={inputCls(loading)}
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Website{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      — Optional
                    </span>
                  </Label>
                  <input
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourcompany.com"
                    className={inputCls(loading)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Location */}
            <div className="p-6">
              <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />}>
                Location
              </SectionLabel>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Street Address{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      — Optional
                    </span>
                  </Label>
                  <input
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Plot 45, John Babiha Avenue"
                    className={inputCls(loading)}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Business Address{" "}
                    <span className="text-red-400 normal-case font-normal">
                      *
                    </span>
                  </Label>
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
                        workplace_latitude: place.latitude
                          ? Number(place.latitude.toFixed(6))
                          : null,
                        workplace_longitude: place.longitude
                          ? Number(place.longitude.toFixed(6))
                          : null,
                      });
                    }}
                    className={inputCls(loading)}
                  />
                  <p className="text-base text-gray-400 mt-1.5">
                    Start typing to search for your address
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    City{" "}
                    <span className="text-red-400 normal-case font-normal">
                      *
                    </span>
                  </Label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={inputCls(loading)}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Country{" "}
                    <span className="text-red-400 normal-case font-normal">
                      *
                    </span>
                  </Label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={inputCls(loading)}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Postal Code{" "}
                    <span className="text-gray-300 normal-case font-normal">
                      — Optional
                    </span>
                  </Label>
                  <input
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className={inputCls(loading)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/50 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-base text-gray-400">
                Fields marked <span className="text-red-400">*</span> are
                required
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                {!isNewBusiness && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 sm:flex-none sm:w-28 h-10 border-gray-200 rounded-xl font-semibold text-base"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 sm:flex-none sm:w-48 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      {isNewBusiness ? "Create Profile" : "Save Changes"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
