"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Briefcase,
  Calendar,
  Building2,
  Loader2,
  Bell,
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

// ── Skeleton card ─────────────────────────────────────────────────────────────
function InvitationSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-3.5 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/5" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await axiosInstance.get("/workforce/invitations/");
      setInvitations(res.data);
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
      toast.success("Invitation declined");
      await fetchInvitations();
      window.dispatchEvent(new Event("invitation-changed"));
    } catch {
      toast.error("Failed to decline invitation");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Review and respond to job invitations from companies
            </p>
          </div>
          {!loading && invitations.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              <Bell className="w-3 h-3" />
              {invitations.length} pending
            </span>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <InvitationSkeleton key={i} />
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No pending invitations
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              You&apos;ll see invitations here when companies reach out to add
              you as staff.
            </p>
            <Button
              onClick={() => router.push("/jobs")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((inv) => {
              const isProcessing = processingId === inv.id;
              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-100 hover:shadow-sm transition-all"
                >
                  {/* Top row */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {inv.business_name}
                          </h3>
                          <p className="text-sm font-semibold text-blue-600 mt-0.5">
                            {inv.job_title}
                          </p>
                        </div>
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    {inv.department && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
                        <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400">Department</p>
                          <p className="font-medium text-gray-900 text-xs mt-0.5">
                            {inv.department}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Start Date</p>
                        <p className="font-medium text-gray-900 text-xs mt-0.5">
                          {new Date(inv.hire_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
                      <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Employment Type</p>
                        <p className="font-medium text-gray-900 text-xs mt-0.5 capitalize">
                          {inv.employment_type.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {inv.message && (
                    <div className="mb-5 px-4 py-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        Message from employer
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {inv.message}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAccept(inv.id)}
                      disabled={isProcessing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReject(inv.id)}
                      disabled={isProcessing}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold h-10 rounded-xl"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Decline
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
