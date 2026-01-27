"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Camera,
  Clock,
  Home,
} from "lucide-react";
import type { RootState } from "@/lib/redux/store";
import { useBusiness } from "@/lib/redux/useBusiness";
import type { BusinessCategory, BusinessSize, CreateBusinessRequest } from "@/lib/business-types";
import { AddressAutocomplete } from "@/components/address-auto-complete";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">
            Loading business profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isNewBusiness
              ? "Create Your Business Profile"
              : "Business Profile"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isNewBusiness
              ? "Let's get your business set up so customers can find you."
              : "Manage and update your business information."}
          </p>
        </div>

        {/* Hero / Summary Card */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                  <Home className="h-12 w-12 text-gray-400" />
                </div>
                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-full border-2 border-white shadow-sm"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold truncate">
                  {formData.name || "Your Business"}
                </h2>
                <p className="text-blue-600 font-medium mt-1 capitalize">
                  {formData.category || "Category not set"}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {formData.city && formData.country
                      ? `${formData.city}, ${formData.country}`
                      : "Location not set"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {formData.email || "—"}
                  </span>
                </div>
              </div>

              {!isEditing && !isNewBusiness && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Company Details
              </h3>

              {isEditing && (
                <div className="flex gap-3">
                  {!isNewBusiness && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 lg:p-8">
            {isEditing ? (
              <div className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      Business Name{" "}
                      <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Company Ltd"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="SMALL">1–10 employees</option>
                      <option value="MEDIUM">11–50 employees</option>
                      <option value="LARGE">51–200 employees</option>
                      <option value="ENTERPRISE">200+ employees</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Hours</Label>
                    <Input
                      name="service_time"
                      value={formData.service_time}
                      onChange={handleInputChange}
                      placeholder="Mon–Fri 9:00 AM – 5:00 PM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Company Description</Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell people about your business, what you do, your values..."
                    rows={4}
                  />
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      Email <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      Phone <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Plot 45, John Babiha Avenue"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-1 mb-1.5">
                      Business Address <span className="text-red-500">*</span>
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
                          postal_code:
                            place.postal_code || formData.postal_code,
                          workplace_latitude: place.latitude
                            ? Number(place.latitude.toFixed(6))
                            : null,
                          workplace_longitude: place.longitude
                            ? Number(place.longitude.toFixed(6))
                            : null,
                        });
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Start typing to search for your address
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        City <span className="text-red-500 text-base">*</span>
                      </Label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        Country{" "}
                        <span className="text-red-500 text-base">*</span>
                      </Label>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2 mt-2">
                      <Label>Postal Code</Label>
                      <Input
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {business ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="font-medium capitalize">
                          {business.category?.toLowerCase() || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Company Size
                        </p>
                        <p className="font-medium">
                          {business.size
                            ? {
                                SMALL: "1–10 employees",
                                MEDIUM: "11–50 employees",
                                LARGE: "51–200 employees",
                                ENTERPRISE: "200+ employees",
                              }[business.size]
                            : "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium">
                          {business.email || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <p className="font-medium">
                          {business.phone || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Website</p>
                        {business.website ? (
                          <a
                            href={
                              business.website.startsWith("http")
                                ? business.website
                                : `https://${business.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1.5"
                          >
                            <Globe className="h-4 w-4" />
                            Visit website
                          </a>
                        ) : (
                          <span className="text-gray-500">Not set</span>
                        )}
                      </div>
                    </div>

                    {business.description && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          Description
                        </p>
                        <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                          {business.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        Location
                      </p>
                      <div className="space-y-1.5 text-gray-800">
                        {business.street && (
                          <p>
                            <span className="font-medium">Street:</span>{" "}
                            {business.street}
                          </p>
                        )}
                        {business.address && (
                          <p>
                            <span className="font-medium">Address:</span>{" "}
                            {business.address}
                          </p>
                        )}
                        {(business.city || business.country) && (
                          <p>
                            <span className="font-medium">City / Country:</span>{" "}
                            {[business.city, business.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        {business.postal_code && (
                          <p>
                            <span className="font-medium">Postal Code:</span>{" "}
                            {business.postal_code}
                          </p>
                        )}
                      </div>
                    </div>

                    {business.service_time && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          Service Hours
                        </p>
                        <p className="text-gray-800">{business.service_time}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Building2 className="mx-auto h-16 w-16 text-gray-300" />
                    <h3 className="mt-6 text-xl font-semibold text-gray-700">
                      No business profile yet
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Create your profile to start managing your business on the
                      platform
                    </p>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="mt-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Create Business Profile
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
