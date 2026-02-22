"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Briefcase, TrendingUp, Target, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/redux/redux";
import Image from "next/image";

export default function AboutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthState();

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      if (user.account_type === "BUSINESS") {
        router.push("/business");
      } else {
        router.push("/profile");
      }
    } else {
      router.push("/signup");
    }
  };

  const teamMembers = [
    {
      name: "Mr. Mohand",
      role: "CEO and General Manager",
      image: "/mohand1.jpeg",
    },
    {
      name: "Ms. Naka",
      role: "Human Resource Manager",
      image: "/naka.jpeg",
    },
    {
      name: "Ms. Brenda",
      role: "IT Manager",
      image: "/brenda.jpeg",
    },
    {
      name: "Mr. Motez",
      role: "Team Member",
      image: "/motez.jpeg",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "Connecting skilled workers with businesses through innovative technology and personalized service that puts people first.",
      iconBg: "bg-blue-600",
    },
    {
      icon: Users,
      title: "For Workers",
      description:
        "Opening doors to opportunities that match your skills, your schedule, and the career direction you want to grow toward.",
      iconBg: "bg-amber-500",
    },
    {
      icon: Briefcase,
      title: "For Businesses",
      description:
        "Providing qualified talent and powerful tools to manage, schedule, and optimize your workforce — all in one place.",
      iconBg: "bg-violet-600",
    },
    {
      icon: TrendingUp,
      title: "Our Vision",
      description:
        "Building a dynamic ecosystem where businesses thrive and talent shines — across every sector, every shift, every day.",
      iconBg: "bg-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">
                Who We Are
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
              About{" "}
              <span className="text-blue-600">Shataya Manpower</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              We revolutionize how skilled workers and businesses connect. Using
              advanced matching technology and a hands-on approach, we pair the
              right talent with the right opportunities — saving time and
              boosting success for everyone involved.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              What Drives Us
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
              Built Around People
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Everything we build starts with a simple question — does this make
              life easier for the worker or the business? If not, we go back to
              the drawing board.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 flex flex-col"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${v.iconBg}`}
                >
                  <v.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  {v.title}
                </h3>
                <p className="text-base text-gray-500 leading-relaxed flex-1">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR BUSINESSES + FOR WORKERS ─────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              How We Help
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
              A Platform Built for Both Sides
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Most platforms serve one side of the equation. Shataya is built
              for both — with tools and workflows tailored to what businesses
              and workers actually need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Businesses */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:border-blue-200 transition-all">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-2xl mb-4">
                For Businesses
              </h3>
              <p className="text-base text-gray-500 leading-relaxed mb-4">
                Beyond recruitment, businesses gain powerful management tools to
                schedule shifts, assign tasks, track working hours, and monitor
                performance in real time.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-6">
                Our analytics system evaluates worker performance and
                operational effectiveness, giving you the data needed to
                optimize your workforce and grow stronger.
              </p>
              <ul className="space-y-3">
                {["Smart candidate matching", "Shift scheduling tools", "Performance analytics", "Real-time workforce tracking"].map((b) => (
                  <li key={b} className="flex items-center gap-2 text-base text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Workers */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:border-amber-200 transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-2xl mb-4">
                For Workers
              </h3>
              <p className="text-base text-gray-500 leading-relaxed mb-4">
                Shataya opens doors to multiple job opportunities that match
                your skills and preferences, enabling faster placements and
                exciting career growth.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-6">
                Get matched with employers who value your expertise and access
                tools that help you manage your work schedule and track your
                professional development.
              </p>
              <ul className="space-y-3">
                {["Skills-based job matching", "Faster placements", "Career growth tracking", "Flexible scheduling"].map((b) => (
                  <li key={b} className="flex items-center gap-2 text-base text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              The Team
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
              Meet the People Behind Shataya
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              A dedicated team working tirelessly to connect employees with the
              best career opportunities in safe environments, while building
              strong relationships with businesses for smooth
              employer-employee transactions.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 text-center group"
              >
                <div className="relative w-32 h-32 mx-auto mb-5 rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-[center_20%]"
                    sizes="128px"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">
                  {member.name}
                </h3>
                <p className="text-base text-gray-500">{member.role}</p>
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
              Ready to Join Shataya?
            </h2>
            <p className="text-lg text-gray-500">Choose your path and start today.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
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
