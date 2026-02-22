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
    description:
      "Find qualified professionals through skills-based matching. See who's available in real time and connect instantly — no back-and-forth.",
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
      "Post a role, set your requirements, and let the platform handle the heavy lifting — from screening to shortlisting.",
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
    description:
      "Drag, drop, and deploy. Build schedules in minutes with conflict resolution built in, then push notifications automatically.",
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
    description:
      "Understand your workforce at a glance. Track performance, costs, and placement success with live dashboards and custom exports.",
    iconBg: "bg-emerald-600",
    benefits: ["Performance metrics", "Custom reports", "Predictive insights"],
  },
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
  { value: "15K+", label: "Active Workers" },
  { value: "500+", label: "Partner Companies" },
  { value: "75K+", label: "Placements Made" },
  { value: "98%", label: "Satisfaction Rate" },
];

const industries = [
  {
    name: "Construction",
    description:
      "From site labourers to project managers, we connect construction firms with workers who are trained, safety-certified, and ready to deploy at short notice. Whether you need a crew of five or fifty, we move quickly.",
  },
  {
    name: "Hospitality",
    description:
      "Hotels, resorts, and restaurants rely on us to staff housekeeping, front-of-house, kitchen, and event teams — consistently and on time. We understand the seasonal pressures and staff accordingly.",
  },
  {
    name: "Logistics & Warehousing",
    description:
      "We supply forklift operators, pickers, packers, and delivery drivers to logistics companies that need flexible, shift-ready talent. Our workers are vetted and available on short-lead requests.",
  },
  {
    name: "Security Services",
    description:
      "Licensed and vetted security personnel for commercial sites, events, and residential properties. Our guards are trained, uniformed, and available around the clock — day shifts, night shifts, and weekends.",
  },
  {
    name: "Cleaning & Facilities",
    description:
      "Professional cleaners and facilities staff for offices, healthcare centres, and commercial spaces. We handle both permanent placements and short-term contract cover so your operations never skip a beat.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthState();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">
                  Trusted Manpower Platform
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
                Connect Top Talent
                <br />
                with <span className="text-blue-600">Great Opportunities</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-lg">
                The fastest way to hire skilled workers or find your next job.
                We handle the matching, screening, and scheduling — so you can
                focus on the work that matters. Trusted by thousands of
                businesses and professionals across Uganda.
              </p>

              <div className="flex flex-wrap gap-3">
                {isAuthenticated && user ? (
                  <>
                    {user.account_type === "WORKER" ? (
                      <Button
                        onClick={() => router.push("/jobs")}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl font-semibold text-base shadow-sm"
                      >
                        Browse Available Jobs
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push("/jobs/create")}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl font-semibold text-base shadow-sm"
                      >
                        Post a Job Opening
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => router.push("/profile")}
                      className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 h-12 px-7 rounded-xl font-semibold text-base"
                    >
                      View My Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push("/signup")}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl font-semibold text-base shadow-sm"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/login")}
                      className="border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 h-12 px-7 rounded-xl font-semibold text-base"
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Active Workers",
                  value: "15,000+",
                  border: "border-blue-100",
                  text: "text-blue-600",
                  icon: <Users className="w-5 h-5 text-blue-600" />,
                  bg: "bg-blue-50",
                },
                {
                  label: "Partner Companies",
                  value: "500+",
                  border: "border-amber-100",
                  text: "text-amber-600",
                  icon: <Building2 className="w-5 h-5 text-amber-600" />,
                  bg: "bg-amber-50",
                },
                {
                  label: "Successful Placements",
                  value: "75,000+",
                  border: "border-emerald-100",
                  text: "text-emerald-700",
                  icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
                  bg: "bg-emerald-50",
                },
                {
                  label: "Satisfaction Rate",
                  value: "98%",
                  border: "border-violet-100",
                  text: "text-violet-700",
                  icon: <Award className="w-5 h-5 text-violet-600" />,
                  bg: "bg-violet-50",
                },
              ].map(({ label, value, border, text, icon, bg }) => (
                <div
                  key={label}
                  className={cn(
                    "bg-white rounded-2xl border p-6 flex flex-col justify-between gap-6",
                    border
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center",
                      bg
                    )}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className={cn("text-3xl font-bold", text)}>{value}</p>
                    <p className="text-base text-gray-500 font-medium mt-1">
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
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Platform
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything You Need to Manage Your Workforce
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Built for hiring managers and HR teams who don&apos;t have time to
              waste. From posting a role to scheduling shifts, the tools are
              fast, intuitive, and designed around how real teams work.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 group cursor-pointer flex flex-col"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform",
                    f.iconBg
                  )}
                >
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  {f.title}
                </h3>
                <p className="text-base text-gray-500 leading-relaxed mb-5 flex-1">
                  {f.description}
                </p>
                <ul className="space-y-2.5 mb-5">
                  {f.benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-sm text-gray-500"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 mt-auto">
                  Learn more{" "}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
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
                <p className="text-5xl font-extrabold text-white mb-2">
                  {value}
                </p>
                <p className="text-blue-200 text-base font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Industries
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
              Serving Multiple Sectors
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Every industry has its own pace, pressures, and people requirements.
              We&apos;ve built deep expertise in the sectors where getting the right
              person on site — fast — makes all the difference.
            </p>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {industries.map(({ name, description }) => (
              <div
                key={name}
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 bg-white hover:bg-gray-50 px-6 py-7 transition-colors group cursor-default"
              >
                <div className="sm:w-52 shrink-0">
                  <p className="font-semibold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                    {name}
                  </p>
                </div>
                <p className="text-base text-gray-500 leading-relaxed flex-1 max-w-2xl">
                  {description}
                </p>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all hidden sm:block mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ─────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
                Opportunities
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                Featured Jobs
              </h2>
              <p className="text-lg text-gray-500">
                A sample of what&apos;s currently open on the platform.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/jobs")}
              className="border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600 h-10 px-5 rounded-xl text-base font-semibold"
            >
              View All <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 cursor-pointer group flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold px-3 py-1.5 rounded-full border",
                      job.tagColor
                    )}
                  >
                    {job.tag}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-xl mb-1.5 group-hover:text-blue-700 transition-colors">
                  {job.title}
                </h3>
                <p className="text-base text-blue-600 font-medium mb-5">
                  {job.company}
                </p>

                <div className="space-y-2.5 mb-5 mt-auto">
                  <div className="flex items-center gap-2 text-base text-gray-400">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-base text-gray-400">
                    <Clock className="w-4 h-4 shrink-0" />
                    {job.type}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-700">
                    {job.salary}
                  </span>
                  <span className="text-base text-gray-400">{job.posted}</span>
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
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              Get Started
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              Ready to Join the Platform?
            </h2>
            <p className="text-lg text-gray-500">Choose your path and start today.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Employers */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-3">For Employers</h3>
              <p className="text-base text-gray-500 mb-6 leading-relaxed">
                Find qualified workers and manage your team efficiently with
                smart tools built for growth.
              </p>
              <Button
                onClick={() => router.push("/signup")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl font-semibold text-base"
              >
                Post a Job
              </Button>
            </div>

            {/* Job Seekers */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:border-amber-200 transition-all group">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-3">For Job Seekers</h3>
              <p className="text-base text-gray-500 mb-6 leading-relaxed">
                Browse opportunities that match your skills and start your
                career journey today.
              </p>
              <Button
                onClick={() => router.push("/signup")}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11 rounded-xl font-semibold text-base"
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
