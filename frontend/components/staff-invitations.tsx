"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Briefcase,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/redux/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Invitation {
  id: string;
  business_name: string;
  job_title: string;
  department: string;
  employment_type: string;
  hire_date: string;
  message: string;
  created_at: string;
}

const InvitationsPage = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await axiosInstance.get("/workforce/invitations/");
      setInvitations(response.data);
    } catch {
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      await axiosInstance.post(`/workforce/invitations/${id}/accept/`);
      toast.success("Invitation accepted!");
      await fetchInvitations();

      window.dispatchEvent(new Event("invitation-changed"));
    } catch {
      toast.error("Failed to accept invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await axiosInstance.post(`/workforce/invitations/${id}/reject/`);
      toast.success("Invitation rejected");
      await fetchInvitations();

      window.dispatchEvent(new Event("invitation-changed"));
    } catch {
      toast.error("Failed to reject invitation");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Staff Invitations
          </h1>
          <p className="text-gray-600 mt-2">
            Review and respond to job invitations from companies
          </p>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No pending invitations
            </h3>
            <p className="text-gray-600 mb-6">
              You&apos;ll see invitations here when companies add you as staff
            </p>
            <Button
              onClick={() => router.push("/jobs")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {invitation.business_name}
                    </h3>
                    <p className="text-lg text-blue-600 font-medium">
                      {invitation.job_title}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Pending
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {invitation.department && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span className="font-medium">Department:</span>
                      <span className="ml-1">{invitation.department}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">Start Date:</span>
                    <span className="ml-1">
                      {new Date(invitation.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="font-medium">Employment Type:</span>
                    <span className="ml-1 capitalize">
                      {invitation.employment_type.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {invitation.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {invitation.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAccept(invitation.id)}
                    disabled={processingId === invitation.id}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {processingId === invitation.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Accept Invitation
                  </Button>
                  <Button
                    onClick={() => handleReject(invitation.id)}
                    disabled={processingId === invitation.id}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {processingId === invitation.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;
