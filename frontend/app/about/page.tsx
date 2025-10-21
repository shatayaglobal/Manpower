"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/redux/redux";

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

  return (
    <div>
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 bg-gradient-to-br from-blue-50 via-white to-yellow-50/20">
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
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
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

          {/* Call to Action */}
          <Card className="mt-8 sm:mt-12">
            <CardContent className="p-8 sm:p-10 text-center space-y-6">
              <h2 className="font-bold text-2xl sm:text-3xl text-gray-900">
                Join Shataya Today
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
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
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
