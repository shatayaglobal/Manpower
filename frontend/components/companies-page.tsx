"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Search,
  Filter,
  Eye,
  Briefcase,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/lib/redux/useBusiness";
import { Business } from "@/lib/business-types";
import { BUSINESS_CATEGORIES } from "@/lib/business-types";
import { useRouter } from "next/navigation";

interface CompanyCardProps {
  company: Business;
  onViewDetails: (company: Business) => void;
}

interface CompanyDetailModalProps {
  company: Business | null;
  onClose: () => void;
}

const BrowseCompaniesPage: React.FC = () => {
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  const [localFilterCategory, setLocalFilterCategory] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<Business | null>(null);
  const router = useRouter();


  const {
    businesses,
    loading,
    error,
    filters,
    loadBusinesses,
    clearBusinessError,
    setFilters,
  } = useBusiness();

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    setLocalSearchTerm(filters.search);
    setLocalFilterCategory(filters.category);
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({
        search: localSearchTerm,
        category: localFilterCategory === "all" ? "" : localFilterCategory,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, localFilterCategory, setFilters]);

  const handleViewDetails = (company: Business) => {
    setSelectedCompany(company);
  };

  const handleViewJobs = (companyId: string) => {
    router.push(`/jobs?company=${companyId}`);
  };

  const CompanyCard: React.FC<CompanyCardProps> = ({ company, onViewDetails }) => {
    const getCategoryLabel = (category: string) => {
      const found = BUSINESS_CATEGORIES.find(cat => cat.value === category);
      return found ? found.label : category.replace("_", " ");
    };

    const getSizeLabel = (size: string) => {
      switch (size) {
        case "SMALL": return "1-10 employees";
        case "MEDIUM": return "11-50 employees";
        case "LARGE": return "51-200 employees";
        case "ENTERPRISE": return "200+ employees";
        default: return size;
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                {company.is_verified && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">{company.business_id}</p>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
              <span className="capitalize">{getCategoryLabel(company.category)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              <span>{getSizeLabel(company.size)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{company.city}, {company.country}</span>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <p className="text-sm text-gray-600 mb-6 line-clamp-2">
              {company.description}
            </p>
          )}

          {/* Stats Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-600">
                  {company.active_jobs || 0}
                </p>
                <p className="text-xs text-gray-500">Open Jobs</p>
              </div>
              {company.staff_count && (
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-600">
                    {company.staff_count}
                  </p>
                  <p className="text-xs text-gray-500">Employees</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(company)}
                className="flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Details
              </Button>
              {(company.active_jobs || 0) > 0 && (
                <Button
                  size="sm"
                  onClick={() => handleViewJobs(company.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                >
                  <Briefcase className="w-4 h-4" />
                  View Jobs
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, onClose }) => {
    if (!company) return null;

    const getCategoryLabel = (category: string) => {
      const found = BUSINESS_CATEGORIES.find(cat => cat.value === category);
      return found ? found.label : category.replace("_", " ");
    };

    const getSizeLabel = (size: string) => {
      switch (size) {
        case "SMALL": return "1-10 employees";
        case "MEDIUM": return "11-50 employees";
        case "LARGE": return "51-200 employees";
        case "ENTERPRISE": return "200+ employees";
        default: return size;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">{company.name}</h2>
                  {company.is_verified && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{company.business_id}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Category:</span>
                    <span className="capitalize">{getCategoryLabel(company.category)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-2">Size:</span>
                    <span>{getSizeLabel(company.size)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {company.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600">{company.description}</p>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{company.address}, {company.city}, {company.country}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{company.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{company.phone}</span>
                  </div>
                  {company.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {company.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Hours */}
              {company.service_time && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Service Hours</h3>
                  <p className="text-gray-600">{company.service_time}</p>
                </div>
              )}

              {/* Job Opportunities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Job Opportunities</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-blue-700">
                        {company.active_jobs || 0} Open Position{(company.active_jobs || 0) !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-blue-600">
                        {(company.active_jobs || 0) > 0
                          ? "Currently hiring in multiple departments"
                          : "No open positions at the moment"}
                      </p>
                    </div>
                    {(company.active_jobs || 0) > 0 && (
                      <Button
                        onClick={() => handleViewJobs(company.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        View All Jobs
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/contact')}
                className="flex items-center gap-1"
              >
                <Mail className="w-4 h-4" />
                Contact Company
              </Button>
              {(company.active_jobs || 0) > 0 && (
                <Button
                  onClick={() => handleViewJobs(company.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                >
                  <Briefcase className="w-4 h-4" />
                  View Jobs
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        clearBusinessError();
      }
    };
  }, [error, clearBusinessError]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
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

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Companies</h1>
          <p className="text-gray-600">
            Discover companies and explore career opportunities
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search companies by name, description, or location..."
                value={localSearchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalSearchTerm(e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={localFilterCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setLocalFilterCategory(e.target.value)
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          {(localSearchTerm || localFilterCategory !== "all") && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Showing {businesses.length} compan{businesses.length !== 1 ? 'ies' : 'y'}
                {localSearchTerm && ` for "${localSearchTerm}"`}
              </p>
            </div>
          )}
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="ml-2 text-gray-600">Loading companies...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              No companies found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or browse all companies to find opportunities.
            </p>
            <Button
              onClick={() => {
                setLocalSearchTerm("");
                setLocalFilterCategory("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {businesses.map((company: Business) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Company Detail Modal */}
        {selectedCompany && (
          <CompanyDetailModal
            company={selectedCompany}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </div>
    </div>
  );
};

export default BrowseCompaniesPage;
