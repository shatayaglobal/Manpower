"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, Coffee } from "lucide-react";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { cn } from "@/lib/utils";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const SHIFT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  MORNING: {
    label: "Morning",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  AFTERNOON: {
    label: "Afternoon",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  EVENING: {
    label: "Evening",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  NIGHT: { label: "Night", color: "bg-blue-50 text-blue-700 border-blue-200" },
  FULL_DAY: {
    label: "Full Day",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

function formatTime(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDuration(start: string, end: string) {
  return (
    (new Date(`2000-01-01T${end}`).getTime() -
      new Date(`2000-01-01T${start}`).getTime()) /
    (1000 * 60 * 60)
  ).toFixed(1);
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-24" />
  );
}

function DaySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-11 bg-gray-50 border-b border-gray-100" />
      <div className="p-5 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  );
}

export default function MyShiftsPage() {
  const { myShifts, loadMyShifts } = useWorkforce();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyShifts().finally(() => setLoading(false));
  }, [loadMyShifts]);

  const getShiftsByDay = (day: string) =>
    myShifts.filter((s) => s.day_of_week === day);

  const activeDays = DAYS.filter((d) => getShiftsByDay(d).length > 0).length;
  const avgHours =
    myShifts.length > 0
      ? (
          myShifts.reduce(
            (sum, s) => sum + parseFloat(getDuration(s.start_time, s.end_time)),
            0
          ) / myShifts.length
        ).toFixed(1)
      : "0";

  // Today's day name for highlighting
  const todayName = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">My Shifts</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your weekly schedule</p>
        </div>

        {/* ── Stats row ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Total Shifts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {myShifts.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-blue-100 p-5">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">
                Active Days
              </p>
              <p className="text-2xl font-bold text-blue-700">{activeDays}</p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-5">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">
                Avg Hours / Day
              </p>
              <p className="text-2xl font-bold text-emerald-700">
                {avgHours}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  hrs
                </span>
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-violet-100 p-5">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-1">
                Days Off
              </p>
              <p className="text-2xl font-bold text-violet-700">
                {7 - activeDays}
              </p>
            </div>
          </div>
        )}

        {/* ── Weekly schedule ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <DaySkeleton key={i} />
            ))}
          </div>
        ) : myShifts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No shifts scheduled
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Your shift schedule will appear here once assigned by your
              employer.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS.map((day) => {
              const dayShifts = getShiftsByDay(day);
              const isToday = day === todayName;
              const hasShifts = dayShifts.length > 0;

              return (
                <div
                  key={day}
                  className={cn(
                    "bg-white rounded-2xl border overflow-hidden transition-all",
                    isToday
                      ? "border-blue-200 shadow-sm shadow-blue-50"
                      : "border-gray-100",
                    !hasShifts && "opacity-60"
                  )}
                >
                  {/* Day header */}
                  <div
                    className={cn(
                      "px-5 py-3 flex items-center justify-between border-b",
                      isToday
                        ? "bg-blue-50 border-blue-100"
                        : "bg-gray-50/60 border-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          "text-sm font-semibold capitalize",
                          isToday ? "text-blue-700" : "text-gray-700"
                        )}
                      >
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </h3>
                      {isToday && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {hasShifts
                        ? `${dayShifts.length} shift${
                            dayShifts.length > 1 ? "s" : ""
                          }`
                        : "Day off"}
                    </span>
                  </div>

                  {/* Shifts */}
                  {!hasShifts ? (
                    <div className="px-5 py-4 text-center text-xs text-gray-400">
                      No shifts scheduled
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {dayShifts.map((shift) => {
                        const typeConfig = SHIFT_TYPE_CONFIG[
                          shift.shift_type
                        ] ?? {
                          label: shift.shift_type,
                          color: "bg-gray-50 text-gray-600 border-gray-200",
                        };
                        const duration = getDuration(
                          shift.start_time,
                          shift.end_time
                        );

                        return (
                          <div
                            key={shift.id}
                            className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              {/* Time block */}
                              <div
                                className={cn(
                                  "shrink-0 text-center px-3 py-2 rounded-xl border min-w-[90px]",
                                  typeConfig.color
                                )}
                              >
                                <p className="text-xs font-bold">
                                  {formatTime(shift.start_time)}
                                </p>
                                <p className="text-xs opacity-70 mt-0.5">
                                  {formatTime(shift.end_time)}
                                </p>
                              </div>

                              {/* Info */}
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {shift.name}
                                  </p>
                                  <span
                                    className={cn(
                                      "text-xs font-medium px-2 py-0.5 rounded-full border",
                                      typeConfig.color
                                    )}
                                  >
                                    {typeConfig.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {duration}h duration
                                  </span>
                                  {shift.break_duration && (
                                    <span className="flex items-center gap-1">
                                      <Coffee className="w-3 h-3" />
                                      Break: {shift.break_duration}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
