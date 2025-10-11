"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuthSlice } from "@/lib/redux/use-auth";
import { useAuthState } from "@/lib/redux/redux";
import { toast } from "sonner";
import { AuthError, Google, GoogleCredentialResponse } from "@/lib/types";

declare global {
  interface Window {
    google?: Google;
  }
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleAuth, clearAuthError, resetLoading } = useAuthSlice();
  const { isLoginLoading, error, isAuthenticated, isGoogleAuthLoading } =
    useAuthState();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      toast.success(
        "Registration successful! Please sign in with your credentials.",
        {}
      );

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("registered");
        window.history.replaceState({}, "", url.toString());
      }
    }

    const loginSuccess = searchParams.get("loginSuccess");
    if (loginSuccess === "true") {
      toast.success("Login successful! Welcome back.", {});

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("loginSuccess");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    resetLoading();
    clearAuthError();
  }, [resetLoading, clearAuthError]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) {
      clearAuthError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    const result = await login(formData);

    if (result.success) {
      toast.success("Login successful! Welcome back.");
      setTimeout(() => {
        router.push("/home");
      }, 100);
    } else {
      const error = result.error as AuthError;
      if (error?.googleLoginRequired) {
        toast.error(
          "This account was created with Google. Please use the 'Continue with Google' button above.",
          {
            duration: 6000,
          }
        );
      } else {
        toast.error(error?.message || "Login failed. Please try again.");
      }
    }
  };

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        const result = await googleAuth({
          credential: response.credential,
          token: "",
        });

        if (result.success) {
          toast.success(
            "Google sign-in successful! Welcome to your Worker account.",
            {}
          );
          setTimeout(() => {
            router.push("/home");
          }, 100);
        } else {
          toast.error("Google sign-in failed. Please try again.", {});
        }
      } catch {
        toast.error("An error occurred during Google sign-in.", {});
      }
    },
    [googleAuth, router]
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button")!,
            {
              theme: "outline",
              size: "large",
              width: `${Math.min(400, window.innerWidth - 48)}`,
            }
          );
        } catch {
          //console.error('Error initializing Google Sign-In:', error);
        }
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [handleCredentialResponse]);

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/20 to-amber-50/15 min-h-screen">
      <div className="flex items-center justify-center min-h-screen py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm sm:text-base px-2">
              Sign in to your account to continue connecting talent with
              opportunity
            </p>
          </div>

          {/* Sign In Card */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="space-y-2 sm:space-y-3 lg:space-y-4 pb-3 sm:pb-4 lg:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-xl sm:text-2xl font-semibold text-center text-gray-900">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-gray-600 text-xs sm:text-sm lg:text-base">
                Access your account with email or Google
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 lg:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="py-2 sm:py-3">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Google Sign In Button */}
              <div className="space-y-2">
                <div
                  id="google-signin-button"
                  className="w-full flex justify-center"
                ></div>
                <p className="text-xs text-gray-500 text-center px-2">
                  Google sign-in creates a Worker account
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs sm:text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`pl-8 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base ${
                        error?.errors?.email ? "border-red-300" : ""
                      }`}
                      required
                      disabled={isLoginLoading || isGoogleAuthLoading}
                    />
                  </div>
                  {error?.errors?.email && (
                    <p className="text-xs text-red-600">
                      {error.errors.email[0]}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs sm:text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-blue-500 hover:text-blue-600 underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`pl-8 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-11 text-sm sm:text-base ${
                        error?.errors?.password ? "border-red-300" : ""
                      }`}
                      required
                      disabled={isLoginLoading || isGoogleAuthLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoginLoading || isGoogleAuthLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </button>
                  </div>
                  {error?.errors?.password && (
                    <p className="text-xs text-red-600">
                      {error.errors.password[0]}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white h-10 sm:h-11 text-sm sm:text-base shadow-sm mt-4 sm:mt-6"
                  disabled={isLoginLoading || isGoogleAuthLoading}
                >
                  {isLoginLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Links */}
          <div className="text-center space-y-2 sm:space-y-3 px-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-500 hover:text-blue-600 underline font-medium"
              >
                Sign up here
              </Link>
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-blue-500 hover:text-blue-600 underline"
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
