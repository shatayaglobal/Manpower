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
  Briefcase,
  ArrowRight,
  UserCircle,
  ChevronRight,
  Building2,
  DollarSign,
  Bell,
  TrendingUp,
  Zap,
  Send,
  Trophy,
  Timer,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWorkforce } from "@/lib/redux/use-workforce";
import { useAuthState } from "@/lib/redux/redux";
import { usePosts } from "@/lib/redux/usePosts";
import { useProfile } from "@/lib/redux/useProfile";
import { useApplications } from "@/lib/redux/use-applications";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PostListItem } from "@/lib/types";
import { LucideIcon } from "lucide-react";

interface Location {
  latitude: number;
  longitude: number;
}
interface ClockInError {
  error?: string;
  distance?: number;
  required_distance?: number;
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  LOW: { label: "Part-time", color: "bg-sky-50 text-sky-700 border-sky-200" },
  MEDIUM: {
    label: "Full-time",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  HIGH: {
    label: "Contract",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  URGENT: {
    label: "Temporary",
    color: "bg-red-50 text-red-700 border-red-200",
  },
};

const APPLICATION_STATUS: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  REVIEWED: {
    label: "Reviewed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Eye,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

function formatDate(dateString: string) {
  const diffHours = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60)
  );
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Just posted";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function formatAppDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

// ── How It Works ──────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Complete Profile",
    description:
      "Add your skills, experience, and upload your CV to stand out.",
    icon: UserCircle,
    bg: "bg-blue-600",
  },
  {
    step: "02",
    title: "Browse & Apply",
    description: "Find jobs that match your skills and apply with one click.",
    icon: Send,
    bg: "bg-violet-600",
  },
  {
    step: "03",
    title: "Get Hired",
    description: "Accept an employer's invitation and confirm your start date.",
    icon: Trophy,
    bg: "bg-amber-500",
  },
  {
    step: "04",
    title: "Clock In",
    description:
      "Track your hours and manage shifts right from this dashboard.",
    icon: Timer,
    bg: "bg-emerald-600",
  },
];

// ── Welcome Banner (incomplete profile only) ──────────────────────────────────
function WelcomeBanner({ firstName }: { firstName: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white mb-6">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1e40af 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-violet-500 to-indigo-600 rounded-l-2xl" />
      <div className="relative px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              New account
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Welcome{firstName ? `, ${firstName}` : ""}! 👋
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-base max-w-lg leading-relaxed">
            Let&apos;s get your profile set up so employers can find you. It
            only takes a few minutes.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            <Link href="/profile">
              Complete Profile <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-gray-400">Takes about 5 minutes</p>
        </div>
      </div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-base font-semibold text-gray-900 whitespace-nowrap">
          Get started in 4 steps
        </h2>
        <div className="h-px flex-1 bg-gray-100" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {HOW_IT_WORKS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              {idx < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-7 -right-2.5 z-10">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0",
                    item.bg
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-300 mt-2">
                  {item.step}
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Dashboard Job Card ────────────────────────────────────────────────────────
function DashboardJobCard({ job }: { job: PostListItem }) {
  const priorityStyle = PRIORITY_MAP[job.priority] ?? PRIORITY_MAP.LOW;
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="group p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 h-full cursor-pointer">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-blue-700 transition-colors">
                {job.title}
              </p>
              {job.priority === "URGENT" && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-1">
                  Urgent
                </span>
              )}
            </div>
            {job.location && (
              <div className="flex items-center gap-1 mt-0.5 text-gray-400 text-xs">
                <MapPin className="w-3 h-3 shrink-0" />
                {job.location}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full border",
                priorityStyle.color
              )}
            >
              {priorityStyle.label}
            </span>
            {job.salary_range && (
              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                <DollarSign className="w-3 h-3" />
                {job.salary_range}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(job.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
  const { posts: featuredJobs, loadPosts } = usePosts();
  const { profile, loadProfile } = useProfile();
  const { applications, loadUserApplications } = useApplications();

  const [clockLoading, setClockLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        loadMyShifts(),
        loadMyHoursCards(),
        loadProfile(),
        loadUserApplications(),
        loadPosts({ ordering: "-created_at", page: 1, post_type: "JOB" }),
      ]);
      setDataLoaded(true);
    };
    load();
  }, [
    loadMyShifts,
    loadMyHoursCards,
    loadProfile,
    loadUserApplications,
    loadPosts,
  ]);

  const profileIsIncomplete =
    !profile?.profession || !profile?.phone || !profile?.bio;
  const isClockedIn =
    todayHoursCard !== null && todayHoursCard.clock_out === null;
  const firstName = user?.first_name || user?.name?.split(" ")[0] || "";
  const dashboardJobs = featuredJobs.slice(0, 6);

  // Application status counts
  const appCounts = applications.reduce((acc, app) => {
    const s = (app.status || "PENDING").toUpperCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
          setLocationReady(true);
          setLocationError(null);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
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
    setClockLoading(true);
    try {
      const loc = await getCurrentLocation();
      const result = await clockIn({
        latitude: Number(loc.latitude.toFixed(6)),
        longitude: Number(loc.longitude.toFixed(6)),
        timezone_offset: -new Date().getTimezoneOffset(),
      });
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
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!todayHoursCard?.id) return;
    setClockLoading(true);
    try {
      await clockOut(todayHoursCard.id);
      toast.success("Clocked out!");
      await loadMyHoursCards();
    } catch {
      toast.error("Clock-out failed");
    } finally {
      setClockLoading(false);
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

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (!dataLoaded) {
    return (
      <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5 animate-pulse">
          <div className="h-28 bg-white rounded-2xl border border-gray-100" />
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="h-64 bg-white rounded-2xl border border-gray-100" />
            <div className="h-64 bg-white rounded-2xl border border-gray-100" />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="h-56 bg-white rounded-2xl border border-gray-100" />
            <div className="h-56 bg-white rounded-2xl border border-gray-100" />
          </div>
          <div className="h-48 bg-white rounded-2xl border border-gray-100" />
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW A — Profile incomplete
  // ════════════════════════════════════════════════════════════════════════════
  if (profileIsIncomplete) {
    return (
      <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <WelcomeBanner firstName={firstName} />

          <Card className="shadow-none border border-violet-100 bg-violet-50/40 mb-6">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Check your invitations
                  </p>
                  <p className="text-gray-500 text-xs">
                    Employers may have already reached out to you.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-violet-200 text-violet-700 hover:bg-violet-100 shrink-0"
              >
                <Link href="/invitations">View</Link>
              </Button>
            </CardContent>
          </Card>

          <HowItWorksSection />

          {dashboardJobs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Latest Jobs
                </h2>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 h-8 px-2"
                >
                  <Link
                    href="/jobs"
                    className="flex items-center gap-1 text-sm"
                  >
                    See all <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardJobs.map((job) => (
                  <DashboardJobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW B — Full working dashboard
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 -ml-4 -mt-5 min-h-screen -mr-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* ── Greeting bar — white card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello{firstName ? `, ${firstName}` : ""} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <p className="text-3xl font-mono font-semibold text-gray-800 tabular-nums shrink-0">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        {/* ── Row 1: Shifts + Clock — equal height ── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* TODAY'S SHIFTS */}
          <Card className="shadow-none border border-gray-100 flex flex-col">
            <CardHeader className="pb-3 pt-5 px-5 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-indigo-600" />
                  </div>
                  Today&apos;s Shifts
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 h-8 px-2 text-xs"
                >
                  <Link href="/my-shifts" className="flex items-center gap-1">
                    All shifts <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex-1 flex flex-col">
              {myShifts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <CalendarDays className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    No shifts scheduled today
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Your employer will assign shifts here
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 flex-1 content-start">
                  {myShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/40 rounded-xl border border-indigo-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm leading-tight">
                          {shift.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs shrink-0 ml-2"
                        >
                          {shift.shift_type.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-xl font-bold text-gray-900 font-mono">
                        {shift.start_time} – {shift.end_time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* TIME CLOCK */}
          <Card className="shadow-none border border-gray-100 flex flex-col">
            <CardHeader className="pb-3 pt-5 px-5 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      isClockedIn ? "bg-green-50" : "bg-gray-100"
                    )}
                  >
                    <Clock
                      className={cn(
                        "w-4 h-4",
                        isClockedIn ? "text-green-600" : "text-gray-500"
                      )}
                    />
                  </div>
                  Time Clock
                </CardTitle>
                {isClockedIn && (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                {locationError && (
                  <Alert variant="destructive" className="py-2.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <AlertDescription className="flex items-center justify-between text-xs">
                      <span>{locationError}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={getCurrentLocation}
                        className="ml-2 h-6 text-xs px-2 shrink-0"
                      >
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                {locationReady && !locationError && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Location confirmed
                  </div>
                )}
              </div>

              {/* Clock-in status display */}
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                {isClockedIn && todayHoursCard ? (
                  <div className="w-full py-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Clocked in at
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1 font-mono">
                      {formatTime(
                        todayHoursCard.clock_in_datetime ||
                          todayHoursCard.clock_in
                      )}
                    </p>
                    {todayHoursCard.clock_in_distance_meters != null && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {Math.round(todayHoursCard.clock_in_distance_meters)}m
                        from site
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full py-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Clock className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Not clocked in
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tap below to start your shift
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={isClockedIn ? handleClockOut : handleClockIn}
                disabled={clockLoading}
                className={cn(
                  "w-full h-11 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-sm",
                  isClockedIn
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {clockLoading ? (
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
            </CardContent>
          </Card>
        </div>

        {/* ── Row 2: Applications + Recent Hours — equal height ── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* MY APPLICATIONS */}
          <Card className="shadow-none border border-gray-100 flex flex-col">
            <CardHeader className="pb-3 pt-5 px-5 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-violet-600" />
                  </div>
                  My Applications
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 h-8 px-2 text-xs"
                >
                  <Link
                    href="/jobs/job-applications"
                    className="flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>

              {/* Status summary pills */}
              {applications.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-xs text-gray-400 self-center">
                    {applications.length} total
                  </span>
                  {Object.entries(appCounts).map(([status, count]) => {
                    const s =
                      APPLICATION_STATUS[status] ?? APPLICATION_STATUS.PENDING;
                    const Icon = s.icon;
                    return (
                      <span
                        key={status}
                        className={cn(
                          "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium",
                          s.color
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {count} {s.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </CardHeader>

            <CardContent className="px-5 pb-5 flex-1 flex flex-col">
              {applications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <Briefcase className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    No applications yet
                  </p>
                  <p className="text-gray-400 text-xs mt-1 mb-4">
                    Start applying to jobs to track them here
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {applications.slice(0, 5).map((app, idx) => {
                    const job =
                      typeof app.job === "object" && app.job !== null
                        ? app.job
                        : null;
                    const status = (app.status || "PENDING").toUpperCase();
                    const s =
                      APPLICATION_STATUS[status] ?? APPLICATION_STATUS.PENDING;
                    const Icon = s.icon;
                    return (
                      <div
                        key={app.id || `app-${idx}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {job?.title || "Job Title"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {job?.location && (
                                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                                  <MapPin className="w-3 h-3" />
                                  {job.location}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                {formatAppDate(app.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium shrink-0",
                            s.color
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* RECENT HOURS */}
          <Card className="shadow-none border border-gray-100 flex flex-col">
            <CardHeader className="pb-3 pt-5 px-5 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  Recent Hours
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 h-8 px-2 text-xs"
                >
                  <Link href="/my-hours" className="flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex-1 flex flex-col">
              {myHoursCards.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <Clock className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    No hours recorded yet
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Your hours will appear here after you clock in
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myHoursCards.slice(0, 5).map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {new Date(card.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatTime(card.clock_in_datetime || card.clock_in)}
                          {card.clock_out_datetime ? (
                            ` – ${formatTime(card.clock_out_datetime)}`
                          ) : (
                            <span className="text-green-600 font-medium">
                              {" "}
                              → Active
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        {card.total_hours_decimal != null && (
                          <span className="text-base font-bold text-gray-900">
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

        {/* ── Row 3: Jobs For You ── */}
        {dashboardJobs.length > 0 && (
          <Card className="shadow-none border border-gray-100">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  Jobs For You
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 h-8 px-2 text-xs"
                >
                  <Link href="/jobs" className="flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardJobs.map((job) => (
                  <DashboardJobCard key={job.id} job={job} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
