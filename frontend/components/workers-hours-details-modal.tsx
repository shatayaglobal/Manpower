"use client";

import React from "react";
import { X, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoursCard } from "@/lib/workforce-types";

interface HoursCardDetailsModalProps {
  isOpen: boolean;
  hours: HoursCard | null;
  onClose: () => void;
  getStatusBadge: (hours: HoursCard) => React.ReactNode;
  calculateTotalHours: (hours: HoursCard) => number;
}

export const HoursCardDetailsModal: React.FC<HoursCardDetailsModalProps> = ({
  isOpen,
  hours,
  onClose,
  getStatusBadge,
  calculateTotalHours,
}) => {
  if (!isOpen || !hours) return null;

  const formatDateTime = (isoString: string | undefined | null): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTime12Hour = (time24: string) => {
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
    if (datetime) return formatDateTime(datetime);
    if (timeOnly) return formatTime12Hour(timeOnly);
    return "";
  };

  const hasClockOut = !!hours.clock_out_datetime || !!hours.clock_out;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Hours Card Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Staff Member */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Staff Member</h3>
            <p className="text-lg font-semibold text-gray-900">{hours.staff_name}</p>
          </div>

          {/* Date */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Date</h3>
            <p className="text-gray-900">
              {new Date(hours.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Clock In / Clock Out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Clock In
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {getFormattedTime(hours.clock_in_datetime, hours.clock_in)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Clock Out
              </h3>
              {/* Fixed: No <div> inside <p> */}
              {hasClockOut ? (
                <p className="text-lg font-semibold text-gray-900">
                  {getFormattedTime(hours.clock_out_datetime, hours.clock_out)}
                </p>
              ) : (
                <div className="text-lg font-medium text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Currently Active
                </div>
              )}
            </div>
          </div>

          {/* Total Hours */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Total Hours Worked
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {calculateTotalHours(hours).toFixed(2)} hrs
            </p>
            {!hasClockOut && (
              <p className="text-xs text-blue-700 mt-1 animate-pulse">
                In progress...
              </p>
            )}
          </div>

          {/* Clock-in Location */}
          {hours.clock_in_latitude && hours.clock_in_longitude && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Clock In Location
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Coordinates:</span>{" "}
                      {hours.clock_in_latitude}, {hours.clock_in_longitude}
                    </p>
                    {hours.clock_in_distance_meters != null && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Distance from workplace:</span>{" "}
                        <span
                          className={`font-semibold ${
                            hours.clock_in_distance_meters <= 100
                              ? "text-green-600"
                              : hours.clock_in_distance_meters <= 300
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {Math.round(hours.clock_in_distance_meters)}m
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${hours.clock_in_latitude},${hours.clock_in_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  View on Google Maps
                </a>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <div>{getStatusBadge(hours)}</div>
          </div>

          {/* Notes */}
          {hours.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap">{hours.notes}</p>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {hours.rejection_reason && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center text-red-600">
                <XCircle className="w-4 h-4 mr-1" />
                Rejection Reason
              </h3>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-900 whitespace-pre-wrap">
                  {hours.rejection_reason}
                </p>
              </div>
            </div>
          )}

          {/* Worker Signature */}
          {hours.worker_signature && hours.worker_signed_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                Worker Signature
              </h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  <span className="font-medium">Signed by worker at:</span>{" "}
                  {new Date(hours.worker_signed_at).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Approval Info */}
          {hours.approved_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                Approval Information
              </h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  <span className="font-medium">Approved at:</span>{" "}
                  {new Date(hours.approved_at).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end sticky bottom-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
