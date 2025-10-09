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
  CheckCircle,
} from "lucide-react";




export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="pt-24 pb-32 bg-gradient-to-br from-white via-blue-50/30 to-yellow-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h1 className="font-bold text-5xl lg:text-7xl text-gray-900 leading-tight tracking-tight">
              Connect Talent with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                Opportunity
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Professional workforce solutions that bring the right people
              together with precision and purpose.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-medium shadow-lg"
              >
                Find Jobs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-medium bg-white"
              >
                Post Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-bold text-4xl text-gray-900">
              Complete Workforce Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything your organization needs to manage and optimize your
              workforce efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Talent Management",
                description:
                  "Connect with qualified professionals through advanced matching.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Briefcase,
                title: "Job Placement",
                description:
                  "Smart algorithms that match skills with opportunities perfectly.",
                color: "from-yellow-500 to-yellow-600",
              },
              {
                icon: Calendar,
                title: "Shift Scheduling",
                description:
                  "Intelligent workforce scheduling with real-time optimization.",
                color: "from-blue-600 to-blue-700",
              },
              {
                icon: TrendingUp,
                title: "Analytics",
                description:
                  "Data-driven insights for better workforce decisions.",
                color: "from-yellow-600 to-yellow-700",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-1"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-blue-50/70 to-yellow-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="font-bold text-4xl lg:text-5xl text-gray-900 leading-tight">
                  Professional workforce solutions for{" "}
                  <span className="text-blue-600">modern businesses</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Streamline your workforce management with our comprehensive
                  platform designed for today&apos;s professional environment.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  "Advanced matching algorithms",
                  "Enterprise-grade security",
                  "Real-time analytics and reporting",
                  "24/7 customer support",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 px-8 py-4 bg-white"
                >
                  Schedule Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      icon: Users,
                      label: "Talent Management",
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      icon: Briefcase,
                      label: "Job Placement",
                      color: "from-yellow-500 to-yellow-600",
                    },
                    {
                      icon: Calendar,
                      label: "Scheduling",
                      color: "from-blue-600 to-blue-700",
                    },
                    {
                      icon: TrendingUp,
                      label: "Analytics",
                      color: "from-yellow-600 to-yellow-700",
                    },
                  ].map((item, index) => (
                    <div key={index} className="text-center space-y-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mx-auto shadow-sm`}
                      >
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center border-t border-gray-200 pt-6">
                  <div className="text-sm font-semibold text-gray-900">
                    Enterprise-Grade Platform
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    Trusted by leading organizations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-bold text-4xl text-gray-900">
              Featured Opportunities
            </h2>
            <p className="text-lg text-gray-600">
              Discover career opportunities from top companies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Hotel Manager",
                company: "Grand Plaza Hotel",
                location: "Miami, FL",
                type: "Full-time",
                salary: "$65,000 - $85,000",
                color: "blue",
                posted: "2 days ago",
                industry: "Hospitality",
              },
              {
                title: "Restaurant Supervisor",
                company: "Bella Vista Restaurant",
                location: "Chicago, IL",
                type: "Full-time",
                salary: "$45,000 - $55,000",
                color: "yellow",
                posted: "1 day ago",
                industry: "Food Service",
              },
              {
                title: "Store Manager",
                company: "Fresh Market Supermarket",
                location: "Houston, TX",
                type: "Full-time",
                salary: "$50,000 - $65,000",
                color: "blue",
                posted: "3 days ago",
                industry: "Retail",
              },
              {
                title: "Event Coordinator",
                company: "Elegant Events Hall",
                location: "Las Vegas, NV",
                type: "Full-time",
                salary: "$40,000 - $50,000",
                color: "yellow",
                posted: "1 day ago",
                industry: "Events",
              },
              {
                title: "Production Supervisor",
                company: "Metro Manufacturing",
                location: "Detroit, MI",
                type: "Full-time",
                salary: "$55,000 - $70,000",
                color: "blue",
                posted: "4 days ago",
                industry: "Manufacturing",
              },
              {
                title: "Kitchen Manager",
                company: "Ocean View Resort",
                location: "San Diego, CA",
                type: "Full-time",
                salary: "$48,000 - $62,000",
                color: "yellow",
                posted: "2 days ago",
                industry: "Hospitality",
              },
            ].map((job, index) => (
              <Card
                key={index}
                className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-2">
                      <CardTitle
                        className={`font-semibold text-lg text-gray-900 group-hover:text-${job.color}-600 transition-colors`}
                      >
                        {job.title}
                      </CardTitle>
                      <CardDescription
                        className={`text-${job.color}-600 font-medium`}
                      >
                        {job.company}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`bg-${job.color}-50 text-${job.color}-700 border-0`}
                    >
                      {job.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-900 font-medium text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      className={`w-full ${
                        job.color === "blue"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                      } text-white shadow-sm`}
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-3 bg-white"
            >
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-yellow-500 relative">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div className="space-y-2">
              <div className="font-bold text-4xl">15,000+</div>
              <div className="text-white/90 text-sm">Active Professionals</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-4xl">500+</div>
              <div className="text-white/90 text-sm">Partner Companies</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-4xl">75,000+</div>
              <div className="text-white/90 text-sm">Successful Matches</div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-4xl">98%</div>
              <div className="text-white/90 text-sim">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-yellow-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="font-bold text-4xl text-gray-900">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals and companies who trust
              ShatayaGlobal Ltd to connect talent with opportunity.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 shadow-lg"
            >
              Find Your Dream Job
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 shadow-lg"
            >
              Hire Top Talent
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
