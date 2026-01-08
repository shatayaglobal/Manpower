"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Building2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/redux/redux";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthState();

  const handleFeatureClick = (featurePath: string) => {
    if (isAuthenticated && user) {
      if (user.account_type === "BUSINESS") {
        router.push(`/business${featurePath}`);
      } else if (user.account_type === "WORKER") {
        router.push(`/profile`);
      } else {
        router.push(`/profile`);
      }
    } else {
      router.push("/login");
    }
  };

  const features = [
    {
      icon: Users,
      title: "Talent Management",
      description:
        "Connect with qualified professionals through AI-powered matching algorithms.",
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500",
      path: "/talent-management",
      benefits: [
        "Smart candidate matching",
        "Skills-based filtering",
        "Real-time availability",
      ],
    },
    {
      icon: Briefcase,
      title: "Job Placement",
      description:
        "Seamless recruitment process that connects the right talent with the right opportunity.",
      color: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-600",
      path: "/job-placement",
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
        "Intelligent scheduling system with automated conflict resolution and optimization.",
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-500",
      path: "/shift-scheduling",
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
        "Comprehensive workforce insights with real-time dashboards and custom reports.",
      color: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-500",
      path: "/analytics",
      benefits: [
        "Performance metrics",
        "Custom reports",
        "Predictive insights",
      ],
    },
  ];

  const industries = [
    { name: "Construction", icon: Building2, jobs: "2,500+" },
    { name: "Hospitality", icon: Users, jobs: "1,800+" },
    { name: "Logistics", icon: TrendingUp, jobs: "3,200+" },
    { name: "Security", icon: CheckCircle2, jobs: "1,500+" },
    { name: "Cleaning", icon: Sparkles, jobs: "1,100+" },
  ];

  const jobs = [
    {
      title: "Construction Workers",
      company: "Multiple construction sites",
      location: "Kampala & Entebbe",
      type: "Full-time",
      salary: "UGX 800K - 1.5M",
      posted: "2 days ago",
      tags: ["Urgent", "High Demand"],
    },
    {
      title: "Hotel Staff",
      company: "5-star hotels & resorts",
      location: "Kampala",
      type: "Full-time",
      salary: "UGX 600K - 1.2M",
      posted: "3 days ago",
      tags: ["Immediate Start"],
    },
    {
      title: "Warehouse Operators",
      company: "Logistics companies",
      location: "Industrial Area",
      type: "Shifts",
      salary: "UGX 700K - 1M",
      posted: "1 week ago",
      tags: ["Night Shift Available"],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-white">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-100 px-5 py-2.5 rounded-full text-sm font-semibold text-gray-700 mb-8 shadow-sm">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full animate-pulse"></div>
              <span>#1 Trusted Manpower Platform</span>
            </div>

            {/* Main heading */}
            <h1 className="font-extrabold text-5xl sm:text-6xl lg:text-7xl text-gray-900 leading-[1.1] tracking-tight mb-8">
              Connect Top Talent with
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 bg-clip-text text-transparent">
                Great Opportunities
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12 font-medium">
              The fastest way to hire skilled workers or find your next job.
              Trusted by thousands of businesses and professionals across
              Uganda.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {isAuthenticated && user ? (
                <>
                  {user.account_type === "WORKER" ? (
                    <Button
                      size="lg"
                      onClick={() => router.push("/jobs")}
                      className="group relative bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Browse Available Jobs
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => router.push("/jobs/create")}
                      className="group relative bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Post a Job Opening
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/profile")}
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-10 py-7 text-lg font-semibold rounded-xl transition-all duration-300"
                  >
                    View My Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => router.push("/signup")}
                    className="group relative bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-10 py-7 text-lg font-semibold rounded-xl transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    15,000+
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Active Workers
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600 font-medium">
                    Partner Companies
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600 font-medium">
                    Success Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl text-gray-900 mb-4">
              Everything You Need to Manage Your Workforce
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to streamline hiring, scheduling, and
              workforce management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                onClick={() => handleFeatureClick(feature.path)}
                className="group relative border-2 border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                ></div>

                <CardContent className="p-8 relative">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-xl text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Learn more link */}
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl lg:text-4xl text-gray-900 mb-3">
              Serving Multiple Industries
            </h2>
            <p className="text-lg text-gray-600">
              Connecting talent across diverse sectors
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <industry.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-base mb-2">
                  {industry.name}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {industry.jobs} jobs
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-bold text-4xl text-gray-900 mb-2">
                Featured Opportunities
              </h2>
              <p className="text-lg text-gray-600">
                Latest openings from top employers
              </p>
            </div>
            <Button
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => router.push("/jobs")}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job, index) => (
              <Card
                key={index}
                className="group border-2 border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="text-blue-600 font-medium">
                        {job.company}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-amber-50 text-amber-700 border border-amber-200 font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-900 font-semibold">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{job.salary}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{job.type}</span>
                      <span>{job.posted}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="font-extrabold text-5xl text-white mb-2">
                15K+
              </div>
              <div className="text-blue-100 font-medium">
                Active Professionals
              </div>
            </div>
            <div>
              <div className="font-extrabold text-5xl text-amber-400 mb-2">
                500+
              </div>
              <div className="text-blue-100 font-medium">Partner Companies</div>
            </div>
            <div>
              <div className="font-extrabold text-5xl text-white mb-2">
                75K+
              </div>
              <div className="text-blue-100 font-medium">
                Successful Placements
              </div>
            </div>
            <div>
              <div className="font-extrabold text-5xl text-amber-400 mb-2">
                98%
              </div>
              <div className="text-blue-100 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl lg:text-4xl text-gray-900 mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600">
              Choose your path and join our community today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Employers Card */}
            <Card className="border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  For Employers
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Find qualified workers and manage your team efficiently.
                </p>
                <Button
                  onClick={() => router.push("/signup")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  Post a Job
                </Button>
              </CardContent>
            </Card>

            {/* Job Seekers Card */}
            <Card className="border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  For Job Seekers
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Browse opportunities and start your career journey.
                </p>
                <Button
                  onClick={() => router.push("/signup")}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  size="lg"
                >
                  Find Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
