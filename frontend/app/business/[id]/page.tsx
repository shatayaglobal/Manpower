"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Calendar,
  BarChart3,
  Copy,
  ExternalLink,
  Shield,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { businessAPI } from "@/lib/redux/business-api";
import { Business } from "@/lib/business-types";
import { toast } from "sonner";

interface VerificationStatus {
  text: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BusinessDetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        setLoading(true);
        const businessData = await businessAPI.getBusiness(businessId);
        setBusiness(businessData);
      } catch {
        setError("Failed to load business details");
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusinessDetails();
    }
  }, [businessId]);

  const getVerificationStatus = (business: Business): VerificationStatus => {
    if (business.is_verified) {
      return {
        text: "Verified",
        color: "text-green-800",
        bgColor: "bg-green-100",
        icon: CheckCircle,
      };
    }

    // You can extend this based on your verification_status field
    return {
      text: "Not Verified",
      color: "text-gray-800",
      bgColor: "bg-gray-100",
      icon: XCircle,
    };
  };

  const handleRequestVerification = async () => {
    if (!business) return;

    try {
      await businessAPI.requestVerification(business.id);
      toast.success("Verification request submitted successfully");
      // Refresh business data
      const updatedBusiness = await businessAPI.getBusiness(businessId);
      setBusiness(updatedBusiness);
    } catch  {
      toast.error("Failed to request verification");
    }
  };

  const handleDeleteBusiness = async () => {
    if (!business) return;

    if (window.confirm("Are you sure you want to delete this business?")) {
      try {
        await businessAPI.deleteBusiness(business.id);
        toast.success("Business deleted successfully");
        router.push("/my-business");
      } catch{
        toast.error("Failed to delete business");
      }
    }
  };

  const copyBusinessId = () => {
    if (business) {
      navigator.clipboard.writeText(business.business_id);
      toast.success("Business ID copied to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Business Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The business you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push("/business")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Businesses
          </Button>
        </div>
      </div>
    );
  }

  const verification = getVerificationStatus(business);
  const StatusIcon = verification.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/business")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Businesses
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {business.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500">{business.business_id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyBusinessId}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge className={`${verification.bgColor} ${verification.color} border-0`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {verification.text}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {business.category.toLowerCase().replace("_", " ")}
                  </Badge>
                  <Badge variant="outline">
                    {business.size === "SMALL" && "1-10 employees"}
                    {business.size === "MEDIUM" && "11-50 employees"}
                    {business.size === "LARGE" && "51-200 employees"}
                    {business.size === "ENTERPRISE" && "200+ employees"}
                  </Badge>
                </div>

                {business.description && (
                  <p className="text-gray-600 max-w-2xl">{business.description}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <Button
                  onClick={() => router.push(`/business/${business.id}/edit`)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Business
                </Button>

                {!business.is_verified && (
                  <Button
                    variant="outline"
                    onClick={handleRequestVerification}
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Request Verification
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleDeleteBusiness}
                  className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {business.total_staff || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Staff</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {business.active_jobs || 0}
                      </p>
                      <p className="text-sm text-gray-600">Active Jobs</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {business.total_applications || 0}
                      </p>
                      <p className="text-sm text-gray-600">Applications</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatDate(business.created_at).split(',')[1]}
                      </p>
                      <p className="text-sm text-gray-600">Year Founded</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{business.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{business.phone}</p>
                      </div>
                    </div>

                    {business.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {business.website}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">
                          {business.address}<br />
                          {business.city}, {business.country}
                          {business.postal_code && ` ${business.postal_code}`}
                        </p>
                      </div>
                    </div>

                    {business.service_time && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Service Hours</p>
                          <p className="font-medium whitespace-pre-line">
                            {business.service_time}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Business ID</p>
                      <p className="text-gray-900">{business.business_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Category</p>
                      <p className="text-gray-900 capitalize">
                        {business.category.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Size</p>
                      <p className="text-gray-900">
                        {business.size === "SMALL" && "1-10 employees"}
                        {business.size === "MEDIUM" && "11-50 employees"}
                        {business.size === "LARGE" && "51-200 employees"}
                        {business.size === "ENTERPRISE" && "200+ employees"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <Badge variant={business.is_active ? "default" : "secondary"}>
                        {business.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Created</p>
                      <p className="text-gray-900">{formatDate(business.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated</p>
                      <p className="text-gray-900">{formatDate(business.updated_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Verification Status</p>
                      <Badge className={`${verification.bgColor} ${verification.color} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {verification.text}
                      </Badge>
                    </div>
                  </div>
                </div>

                {business.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                    <p className="text-gray-900 leading-relaxed">{business.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>Staff Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Staff Management Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    This feature will allow you to manage your business staff and roles.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Track your business performance, staff productivity, and job posting analytics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessDetailsPage;
