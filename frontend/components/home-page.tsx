"use client";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Building2,
  Sparkles,
  ChevronRight,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/redux/redux";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Users,
    title: "Talent Management",
    description: "Connect with qualified professionals through smart matching.",
    accent: "bg-blue-50 text-blue-600 border-blue-100",
    iconBg: "bg-blue-600",
    benefits: [
      "Skills-based filtering",
      "Real-time availability",
      "Smart candidate matching",
    ],
  },
  {
    icon: Briefcase,
    title: "Job Placement",
    description:
      "Seamless recruitment that connects the right talent to every role.",
    accent: "bg-amber-50 text-amber-700 border-amber-100",
    iconBg: "bg-amber-500",
    benefits: [
      "Instant job posting",
      "Automated screening",
      "Quick placements",
    ],
  },
  {
    icon: Calendar,
    title: "Shift Scheduling",
    description: "Intelligent scheduling with automated conflict resolution.",
    accent: "bg-violet-50 text-violet-700 border-violet-100",
    iconBg: "bg-violet-600",
    benefits: [
      "Drag-and-drop scheduling",
      "Automated notifications",
      "Time tracking",
    ],
  },
  {
    icon: TrendingUp,
    title: "Analytics & Reports",
    description: "Comprehensive workforce insights with real-time dashboards.",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    iconBg: "bg-emerald-600",
    benefits: ["Performance metrics", "Custom reports", "Predictive insights"],
  },
];

const industries = [
  { name: "Construction", icon: Building2 },
  { name: "Hospitality", icon: Users },
  { name: "Logistics", icon: TrendingUp },
  { name: "Security", icon: CheckCircle2 },
  { name: "Cleaning", icon: Sparkles },
];

const jobs = [
  {
    title: "Construction Workers",
    company: "Multiple construction sites",
    location: "Kampala & Entebbe",
    type: "Full-time",
    salary: "UGX 800K – 1.5M",
    posted: "2 days ago",
    tag: "Urgent",
    tagColor: "bg-red-50 text-red-700 border-red-200",
  },
  {
    title: "Hotel Staff",
    company: "5-star hotels & resorts",
    location: "Kampala",
    type: "Full-time",
    salary: "UGX 600K – 1.2M",
    posted: "3 days ago",
    tag: "Immediate Start",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    title: "Warehouse Operators",
    company: "Logistics companies",
    location: "Industrial Area",
    type: "Shifts",
    salary: "UGX 700K – 1M",
    posted: "1 week ago",
    tag: "Night Shift",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

const stats = [
  { value: "15K+", label: "Active Workers", color: "text-blue-600" },
  { value: "500+", label: "Partner Companies", color: "text-amber-500" },
  { value: "75K+", label: "Placements Made", color: "text-blue-600" },
  { value: "98%", label: "Satisfaction Rate", color: "text-emerald-600" },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthState();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
                  Trusted Manpower Platform
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
                Connect Top Talent
                <br />
                with <span className="text-blue-600">Great Opportunities</span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
                The fastest way to hire skilled workers or find your next job.
                Trusted by thousands of businesses and professionals across
                Israel.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                {isAuthenticated && user ? (
                  <>
                    {user.account_type === "WORKER" ? (
                      <Button
                        onClick={() => router.push("/jobs")}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 rounded-xl font-semibold text-sm shadow-sm"
                      >
                        Browse Available Jobs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push("/jobs/create")}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 rounded-xl font-semibold text-sm shadow-sm"
                      >
                        Post a Job Opening
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => router.push("/profile")}
                      className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 h-11 px-6 rounded-xl font-semibold text-sm"
                    >
                      View My Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push("/signup")}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 rounded-xl font-semibold text-sm shadow-sm"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/login")}
                      className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 h-11 px-6 rounded-xl font-semibold text-sm"
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right — trust stat cards (dashboard-style) */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Active Workers",
                  value: "15,000+",
                  border: "border-blue-100",
                  text: "text-blue-600",
                  icon: <Users className="w-4 h-4 text-blue-600" />,
                  bg: "bg-blue-50",
                },
                {
                  label: "Partner Companies",
                  value: "500+",
                  border: "border-amber-100",
                  text: "text-amber-600",
                  icon: <Building2 className="w-4 h-4 text-amber-600" />,
                  bg: "bg-amber-50",
                },
                {
                  label: "Successful Placements",
                  value: "75,000+",
                  border: "border-emerald-100",
                  text: "text-emerald-700",
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                  bg: "bg-emerald-50",
                },
                {
                  label: "Satisfaction Rate",
                  value: "98%",
                  border: "border-violet-100",
                  text: "text-violet-700",
                  icon: <Award className="w-4 h-4 text-violet-600" />,
                  bg: "bg-violet-50",
                },
              ].map(({ label, value, border, text, icon, bg }) => (
                <div
                  key={label}
                  className={cn(
                    "bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4",
                    border
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      bg
                    )}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className={cn("text-2xl font-bold", text)}>{value}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Platform
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              Everything You Need to Manage Your Workforce
            </h2>
            <p className="text-gray-500 max-w-xl">
              Powerful tools designed to streamline hiring, scheduling, and
              workforce management.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 group cursor-pointer"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform",
                    f.iconBg
                  )}
                >
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  {f.description}
                </p>
                <ul className="space-y-2">
                  {f.benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-xs text-gray-500"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  Learn more{" "}
                  <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ────────────────────────────────────────────────────── */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-extrabold text-white mb-1">
                  {value}
                </p>
                <p className="text-blue-200 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ────────────────────────────────────────────────────── */}
      {/* ── INDUSTRIES ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Industries
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              Serving Multiple Sectors
            </h2>
            <p className="text-gray-500 max-w-xl">
              We place skilled workers across industries where reliable talent
              makes the real difference — keeping operations running every day.
            </p>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {[
              {
                name: "Construction",
                description:
                  "From site labourers to project managers, we connect construction firms with workers who are trained, safety-certified, and ready to deploy at short notice.",
              },
              {
                name: "Hospitality",
                description:
                  "Hotels, resorts, and restaurants rely on us to staff housekeeping, front-of-house, kitchen, and event teams — consistently and on time.",
              },
              {
                name: "Logistics & Warehousing",
                description:
                  "We supply forklift operators, pickers, packers, and delivery drivers to logistics companies that need flexible, shift-ready talent.",
              },
              {
                name: "Security Services",
                description:
                  "Licensed and vetted security personnel for commercial sites, events, and residential properties — available around the clock.",
              },
              {
                name: "Cleaning & Facilities",
                description:
                  "Professional cleaners and facilities staff for offices, healthcare centres, and commercial spaces, placed on permanent or contract terms.",
              },
            ].map(({ name, description }) => (
              <div
                key={name}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-gray-50 px-6 py-5 transition-colors group cursor-default"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {name}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                    {description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
                Opportunities
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Featured Jobs
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/jobs")}
              className="border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600 h-9 px-4 rounded-xl text-sm font-semibold"
            >
              View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job.title}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 cursor-pointer group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full border",
                      job.tagColor
                    )}
                  >
                    {job.tag}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-700 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-blue-600 font-medium mb-4">
                  {job.company}
                </p>

                <div className="space-y-2 mb-5 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {job.type}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-700">
                    {job.salary}
                  </span>
                  <span className="text-xs text-gray-400">{job.posted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="pb-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Get Started
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              Ready to Join the Platform?
            </h2>
            <p className="text-gray-500">Choose your path and start today.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Employers */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:border-blue-200 transition-all group">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">For Employers</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Find qualified workers and manage your team efficiently with
                smart tools built for growth.
              </p>
              <Button
                onClick={() => router.push("/signup")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl font-semibold text-sm"
              >
                Post a Job
              </Button>
            </div>

            {/* Job Seekers */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:border-amber-200 transition-all group">
              <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center mb-5">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">For Job Seekers</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Browse opportunities that match your skills and start your
                career journey today.
              </p>
              <Button
                onClick={() => router.push("/signup")}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white h-10 rounded-xl font-semibold text-sm"
              >
                Find Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
