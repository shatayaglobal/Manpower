"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  MapPin,
  Briefcase,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Timer,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWorkforce } from "@/lib/redux/use-workforce";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatTime(isoOrTimeString: string) {
  // Handles both "HH:MM:SS" time strings and full ISO datetime strings
  const date = isoOrTimeString.includes("T")
    ? new Date(isoOrTimeString)
    : new Date(`1970-01-01T${isoOrTimeString}`);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatHours(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ClockPage() {
  const {
    todayHoursCard,
    myHoursCards,
    myShifts,
    hoursLoading,
    loadMyHoursCards,
    loadMyShifts,
    clockIn,
    clockOut,
  } = useWorkforce();

  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load worker data on mount
  useEffect(() => {
    loadMyHoursCards();
    loadMyShifts();
  }, [loadMyHoursCards, loadMyShifts]);

  // Live clock — ticks every second
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Session elapsed timer — runs while clocked in
  useEffect(() => {
    if (!todayHoursCard || todayHoursCard.clock_out) {
      setElapsed(0);
      return;
    }
    const clockInDatetime = todayHoursCard.clock_in_datetime ?? null;
    if (!clockInDatetime) return;

    const clockInMs = new Date(clockInDatetime).getTime();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - clockInMs) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [todayHoursCard]);

  const isClockedIn = !!todayHoursCard && !todayHoursCard.clock_out;

  const handleClockAction = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isClockedIn && todayHoursCard) {
        const result = await clockOut(todayHoursCard.id);
        if ((result as { error?: string }).error) {
          toast.error("Failed to clock out");
        } else {
          toast.success("Clocked out successfully");
          loadMyHoursCards();
        }
      } else {
        const timezoneOffset = new Date().getTimezoneOffset();

        const getLocation = (): Promise<{
          latitude: number;
          longitude: number;
        } | null> =>
          new Promise((resolve) => {
            if (!navigator.geolocation) {
              resolve(null);
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) =>
                resolve({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                }),
              () => resolve(null),
              { timeout: 8000 }
            );
          });

        const location = await getLocation();
        if (!location) {
          toast.error(
            "Location access is required to clock in. Please allow location in your browser."
          );
          setIsLoading(false);
          return;
        }

        const result = await clockIn({
          timezone_offset: timezoneOffset,
          ...(location ?? {}),
        });
        if (
          (result as { error?: string }).error ||
          (result as { payload?: { error?: string } }).payload?.error
        ) {
          const errMsg =
            (result as { payload?: { error?: string } }).payload?.error ||
            (result as { error?: string }).error ||
            "Failed to clock in";
          toast.error(errMsg);
        } else {
          toast.success("Clocked in successfully");
          loadMyHoursCards();
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isClockedIn, todayHoursCard, clockIn, clockOut, loadMyHoursCards]);

  const today = new Date().toISOString().split("T")[0];
  const todayRecords = myHoursCards.filter((c) => c.date === today);
  const todayCompletedHours = todayRecords
    .filter((r) => r.clock_out)
    .reduce((sum, r) => sum + (r.total_hours_decimal ?? 0), 0);

  const todayDayName = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const currentShift =
    myShifts.find((s) => s.day_of_week === todayDayName) ?? null;

  const dayOfWeek = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const dateStr = currentTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const clockInDisplayTime = todayHoursCard?.clock_in_datetime
    ? formatTime(todayHoursCard.clock_in_datetime)
    : todayHoursCard?.clock_in
    ? formatTime(todayHoursCard.clock_in)
    : null;

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* ── Page header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Clock In / Out</h1>
          <p className="text-base text-gray-400 mt-0.5">
            Track your work hours for today
          </p>
        </div>

        {/* ── Main clock card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between gap-6">
            {/* Left — time + status */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                {dayOfWeek}, {dateStr}
              </p>
              <p className="text-3xl font-bold tabular-nums tracking-tight text-gray-900">
                {timeStr}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {/* Clock-in status */}
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-base font-semibold border",
                    isClockedIn
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  )}
                >
                  {isClockedIn ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Clocked in
                      {clockInDisplayTime ? ` at ${clockInDisplayTime}` : ""}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Not clocked in
                    </>
                  )}
                </div>

                {/* Session timer */}
                {isClockedIn && (
                  <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                    <Timer className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-base text-gray-500 font-semibold">
                      Session
                    </span>
                    <span className="text-base text-gray-900 font-bold tabular-nums">
                      {formatDuration(elapsed)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right — clock button */}
            <button
              onClick={handleClockAction}
              disabled={isLoading || hoursLoading}
              className={cn(
                "w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed border-2 shrink-0",
                isClockedIn
                  ? "bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm"
                  : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isClockedIn ? (
                <>
                  <LogOut className="w-6 h-6" />
                  <span>Clock Out</span>
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  <span>Clock In</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-blue-100 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <p className="text-base font-bold text-gray-400 uppercase tracking-widest">
                Today&apos;s Hours
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatHours(
                todayCompletedHours + (isClockedIn ? elapsed / 3600 : 0)
              )}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-base font-bold text-gray-400 uppercase tracking-widest">
                Sessions
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {todayRecords.length}
            </p>
          </div>
        </div>

        {/* ── Current shift ── */}
        {currentShift && (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-bold text-gray-500 uppercase tracking-widest">
                Today&apos;s Shift
              </span>
            </div>
            <div className="space-y-0 divide-y divide-gray-50">
              <div className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-base text-gray-400">Shift</p>
                  <p className="text-base font-semibold text-gray-900">
                    {currentShift.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-base text-gray-400">Scheduled hours</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatTime(currentShift.start_time)} –{" "}
                    {formatTime(currentShift.end_time)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Today's log ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-gray-500 uppercase tracking-widest">
              Today&apos;s Log
            </span>
          </div>

          {hoursLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : todayRecords.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-base text-gray-400">
                No sessions recorded yet today.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayRecords.map((record, i) => {
                const isActive =
                  !record.clock_out && !record.clock_out_datetime;
                const clockInTime = record.clock_in_datetime
                  ? formatTime(record.clock_in_datetime)
                  : record.clock_in
                  ? formatTime(record.clock_in)
                  : "—";
                const clockOutTime = record.clock_out_datetime
                  ? formatTime(record.clock_out_datetime)
                  : record.clock_out
                  ? formatTime(record.clock_out)
                  : null;

                return (
                  <div
                    key={record.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border",
                      isActive
                        ? "bg-blue-50 border-blue-100"
                        : "bg-gray-50 border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-base font-bold",
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-white border border-gray-200 text-gray-500"
                        )}
                      >
                        {i + 1}
                      </span>
                      <p
                        className={cn(
                          "text-base font-semibold",
                          isActive ? "text-blue-900" : "text-gray-900"
                        )}
                      >
                        {clockInTime} – {clockOutTime ?? "now"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-base font-bold tabular-nums",
                        isActive ? "text-blue-700" : "text-gray-700"
                      )}
                    >
                      {isActive
                        ? formatDuration(elapsed)
                        : formatHours(record.total_hours_decimal ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
