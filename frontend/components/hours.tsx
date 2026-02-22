"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Eye,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { toast } from "sonner";
import { HoursCard } from "@/lib/workforce-types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  PENDING: {
    label: "Pending Signature",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Edit,
  },
  SIGNED: {
    label: "Awaiting Approval",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTime12(t: string | null | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function getTime(
  datetime: string | null | undefined,
  timeOnly: string | null | undefined
): string {
  if (datetime) return formatDateTime(datetime);
  if (timeOnly) return formatTime12(timeOnly);
  return "";
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
        s.color
      )}
    >
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="w-16 h-4 bg-gray-100 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-32" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
      <div className="h-3.5 bg-gray-100 rounded w-14 hidden sm:block" />
      <div className="h-6 bg-gray-100 rounded-full w-28 hidden md:block" />
      <div className="h-8 bg-gray-100 rounded-lg w-16 shrink-0" />
    </div>
  );
}

export default function MyHoursPage() {
  const { myHoursCards, loadMyHoursCards, signHoursCard } = useWorkforce();
  const [sigLoading, setSigLoading] = useState(false);
  const [signature, setSignature] = useState("");
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<HoursCard | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsCard, setDetailsCard] = useState<HoursCard | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await loadMyHoursCards();
      setPageLoading(false);
    };
    load();
  }, [loadMyHoursCards]);

  const openSign = (card: HoursCard) => {
    setSelectedCard(card);
    setSignature("");
    setShowSignModal(true);
  };
  const openDetails = (card: HoursCard) => {
    setDetailsCard(card);
    setShowDetailsModal(true);
  };

  const handleSign = async () => {
    if (!selectedCard || !signature.trim()) {
      toast.error("Please enter your signature");
      return;
    }
    setSigLoading(true);
    try {
      await signHoursCard(selectedCard.id, signature.trim());
      toast.success("Hour card signed successfully!");
      setShowSignModal(false);
      setSignature("");
      setSelectedCard(null);
      loadMyHoursCards();
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as {
          response?: { data?: { error?: string; message?: string } };
        };
        toast.error(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to sign hour card"
        );
      } else {
        toast.error("Failed to sign hour card");
      }
    } finally {
      setSigLoading(false);
    }
  };

  const canSign = (card: HoursCard) =>
    !!(card.clock_out_datetime || card.clock_out) &&
    !card.is_signed &&
    card.status === "PENDING";

  // Summary stats
  const totalHours = myHoursCards.reduce(
    (s, c) => s + (c.total_hours_decimal || 0),
    0
  );
  const pendingCount = myHoursCards.filter(
    (c) =>
      c.status === "PENDING" &&
      (c.clock_out_datetime || c.clock_out) &&
      !c.is_signed
  ).length;
  const signedCount = myHoursCards.filter((c) => c.status === "SIGNED").length;
  const approvedCount = myHoursCards.filter(
    (c) => c.status === "APPROVED"
  ).length;

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">My Hours</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            View and sign your hour cards
          </p>
        </div>

        {/* ── Summary stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Total Hours
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalHours.toFixed(1)}
              <span className="text-sm font-normal text-gray-500 ml-1">
                hrs
              </span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 p-5">
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1">
              Needs Signature
            </p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">
              Awaiting Approval
            </p>
            <p className="text-2xl font-bold text-blue-700">{signedCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-emerald-100 p-5">
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">
              Approved
            </p>
            <p className="text-2xl font-bold text-emerald-700">
              {approvedCount}
            </p>
          </div>
        </div>

        {/* ── Hours list ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {pageLoading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : myHoursCards.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No hours recorded yet
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Your hour cards will appear here after you clock in for a shift.
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/60">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Date
                </p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Clock In / Out
                </p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Total
                </p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Status
                </p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
                  Action
                </p>
              </div>

              <div className="divide-y divide-gray-50">
                {myHoursCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_1.5fr_1fr_1.5fr_auto] gap-3 sm:gap-4 items-start sm:items-center px-5 py-4 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Date */}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {new Date(card.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(card.date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>
                    </div>

                    {/* Clock times */}
                    <div className="text-sm text-gray-700 font-medium">
                      {getTime(card.clock_in_datetime, card.clock_in)}
                      <span className="text-gray-400 mx-1.5">→</span>
                      {card.clock_out_datetime || card.clock_out ? (
                        getTime(card.clock_out_datetime, card.clock_out)
                      ) : (
                        <span className="text-emerald-600 font-semibold">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Total hours */}
                    <div className="text-sm font-bold text-gray-900">
                      {card.clock_out_datetime || card.clock_out ? (
                        `${Math.abs(card.total_hours_decimal || 0).toFixed(2)}h`
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <StatusBadge status={card.status} />
                    </div>

                    {/* Action */}
                    <div className="flex justify-end">
                      {canSign(card) ? (
                        <Button
                          size="sm"
                          onClick={() => openSign(card)}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs font-semibold"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Sign
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(card)}
                          className="border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600 h-8 px-3 text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Sign Modal ── */}
      {showSignModal && selectedCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Sign Hour Card
              </h2>
              <button
                onClick={() => {
                  setShowSignModal(false);
                  setSignature("");
                  setSelectedCard(null);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Date</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(selectedCard.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Hours</span>
                <span className="text-sm font-semibold text-gray-900">
                  {getTime(
                    selectedCard.clock_in_datetime,
                    selectedCard.clock_in
                  )}{" "}
                  →{" "}
                  {getTime(
                    selectedCard.clock_out_datetime,
                    selectedCard.clock_out
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.abs(selectedCard.total_hours_decimal).toFixed(2)}h
                </span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Signature <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSign()}
                placeholder="Type your full name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5">
                By signing, you confirm the accuracy of the hours worked.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-200"
                disabled={sigLoading}
                onClick={() => {
                  setShowSignModal(false);
                  setSignature("");
                  setSelectedCard(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSign}
                disabled={sigLoading || !signature.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {sigLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sign Card
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Details Modal ── */}
      {showDetailsModal && detailsCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Hour Card Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsCard(null);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date & time */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Date</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(detailsCard.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Clock In</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getTime(
                      detailsCard.clock_in_datetime,
                      detailsCard.clock_in
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Clock Out</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getTime(
                      detailsCard.clock_out_datetime,
                      detailsCard.clock_out
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                  <span className="text-xs font-semibold text-gray-500">
                    Total Hours
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.abs(detailsCard.total_hours_decimal).toFixed(2)}h
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-gray-500">Status</span>
                <StatusBadge status={detailsCard.status} />
              </div>

              {/* Signature */}
              {detailsCard.is_signed && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Signed by you
                  </p>
                  <p className="text-sm text-blue-900 font-medium">
                    {detailsCard.worker_signature}
                  </p>
                  {detailsCard.worker_signed_at && (
                    <p className="text-xs text-blue-500 mt-0.5">
                      {new Date(detailsCard.worker_signed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Approval */}
              {detailsCard.status === "APPROVED" && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">
                    Approved by {detailsCard.approved_by_name}
                  </p>
                  {detailsCard.approved_at && (
                    <p className="text-xs text-emerald-600">
                      {new Date(detailsCard.approved_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Rejection */}
              {detailsCard.status === "REJECTED" &&
                detailsCard.rejection_reason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-800">
                      {detailsCard.rejection_reason}
                    </p>
                  </div>
                )}

              {/* Notes */}
              {detailsCard.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700">{detailsCard.notes}</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-5 border-gray-200"
              onClick={() => {
                setShowDetailsModal(false);
                setDetailsCard(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
