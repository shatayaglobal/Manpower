"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Briefcase, TrendingUp, Target } from "lucide-react";
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
      } else if (user.account_type === "WORKER") {
        router.push("/profile");
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
        "Connecting skilled workers with businesses through innovative technology and personalized service.",
    },
    {
      icon: Users,
      title: "For Workers",
      description:
        "Opening doors to opportunities that match your skills and help you grow your career.",
    },
    {
      icon: Briefcase,
      title: "For Businesses",
      description:
        "Providing qualified talent and powerful tools to manage and optimize your workforce.",
    },
    {
      icon: TrendingUp,
      title: "Our Vision",
      description:
        "Building a dynamic ecosystem where businesses thrive and talent shines.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 overflow-hidden bg-white">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
              Shataya Manpower
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting talent with opportunity through innovation and dedication
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white -mt-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* What We Do */}
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="font-bold text-3xl lg:text-4xl text-gray-900">
              What We Do
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Shataya Manpower revolutionizes how skilled workers and businesses
              connect. Using advanced matching technology, we pair the right
              talent with the right opportunities, saving time and boosting
              success for everyone.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Team Section */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="font-bold text-3xl lg:text-4xl text-gray-900">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                A dedicated team working tirelessly to connect employees with
                the best career opportunities in safe environments, while
                building strong relationships with businesses for smooth
                employer-employee transactions.
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4 rounded-2xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-xl transition-all">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover object-[center_20%]"
                      sizes="(max-width: 640px) 160px, 192px"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Businesses */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900">
                For Businesses
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Beyond recruitment, businesses gain powerful management tools to
                schedule shifts, assign tasks, track working hours, and monitor
                performance in real time.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our analytics system evaluates worker performance and
                operational effectiveness, giving you the data needed to
                optimize your workforce and grow stronger.
              </p>
            </div>

            {/* For Workers */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900">For Workers</h3>
              <p className="text-gray-600 leading-relaxed">
                Shataya opens doors to multiple job opportunities that match
                your skills and preferences, enabling faster placements and
                exciting career growth.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Get matched with employers who value your expertise and access
                tools that help you manage your work schedule and track your
                professional development.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto pt-8">
            <div className="bg-gray-50 rounded-xl p-8 sm:p-10">
              <div className="grid md:grid-cols-[1fr,auto] gap-6 items-center">
                <div className="text-left space-y-3">
                  <h2 className="font-bold text-2xl sm:text-3xl text-gray-900">
                    Ready to Join Shataya?
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Become part of a dynamic, efficient ecosystem where
                    businesses thrive and talent shines.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base whitespace-nowrap"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
