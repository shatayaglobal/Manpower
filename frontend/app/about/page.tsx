"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
      name: "Mohand",
      role: "CEO and General Manager",
      image: "/mohand.jpeg",
    },
    {
      name: "Naka",
      role: "Human Resource Manager",
      image: "/naka.jpeg",
    },
    {
      name: "Brenda",
      role: "IT Manager",
      image: "/brenda.jpeg",
    },
    {
      name: "Motez",
      role: "Team Member",
      image: "/motez.jpeg",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="pt-10 -mt-10 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 bg-gradient-to-br from-blue-50 via-white to-yellow-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            About{" "}
            <span className="bg-gradient-to-r from-blue-500 to-yellow-400 bg-clip-text text-transparent">
              Shataya Manpower
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Connecting Talent with Opportunity
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="-mt-20 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          {/* Team Section - Moved to Top */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="font-bold text-2xl sm:text-3xl text-gray-900">
                Shataya Team
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
                Shataya is built from the ground up by a small but very hardworking team,
                who have dedicated tremendous time to ensure an employee would get the best
                options at the career or work path they desire in a safe environment, while
                also building great relationships with different businesses to ensure a smooth
                transaction between the employer and employee.
              </p>
            </div>

            {/* Team Grid with Rounded Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover object-[center_20%]"
                      sizes="(max-width: 640px) 192px, 192px"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Introduction */}
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              The Shataya Manpower Application is revolutionizing the way
              skilled workers and businesses connect. Using advanced matching
              technology, the platform quickly pairs the right talent with the
              right opportunities, ensuring every placement is a perfect fit —
              saving time, reducing hassle, and boosting success for businesses.
            </p>
          </div>

          {/* For Businesses */}
          <div className="space-y-4">
            <h2 className="font-bold text-xl sm:text-2xl text-gray-900">
              For Businesses
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              But Shataya doesn&apos;t stop at recruitment. Businesses gain powerful
              management tools to schedule shifts, assign tasks, track working
              hours, and monitor performance in real time. This makes operations
              smoother, improves productivity, and helps teams work smarter, not
              harder.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              With its insightful analytics system, Shataya evaluates worker
              performance, task efficiency, and overall operational
              effectiveness, giving businesses the data they need to optimize
              their workforce and grow stronger.
            </p>
          </div>

          {/* For Workers */}
          <div className="space-y-4">
            <h2 className="font-bold text-xl sm:text-2xl text-gray-900">
              For Workers
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              For workers, Shataya opens doors to multiple job opportunities
              that match their skills and preferences, enabling faster
              placements and exciting career growth.
            </p>
          </div>

          {/* Call to Action - No Card */}
          <div className="pt-12 sm:pt-16 pb-8 text-center space-y-6 bg-gradient-to-br from-blue-50/50 to-yellow-50/30 rounded-2xl px-8 sm:px-10 py-12">
            <h2 className="font-bold text-2xl sm:text-3xl text-gray-900">
              Join Shataya Today
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Become part of a dynamic, efficient, and data-driven ecosystem
              where businesses thrive and talent shines — the smart way to
              work and grow together.
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
