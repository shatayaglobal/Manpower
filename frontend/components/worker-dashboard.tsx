"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  MapPin,
  CalendarDays,
  Loader2,
  AlertCircle,
  LogIn,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { useAuthState } from "@/lib/redux/redux";
import { toast } from "sonner";

interface Location {
  latitude: number;
  longitude: number;
}

interface ClockInPayload {
  latitude: number;
  longitude: number;
  timezone_offset: number;
}

interface ClockInError {
  error?: string;
  distance?: number;
  required_distance?: number;
}

export default function WorkerDashboardPage() {
  const { user } = useAuthState();
  const {
    myShifts,
    myHoursCards,
    todayHoursCard,
    loadMyShifts,
    loadMyHoursCards,
    clockIn,
    clockOut,
  } = useWorkforce();

  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadMyShifts();
    loadMyHoursCards();
  }, [loadMyShifts, loadMyHoursCards]);

  const isClockedIn =
    todayHoursCard !== null && todayHoursCard.clock_out === null;

  const formatTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCurrentLocation = async (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = "Geolocation not supported";
        setLocationError(msg);
        reject(new Error(msg));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setLocationReady(true);
          setLocationError(null);
          resolve(loc);
        },
        (err) => {
          const msg =
            err.code === 1
              ? "Location access denied. Please allow location."
              : "Unable to get location. Try again.";
          setLocationError(msg);
          setLocationReady(false);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleClockIn = async () => {
    if (isClockedIn) return toast.error("Already clocked in");

    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      const payload: ClockInPayload = {
        latitude: Number(loc.latitude.toFixed(6)),
        longitude: Number(loc.longitude.toFixed(6)),
        timezone_offset: -new Date().getTimezoneOffset(),
      };

      const result = await clockIn(payload);

      if ("payload" in result && result.type.endsWith("/rejected")) {
        const err = result.payload as ClockInError;
        if (err.distance && err.required_distance) {
          toast.error("Too far from workplace", {
            description: `You are ${Math.round(err.distance)}m away (max ${
              err.required_distance
            }m)`,
          });
        } else {
          toast.error(err.error || "Clock-in failed");
        }
      } else {
        toast.success("Clocked in successfully!");
        await loadMyHoursCards();
      }
    } catch {
      toast.error("Location required");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!todayHoursCard?.id) return;
    setLoading(true);
    try {
      await clockOut(todayHoursCard.id);
      toast.success("Clocked out successfully!");
      await loadMyHoursCards();
    } catch {
      toast.error("Clock-out failed");
    } finally {
      setLoading(false);
    }
  };

  type StatusType = "PENDING" | "SIGNED" | "APPROVED" | "REJECTED";

  const getStatusBadge = (status: StatusType | string) => {
    const map: Record<
      StatusType,
      {
        label: string;
        variant: "default" | "secondary" | "outline" | "destructive";
      }
    > = {
      PENDING: { label: "Pending", variant: "secondary" },
      SIGNED: { label: "Signed", variant: "outline" },
      APPROVED: { label: "Approved", variant: "default" },
      REJECTED: { label: "Rejected", variant: "destructive" },
    };

    const config = map[status as StatusType] ?? map.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="text-center sm:text-left mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-4xl font-mono text-gray-800 mt-3 font-medium">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Clock Card – Clean & Professional */}
          <Card className="lg:col-span-2 shadow-sm border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Clock className="w-7 h-7 text-gray-700" />
                  Time Clock
                </CardTitle>
                {isClockedIn ? (
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                ) : (
                  <Clock className="w-9 h-9 text-gray-400" />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Location Status */}
              {locationError && (
                <Alert variant="destructive" className="py-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between text-sm">
                    <span>{locationError}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={getCurrentLocation}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {locationReady && !locationError && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Location ready
                </div>
              )}

              {/* Clocked-in Info */}
              {isClockedIn && todayHoursCard && (
                <div className="text-center py-6 bg-gray-100 rounded-xl">
                  <p className="text-sm text-gray-600">Clocked in at</p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">
                    {formatTime(
                      todayHoursCard.clock_in_datetime ||
                        todayHoursCard.clock_in
                    )}
                  </p>
                  {todayHoursCard.clock_in_distance_meters != null && (
                    <p className="text-sm text-gray-600 mt-2">
                      {Math.round(todayHoursCard.clock_in_distance_meters)}m
                      from site
                    </p>
                  )}
                </div>
              )}

              {/* Smaller, Beautifully Centered Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={isClockedIn ? handleClockOut : handleClockIn}
                  disabled={loading}
                  size="lg"
                  className={`w-full max-w-xs h-10 text-lg font-medium rounded-xl shadow-md transition-all hover:shadow-lg ${
                    isClockedIn
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isClockedIn ? (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Clock Out
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Clock In
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Shifts */}
          <Card className="shadow-sm border h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="w-6 h-6" />
                Today&apos;s Shifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myShifts.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  No shifts today
                </p>
              ) : (
                <div className="space-y-4">
                  {myShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <p className="font-semibold">{shift.name}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {shift.start_time} – {shift.end_time}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {shift.shift_type.replace(/_/g, " ").toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Hours */}
        <Card className="mt-8 shadow-sm border">
          <CardHeader>
            <CardTitle>Recent Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {myHoursCards.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                No recorded hours yet
              </p>
            ) : (
              <div className="space-y-4">
                {myHoursCards.slice(0, 6).map((card) => (
                  <div
                    key={card.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(card.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatTime(card.clock_in_datetime || card.clock_in)}
                        {card.clock_out_datetime
                          ? ` – ${formatTime(card.clock_out_datetime)}`
                          : " → Active"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-3 sm:mt-0">
                      {card.total_hours_decimal != null && (
                        <span className="text-xl font-semibold text-gray-900">
                          {card.total_hours_decimal.toFixed(2)}h
                        </span>
                      )}
                      {getStatusBadge(card.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
