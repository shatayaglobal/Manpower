"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthSlice } from "@/lib/redux/use-auth";
import { AuthError, VerifyEmailResponse } from "@/lib/types";

type VerificationState = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useAuthSlice();
  const hasVerified = useRef(false);
  const [verificationState, setVerificationState] =
    useState<VerificationState>("verifying");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setVerificationState("error");
      setErrorMessage("Verification token is missing");
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    handleVerifyEmail();
  }, [token]);

  const handleVerifyEmail = async () => {
    if (!token) return;

    const result = await verifyEmail(token);

    if (result.success) {
      setVerificationState("success");
      const data = result.data as { user?: { first_name?: string } };
      setUserName(data?.user?.first_name || "");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("verification_email");
      }
    } else {
      setVerificationState("error");
      setErrorMessage(
        (result.error as AuthError)?.message ||
          "Failed to verify email. Please try again."
      );
    }
  }

    const renderContent = () => {
      switch (verificationState) {
        case "verifying":
          return (
            <>
              <CardHeader className="space-y-3 pb-4 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Verifying Your Email
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Please wait while we verify your email address...
                </CardDescription>
              </CardHeader>
            </>
          );

        case "success":
          return (
            <>
              <CardHeader className="space-y-3 pb-4 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Email Verified Successfully!
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {userName && `Welcome, ${userName}! `}
                  Your account is now active.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✓ Your email has been verified
                    <br />✓ You can now login to your account
                    <br />✓ Access all features of Shataya Global
                  </p>
                </div>

                <Link href="/login" className="block">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">
                    Continue to Login
                  </Button>
                </Link>
              </CardContent>
            </>
          );

        case "error":
          return (
            <>
              <CardHeader className="space-y-3 pb-4 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Verification Failed
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {errorMessage}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    Common reasons for failure:
                  </p>
                  <ul className="mt-2 space-y-1 text-red-700 text-sm list-disc list-inside">
                    <li>The verification link has expired (24 hours)</li>
                    <li>The link has already been used</li>
                    <li>The link is invalid or corrupted</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Link href="/signup" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      Sign Up Again
                    </Button>
                  </Link>

                  <Link href="/contact" className="block">
                    <Button variant="ghost" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </>
          );
      }
    };

    return (
      <div className="bg-gradient-to-br from-white via-slate-50/20 to-amber-50/15 min-h-screen">
        <div className="flex items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-lg bg-white">
              {renderContent()}
            </Card>
          </div>
        </div>
      </div>
    );
  };

