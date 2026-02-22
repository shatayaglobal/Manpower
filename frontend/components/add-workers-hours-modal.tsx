"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { cn } from "@/lib/utils";

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

const labelCls =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const inputCls = (err?: boolean) =>
  cn(
    "w-full px-3 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    err ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"
  );
const selectCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

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
        `${hour12.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      );
      setClockInAMPM(hours >= 12 ? "PM" : "AM");
    }
  }, [isOpen]);

  const convertTo24Hour = (time12: string, ampm: "AM" | "PM"): string => {
    if (!time12) return "";
    const [hoursStr, minutes] = time12.split(":");
    let hours = parseInt(hoursStr);
    if (ampm === "PM" && hours !== 12) hours += 12;
    else if (ampm === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
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
      const clockInData: ClockInData = {
        staff_id: selectedStaffId,
        notes: clockInNotes,
        clock_in_time: clockIn24,
        date: clockInDate,
        timezone_offset: -new Date().getTimezoneOffset(),
      };
      if (clockOut24) clockInData.clock_out_time = clockOut24;

      await clockIn(clockInData);
      toast.success(
        clockOut24
          ? "Worker hours recorded successfully"
          : "Worker clocked in successfully"
      );
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clock in worker"
      );
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

  const AMPMToggle = ({
    value,
    onChange,
    disabled,
  }: {
    value: "AM" | "PM";
    onChange: (v: "AM" | "PM") => void;
    disabled?: boolean;
  }) => (
    <div className="flex rounded-xl border border-gray-200 overflow-hidden shrink-0">
      {(["AM", "PM"] as const).map((period, i) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          disabled={disabled}
          className={cn(
            "px-3 py-2.5 text-xs font-semibold transition-colors",
            i === 1 && "border-l border-gray-200",
            value === period
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          {period}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Add Worker Hours</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Assignment section */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Assignment
            </p>

            <div>
              <label className={labelCls}>
                Worker{" "}
                <span className="text-red-500 normal-case font-normal">*</span>
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className={selectCls}
                disabled={isSubmitting}
              >
                <option value="">Choose a worker...</option>
                {staff
                  .filter((s) => s.status === "ACTIVE")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.job_title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>
                Date{" "}
                <span className="text-red-500 normal-case font-normal">*</span>
              </label>
              <input
                type="date"
                value={clockInDate}
                onChange={(e) => setClockInDate(e.target.value)}
                className={inputCls()}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Schedule section */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Schedule
            </p>

            {/* Clock In */}
            <div>
              <label className={labelCls}>
                Clock In Time{" "}
                <span className="text-red-500 normal-case font-normal">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={clockInTime}
                  onChange={(e) => setClockInTime(e.target.value)}
                  className={cn(inputCls(), "flex-1")}
                  disabled={isSubmitting}
                />
                <AMPMToggle
                  value={clockInAMPM}
                  onChange={setClockInAMPM}
                  disabled={isSubmitting}
                />
              </div>
              {clockInTime && (
                <p className="text-xs text-blue-600 font-medium mt-1.5">
                  Selected: {clockInTime} {clockInAMPM}
                </p>
              )}
            </div>

            {/* Clock Out */}
            <div>
              <label className={labelCls}>
                Clock Out Time{" "}
                <span className="text-gray-300 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={clockOutTime}
                  onChange={(e) => setClockOutTime(e.target.value)}
                  className={cn(inputCls(), "flex-1")}
                  disabled={isSubmitting}
                />
                <AMPMToggle
                  value={clockOutAMPM}
                  onChange={setClockOutAMPM}
                  disabled={isSubmitting}
                />
              </div>
              {clockOutTime && (
                <p className="text-xs text-blue-600 font-medium mt-1.5">
                  Selected: {clockOutTime} {clockOutAMPM}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>
                Notes{" "}
                <span className="text-gray-300 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                value={clockInNotes}
                onChange={(e) => setClockInNotes(e.target.value)}
                rows={3}
                className={cn(inputCls(), "resize-none")}
                placeholder="Add any notes..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Tip */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Tip:</span> Leave clock out time
              empty if the worker is starting their shift now. You can clock
              them out later.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl flex gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 border-gray-200 h-10 rounded-xl font-semibold text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedStaffId || !clockInTime}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl font-semibold text-sm shadow-sm disabled:opacity-50"
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
