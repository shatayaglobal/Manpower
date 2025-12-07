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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { toast } from "sonner";
import { HoursCard } from "@/lib/workforce-types";
const MyHoursPage = () => {
  const { myHoursCards, loadMyHoursCards, signHoursCard } = useWorkforce();
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState("");
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<HoursCard | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsCard, setDetailsCard] = useState<HoursCard | null>(null);

  useEffect(() => {
    loadMyHoursCards();
  }, [loadMyHoursCards]);

  const handleSignClick = (card: HoursCard) => {
    setSelectedCard(card);
    setSignature("");
    setShowSignModal(true);
  };

  const handleViewDetails = (card: HoursCard) => {
    setDetailsCard(card);
    setShowDetailsModal(true);
  };

  const handleSign = async () => {
    if (!selectedCard || !signature.trim()) {
      toast.error("Please enter your signature");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  const formatDateTime = (isoString: string | undefined | null): string => {
    if (!isoString) return "";

    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTime12Hour = (time24: string | undefined | null) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getFormattedTime = (
    datetime: string | undefined | null,
    timeOnly: string | undefined | null
  ): string => {
    if (datetime) {
      return formatDateTime(datetime);
    }
    if (timeOnly) {
      return formatTime12Hour(timeOnly);
    }
    return "";
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { bg: string; text: string; label: string; icon: React.ReactNode }
    > = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending Signature",
        icon: <Edit className="w-3 h-3" />,
      },
      SIGNED: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Awaiting Approval",
        icon: <Clock className="w-3 h-3" />,
      },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected",
        icon: <XCircle className="w-3 h-3" />,
      },
    };

    const { bg, text, label, icon } = config[status] || config.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
      >
        {icon}
        {label}
      </span>
    );
  };

  const canSign = (card: HoursCard) => {
    return (
      (card.clock_out_datetime || card.clock_out) &&
      !card.is_signed &&
      card.status === "PENDING"
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            My Hours
          </h1>
          <p className="text-gray-600 mt-2">View and sign your hour cards</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-base text-gray-600">Total Hours</p>
            <p className="text-2xl font-bold text-gray-900">
              {myHoursCards
                .reduce((sum, card) => sum + (card.total_hours_decimal || 0), 0)
                .toFixed(1)}
              h
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <p className="text-base text-yellow-800">Pending Signature</p>
            <p className="text-2xl font-bold text-yellow-900">
              {
                myHoursCards.filter(
                  (c) =>
                    c.status === "PENDING" &&
                    (c.clock_out_datetime || c.clock_out) &&
                    !c.is_signed
                ).length
              }
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-base text-blue-800">Awaiting Approval</p>
            <p className="text-2xl font-bold text-blue-900">
              {myHoursCards.filter((c) => c.status === "SIGNED").length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-base text-green-800">Approved</p>
            <p className="text-2xl font-bold text-green-900">
              {myHoursCards.filter((c) => c.status === "APPROVED").length}
            </p>
          </div>
        </div>
        {/* Hours Table */}
        {myHoursCards.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hours recorded yet
            </h3>
            <p className="text-gray-600">
              Your hour cards will appear here after you clock in
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clock In/Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myHoursCards.map((card) => (
                    <tr
                      key={card.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(card.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(card.date).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getFormattedTime(
                            card.clock_in_datetime,
                            card.clock_in
                          )}{" "}
                          -{" "}
                          {card.clock_out_datetime || card.clock_out ? (
                            getFormattedTime(
                              card.clock_out_datetime,
                              card.clock_out
                            )
                          ) : (
                            <span className="text-green-600 font-medium">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {card.clock_out_datetime || card.clock_out
                            ? `${Math.abs(
                                card.total_hours_decimal || 0
                              ).toFixed(2)} hrs`
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(card.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {canSign(card) ? (
                            <Button
                              size="sm"
                              onClick={() => handleSignClick(card)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Sign
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(card)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sign Modal */}
        {showSignModal && selectedCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sign Hour Card
              </h2>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedCard.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Hours</p>
                <p className="font-medium text-gray-900">
                  {getFormattedTime(
                    selectedCard.clock_in_datetime,
                    selectedCard.clock_in
                  )}{" "}
                  -{" "}
                  {getFormattedTime(
                    selectedCard.clock_out_datetime,
                    selectedCard.clock_out
                  )}{" "}
                  ({Math.abs(selectedCard.total_hours_decimal).toFixed(2)}h)
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Signature (Type your full name)
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  By signing, you confirm the accuracy of the hours worked
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowSignModal(false);
                    setSignature("");
                    setSelectedCard(null);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={loading || !signature.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {loading ? (
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

        {/* Details Modal */}
        {showDetailsModal && detailsCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Hour Card Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsCard(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date & Time */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(detailsCard.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-3 mb-2">Hours</p>
                  <p className="font-medium text-gray-900">
                    {getFormattedTime(
                      detailsCard.clock_in_datetime,
                      detailsCard.clock_in
                    )}{" "}
                    -{" "}
                    {getFormattedTime(
                      detailsCard.clock_out_datetime,
                      detailsCard.clock_out
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Total:{" "}
                    {Math.abs(detailsCard.total_hours_decimal).toFixed(2)} hours
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  {getStatusBadge(detailsCard.status)}
                </div>

                {/* Signature Info */}
                {detailsCard.is_signed && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      Signed by you
                    </p>
                    <p className="text-xs text-blue-700">
                      {detailsCard.worker_signature} •{" "}
                      {new Date(detailsCard.worker_signed_at!).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Approval Info */}
                {detailsCard.status === "APPROVED" && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-900 font-medium mb-1">
                      Approved by {detailsCard.approved_by_name}
                    </p>
                    <p className="text-xs text-green-700">
                      {new Date(detailsCard.approved_at!).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Rejection Info */}
                {detailsCard.status === "REJECTED" &&
                  detailsCard.rejection_reason && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-900 font-medium mb-1">
                        Rejected
                      </p>
                      <p className="text-xs text-red-700">
                        {detailsCard.rejection_reason}
                      </p>
                    </div>
                  )}

                {/* Notes */}
                {detailsCard.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Notes:
                    </p>
                    <p className="text-sm text-gray-700">{detailsCard.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsCard(null);
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHoursPage;
