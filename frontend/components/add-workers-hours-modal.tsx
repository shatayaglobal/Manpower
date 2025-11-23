"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWorkforce } from "@/lib/redux/use-workforce";

interface AddWorkerHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClockInData {
  staff_id: string;
  notes: string;
  clock_in_time: string;
  date: string;
  timezone_offset: number;
  clock_out_time?: string;
}

export const AddWorkerHoursModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddWorkerHoursModalProps) => {
  const { staff, clockIn } = useWorkforce();

  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [clockInDate, setClockInDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [clockInTime, setClockInTime] = useState<string>("");
  const [clockInAMPM, setClockInAMPM] = useState<"AM" | "PM">("AM");
  const [clockOutTime, setClockOutTime] = useState<string>("");
  const [clockOutAMPM, setClockOutAMPM] = useState<"AM" | "PM">("PM");
  const [clockInNotes, setClockInNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      let hour12 = hours % 12;
      if (hour12 === 0) hour12 = 12;

      setClockInTime(
        `${hour12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      );
      setClockInAMPM(hours >= 12 ? "PM" : "AM");
    }
  }, [isOpen]);

  const convertTo24Hour = (time12: string, ampm: "AM" | "PM"): string => {
    if (!time12) return "";
    const [hoursStr, minutes] = time12.split(":");
    let hours = parseInt(hoursStr);

    if (ampm === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const formatTimeDisplay = (time12: string, ampm: "AM" | "PM"): string => {
    if (!time12) return "";
    return `${time12} ${ampm}`;
  };

  const handleSubmit = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a worker");
      return;
    }

    if (!clockInTime) {
      toast.error("Please enter clock in time");
      return;
    }

    setIsSubmitting(true);
    try {
      const clockIn24 = convertTo24Hour(clockInTime, clockInAMPM);
      const clockOut24 = clockOutTime
        ? convertTo24Hour(clockOutTime, clockOutAMPM)
        : "";

      const timezoneOffset = -new Date().getTimezoneOffset();

      const clockInData: ClockInData = {
        staff_id: selectedStaffId,
        notes: clockInNotes,
        clock_in_time: clockIn24,
        date: clockInDate,
        timezone_offset: timezoneOffset,
      };

      if (clockOut24) {
        clockInData.clock_out_time = clockOut24;
      }

      await clockIn(clockInData);
      toast.success(
        clockOut24
          ? "Worker hours recorded successfully"
          : "Worker clocked in successfully"
      );

      handleClose();
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to clock in worker";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStaffId("");
    setClockInDate(new Date().toISOString().split("T")[0]);
    setClockInTime("");
    setClockInAMPM("AM");
    setClockOutTime("");
    setClockOutAMPM("PM");
    setClockInNotes("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Worker Hours
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Worker Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Worker *
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isSubmitting}
            >
              <option value="">Choose a worker...</option>
              {staff
                .filter((s) => s.status === "ACTIVE")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.job_title}
                  </option>
                ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={clockInDate}
              onChange={(e) => setClockInDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Clock In Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clock In Time *
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="time"
                  value={clockInTime}
                  onChange={(e) => setClockInTime(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting}
                />
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setClockInAMPM("AM")}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      clockInAMPM === "AM"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockInAMPM("PM")}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                      clockInAMPM === "PM"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
              {clockInTime && (
                <p className="text-xs text-blue-600 font-medium">
                  Selected: {formatTimeDisplay(clockInTime, clockInAMPM)}
                </p>
              )}
            </div>
          </div>

          {/* Clock Out Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clock Out Time (Optional)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="time"
                  value={clockOutTime}
                  onChange={(e) => setClockOutTime(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setClockOutAMPM("AM")}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      clockOutAMPM === "AM"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockOutAMPM("PM")}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                      clockOutAMPM === "PM"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
              {clockOutTime && (
                <p className="text-xs text-blue-600 font-medium">
                  Selected: {formatTimeDisplay(clockOutTime, clockOutAMPM)}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={clockInNotes}
              onChange={(e) => setClockInNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
              placeholder="Add any notes..."
              disabled={isSubmitting}
            />
          </div>

          {/* Tip */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Leave clock out time empty if the worker
              is starting their shift now. You can clock them out later.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 sticky bottom-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedStaffId || !clockInTime}
            className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {clockOutTime ? "Save Hours" : "Clock In"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
