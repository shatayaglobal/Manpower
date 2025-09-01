"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  const { isLoginLoading, error, isAuthenticated, isGoogleAuthLoading } = useAuthState();
  console.log('Auth state on render:', {
    isLoginLoading,
    isAuthenticated,
    isGoogleAuthLoading,
    error: error?.message
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
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
        } catch (error) {
          //console.error('Error initializing Google Sign-In:', error);
        }
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);


  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      toast.success("Registration successful! Please sign in with your credentials.", {
      });

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('registered');
        window.history.replaceState({}, '', url.toString());
      }
    }

    const loginSuccess = searchParams.get('loginSuccess');
    if (loginSuccess === 'true') {
      toast.success("Login successful! Welcome back.", {
      });

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('loginSuccess');
        window.history.replaceState({}, '', url.toString());
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
        toast.error("This account was created with Google. Please use the 'Continue with Google' button above.", {
          duration: 6000,
        });
      } else {
        toast.error(error?.message || "Login failed. Please try again.");
      }
    }
  };

  // Handle Google credential response
  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    try {
      const result = await googleAuth({
        credential: response.credential,
        token: ""
      });

      if (result.success) {
        toast.success("Google sign-in successful! Welcome to your Worker account.", {
        });

        setTimeout(() => {
          router.push("/home");
        }, 100);
      } else {
        toast.error("Google sign-in failed. Please try again.", {
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error("An error occurred during Google sign-in.", {
      });
    }
  };

  const handleGoogleSignIn = () => {
    if (window.google) {
      try {
        // Alternative approach: render Google button
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
          }
        );
      } catch (error) {
        console.error('Error with Google button render:', error);
        try {
          window.google.accounts.id.prompt();
        } catch (promptError) {
          console.error('Error with Google prompt:', promptError);
          toast.error("Unable to open Google Sign-In. Please try again.", {
          });
        }
      }
    } else {
      toast.error("Google Sign-In is not available. Please try again later.", {
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-yellow-50/20 min-h-screen">
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-bold text-3xl text-gray-900">Welcome Back</h1>
            <p className="text-gray-600">
              Sign in to your account to continue connecting talent with
              opportunity
            </p>
          </div>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="space-y-4 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Access your account with email or Google
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              {/* Google Sign In Button */}
              <div className="space-y-2">
                <div id="google-signin-button" className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50 py-3 bg-transparent"
                    onClick={handleGoogleSignIn}
                    disabled={isLoginLoading || isGoogleAuthLoading}
                  >
                    {isGoogleAuthLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Connecting to Google...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Google sign-in creates a Worker account
                </p>
              </div>

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
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`pl-10 w-full ${
                        error?.errors?.email ? "border-red-300" : ""
                      }`}
                      required
                      disabled={isLoginLoading || isGoogleAuthLoading}
                    />
                  </div>
                  {error?.errors?.email && (
                    <p className="text-sm text-red-600">
                      {error.errors.email[0]}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`pl-10 pr-10 w-full ${
                        error?.errors?.password ? "border-red-300" : ""
                      }`}
                      required
                      disabled={isLoginLoading || isGoogleAuthLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoginLoading || isGoogleAuthLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {error?.errors?.password && (
                    <p className="text-sm text-red-600">
                      {error.errors.password[0]}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 shadow-lg"
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
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Links */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Sign up here
              </Link>
            </p>
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
