"use client";

import React, { useEffect } from "react";
import { Calendar, Clock, Coffee, Loader2 } from "lucide-react";
import { useWorkforce } from "@/lib/redux/use-workforce";

const MyShiftsPage = () => {
  const { myShifts, loadMyShifts } = useWorkforce();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    loadMyShifts().finally(() => setLoading(false));
  }, [loadMyShifts]);

  const daysOfWeek = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const getShiftsByDay = (day: string) => {
    return myShifts.filter((shift) => shift.day_of_week === day);
  };

  const getShiftTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MORNING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      AFTERNOON: "bg-orange-100 text-orange-800 border-orange-200",
      EVENING: "bg-purple-100 text-purple-800 border-purple-200",
      NIGHT: "bg-blue-100 text-blue-800 border-blue-200",
      FULL_DAY: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-2 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            My Shifts
          </h1>
          <p className="text-gray-600 mt-2">Your weekly schedule</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Shifts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-base text-gray-600">Total Shifts</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {myShifts.length}
            </p>
          </div>

          {/* Card 2: This Week */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-base text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {
                daysOfWeek.filter((day) => getShiftsByDay(day).length > 0)
                  .length
              }
            </p>
          </div>

          {/* Card 3: Avg Hours/Day */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-base text-gray-600">Avg Hours/Day</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {myShifts.length > 0
                ? (
                    myShifts.reduce((sum, shift) => {
                      const start = new Date(`2000-01-01T${shift.start_time}`);
                      const end = new Date(`2000-01-01T${shift.end_time}`);
                      return (
                        sum +
                        (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                      );
                    }, 0) / myShifts.length
                  ).toFixed(1)
                : "0"}
              h
            </p>
          </div>

          {/* Card 4: Active Days */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-base text-gray-600">Active Days</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {
                daysOfWeek.filter((day) => getShiftsByDay(day).length > 0)
                  .length
              }
            </p>
          </div>
        </div>

        {/* Weekly Schedule */}
        {myShifts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No shifts scheduled
            </h3>
            <p className="text-gray-600">
              Your shift schedule will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {daysOfWeek.map((day) => {
              const dayShifts = getShiftsByDay(day);

              return (
                <div
                  key={day}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {day.toLowerCase()}
                    </h3>
                  </div>

                  {dayShifts.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No shifts scheduled
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {shift.name}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getShiftTypeColor(
                                    shift.shift_type
                                  )}`}
                                >
                                  {shift.shift_type.replace("_", " ")}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {formatTime(shift.start_time)} -{" "}
                                    {formatTime(shift.end_time)}
                                  </span>
                                </div>

                                {shift.break_duration && (
                                  <div className="flex items-center gap-1">
                                    <Coffee className="w-4 h-4" />
                                    <span>Break: {shift.break_duration}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Duration:</span>
                                  <span>
                                    {(
                                      (new Date(
                                        `2000-01-01T${shift.end_time}`
                                      ).getTime() -
                                        new Date(
                                          `2000-01-01T${shift.start_time}`
                                        ).getTime()) /
                                      (1000 * 60 * 60)
                                    ).toFixed(1)}
                                    h
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
};

export default MyShiftsPage;
