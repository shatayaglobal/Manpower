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
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/redux/redux";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthState();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

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
        "Connect with qualified professionals through advanced matching.",
      color: "bg-blue-500",
      path: "/talent-management",
      fullDescription:
        "Effective talent management is key to every successful manpower organization. Modern manpower applications are revolutionizing how companies recruit and manage skilled workers. Through advanced matching technology, employers can easily connect with qualified professionals based on their experience and skills. This smart system streamlines recruitment, improves worker performance, and strengthens engagement between employees and employers saving time, reducing turnover, and enhancing overall workforce quality.",
    },
    {
      icon: Briefcase,
      title: "Job Placement",
      description:
        "Smart algorithms that match skills with opportunities perfectly.",
      color: "bg-yellow-400",
      path: "/job-placement",
      fullDescription:
        "Digital applications make hiring faster, smarter, and more transparent. With smart algorithms, they instantly match workers' skills and experience with the right job opportunities, ensuring the best fit for both sides. This technology saves time, improves candidate quality, and gives workers quick access to suitable jobs. It also enables real-time communication and performance tracking, creating a smooth and efficient connection between workers and businesses.",
    },
    {
      icon: Calendar,
      title: "Shift Scheduling",
      description:
        "Intelligent workforce scheduling with real-time optimization.",
      color: "bg-blue-500",
      path: "/shift-scheduling",
      fullDescription:
        "The application provides businesses with a powerful tool to efficiently manage their workforce and daily operations. Through its smart management features, companies can easily schedule shifts, assign specific tasks or missions, and monitor working hours — from the exact time employees start their job until they finish. This system helps businesses maintain clear organization, avoid scheduling conflicts, and ensure that every task is completed on time. It also allows managers to track attendance, performance, and productivity in real time, giving them valuable insights for better decision-making. Overall, the application creates a seamless workflow that enhances communication, boosts efficiency, and supports a more reliable and well-coordinated workforce.",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Data-driven insights for better workforce decisions.",
      color: "bg-yellow-400",
      path: "/analytics",
      fullDescription:
        "The application also includes an advanced analysis system that helps businesses understand and improve their overall performance. It can analyze working hours, job efficiency, and individual worker performance, providing valuable insights into how each team member is contributing. Through detailed reports and data visualization, managers can identify strengths, detect challenges, and make smarter decisions to enhance productivity. This powerful analytical feature allows businesses to continuously improve operations, optimize workforce performance, and strengthen their overall growth and success.",
    },
  ];

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div>
      {/* Hero Section - FULL WIDTH */}
      <section className="w-full pt-12 sm:pt-20 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 bg-gradient-to-br from-blue-50 via-white to-yellow-50/20 -mt-8 sm:-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-gray-900 leading-tight tracking-tight animate-fade-in">
              Connect Talent with{" "}
              <span className="bg-gradient-to-r from-blue-500 to-yellow-400 bg-clip-text text-transparent">
                Opportunity
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4 animate-fade-in-delay">
              At Shataya Global, our mission is simple: connect talent with
              opportunity. We believe every skilled worker deserves a chance to
              grow, and every business deserves the right people to succeed.
              Together, we build stronger communities, one job at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4">
              {isAuthenticated && user ? (
                // Logged in users see "Find Jobs" or "Post Jobs" based on account type
                <>
                  {user.account_type === "WORKER" ? (
                    <Button
                      size="lg"
                      onClick={() => router.push("/jobs")}
                      className="group relative bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 w-full sm:w-auto animate-slide-up overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Find Jobs
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-2" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => router.push("/jobs/create")}
                      className="group relative bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 w-full sm:w-auto animate-slide-up overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Post a Job
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-2" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/profile")}
                    className="group relative border-2 border-blue-500 text-blue-600 hover:text-white hover:border-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium bg-white w-full sm:w-auto transition-all duration-500 hover:scale-110 hover:-translate-y-2 hover:shadow-2xl animate-slide-up-delay overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      My Profile
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => router.push("/login")}
                    className="group relative bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 w-full sm:w-auto animate-slide-up overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/signup")}
                    className="group relative border-2 border-blue-500 text-blue-600 hover:text-white hover:border-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium bg-white w-full sm:w-auto transition-all duration-500 hover:scale-110 hover:-translate-y-2 hover:shadow-2xl animate-slide-up-delay overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Sign Up
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid - CONSTRAINED */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white -mt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
            <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900 px-4">
              Complete Workforce Solutions
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Everything your organization needs to manage and optimize your
              workforce efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 bg-white"
              >
                <CardContent className="p-6 sm:p-8 space-y-3 sm:space-y-4">
                  {/* Icon - Clickable */}
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => handleFeatureClick(feature.path)}
                  >
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.color} rounded-xl flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300`}
                    >
                      <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-2 text-center">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Expanded Content */}
                  {expandedCard === index && (
                    <div className="pt-3 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-left">
                        {feature.fullDescription}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => toggleCard(index)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      {expandedCard === index ? (
                        <>
                          Show Less <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Core Benefits - FULL WIDTH */}
      <section className="w-full py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-gray-900 leading-tight">
                  Building Stronger Teams.{" "}
                  <span className="text-blue-500">
                    Creating Brighter Futures.
                  </span>
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                  At Shataya Global, we connect skilled and motivated
                  individuals with companies that need dependable manpower.
                  Whether you&apos;re an employer searching for reliable staff
                  or a worker ready to start your next opportunity, we make
                  hiring simple, fast, and effective.
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  From construction sites to luxury hotels, from logistics hubs
                  to security services — we power industries with people who get
                  the job done.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  Find Your Workforce
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 px-6 sm:px-8 py-3 sm:py-4 bg-white w-full sm:w-auto"
                >
                  Find a Job
                </Button>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {[
                    {
                      icon: Users,
                      label: "Talent Management",
                      color: "bg-blue-500",
                    },
                    {
                      icon: Briefcase,
                      label: "Job Placement",
                      color: "bg-yellow-400",
                    },
                    {
                      icon: Calendar,
                      label: "Scheduling",
                      color: "bg-blue-500",
                    },
                    {
                      icon: TrendingUp,
                      label: "Analytics",
                      color: "bg-yellow-400",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="text-center space-y-2 sm:space-y-3"
                    >
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 ${item.color} rounded-lg sm:rounded-xl flex items-center justify-center mx-auto`}
                      >
                        <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 sm:mt-8 text-center border-t border-gray-200 pt-4 sm:pt-6">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">
                    Trusted Across Industries
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    Construction • Hospitality • Logistics • Security
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs - CONSTRAINED */}
      {/* Featured Opportunities - CONSTRAINED */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
            <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900 px-4">
              Featured Opportunities
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
              Find your next opportunity across multiple industries
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                title: "Construction",
                company: "Skilled trades & site workers",
                location: "Multiple Locations",
                type: "Various",
                salary: "Competitive rates",
                posted: "Active",
                industry: "Construction",
              },
              {
                title: "Cleaning & Maintenance",
                company: "Residential, commercial & industrial",
                location: "Multiple Locations",
                type: "Various",
                salary: "Competitive rates",
                posted: "Active",
                industry: "Cleaning",
              },
              {
                title: "Hospitality",
                company: "Hotels, restaurants & service staff",
                location: "Multiple Locations",
                type: "Various",
                salary: "Competitive rates",
                posted: "Active",
                industry: "Hospitality",
              },
              {
                title: "Logistics & Transport",
                company: "Drivers, warehouse & delivery",
                location: "Multiple Locations",
                type: "Various",
                salary: "Competitive rates",
                posted: "Active",
                industry: "Logistics",
              },
              {
                title: "Security",
                company: "Guards, supervisors & monitoring staff",
                location: "Multiple Locations",
                type: "Various",
                salary: "Competitive rates",
                posted: "Active",
                industry: "Security",
              },
            ].map((job, index) => (
              <Card
                key={index}
                className="group border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                    <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                      <CardTitle className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-blue-500 transition-colors line-clamp-2">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="text-blue-600 font-medium text-xs sm:text-sm line-clamp-1">
                        {job.company}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-50 text-yellow-600 border-0 font-medium text-xs flex-shrink-0"
                    >
                      {job.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-900 font-medium text-xs sm:text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm py-2"
                    >
                      View Opportunities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 lg:mt-12 px-4">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-2 sm:py-3 bg-white w-full sm:w-auto"
            >
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - FULL WIDTH */}
      <section className="w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-1 sm:space-y-2">
              <div className="font-bold text-3xl sm:text-4xl lg:text-5xl text-white">
                15,000+
              </div>
              <div className="text-blue-100 text-xs sm:text-sm lg:text-base font-medium">
                Active Professionals
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="font-bold text-3xl sm:text-4xl lg:text-5xl text-yellow-400">
                500+
              </div>
              <div className="text-blue-100 text-xs sm:text-sm lg:text-base font-medium">
                Partner Companies
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="font-bold text-3xl sm:text-4xl lg:text-5xl text-white">
                75,000+
              </div>
              <div className="text-blue-100 text-xs sm:text-sm lg:text-base font-medium">
                Successful Matches
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="font-bold text-3xl sm:text-4xl lg:text-5xl text-yellow-400">
                98%
              </div>
              <div className="text-blue-100 text-xs sm:text-sm lg:text-base font-medium">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - CONSTRAINED */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900">
              Ready to Get Started?
            </h2>
            <h3 className="font-semibold text-xl sm:text-2xl lg:text-3xl text-blue-500">
              Let&apos;s Build Success Together!
            </h3>
          </div>
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Employers:</strong> Post your
              job openings and find qualified candidates fast.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Job Seekers:</strong> Register
              now and get matched with employers who value your skills.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed pt-2">
              Start today and experience the Shataya Global difference — where
              opportunity meets dedication.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              Post a Job
            </Button>
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              Apply for Work
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
