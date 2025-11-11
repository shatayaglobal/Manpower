"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthSlice } from "@/lib/redux/use-auth";
import { useAuthState } from "@/lib/redux/redux";

export default function VerifyEmailSentPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  const { resendVerification } = useAuthSlice();
  const { isResendVerificationLoading } = useAuthState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("verification_email");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        router.push("/signup");
      }
    }
  }, [router]);

  const handleResendEmail = async () => {
    if (!email) return;

    const result = await resendVerification(email);

    if (result.success) {
      toast.success("Verification email resent successfully!");
    } else {
      toast.error(result.error?.message || "Failed to resend email");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/20 to-amber-50/15 min-h-screen">
      <div className="flex items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="space-y-3 pb-4 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                We&apos;ve sent a verification link to your email address
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Click the verification link in the email to activate your
                  account and start using Shataya Global.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 font-medium">Important Notes:</p>
                  <ul className="mt-2 space-y-1 text-amber-700 list-disc list-inside">
                    <li>The link expires in 24 hours</li>
                    <li>Check your spam/junk folder if you don&apos;t see it</li>
                    <li>You can login after verifying your email</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResendVerificationLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isResendVerificationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                <Link href="/signup" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign-up
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
