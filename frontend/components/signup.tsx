"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuthSlice } from "@/lib/redux/use-auth";
import { useAuthState } from "@/lib/redux/redux";
import { toast } from "sonner";
import { AuthError, GoogleCredentialResponse } from "@/lib/types";
import AccountTypeModal from "@/components/account-type-modal";

interface GoogleIdentityButtonOptions {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  type?: "standard" | "icon";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string;
  locale?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { register, googleAuth, clearAuthError, clearAuthSuccessStates } =
    useAuthSlice();
  const { isRegisterLoading, error, isAuthenticated, isGoogleAuthLoading } =
    useAuthState();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    account_type: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    clearAuthError();
    clearAuthSuccessStates();
  }, [clearAuthError, clearAuthSuccessStates]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) {
      clearAuthError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (!formData.account_type) {
      toast.error("Please select an account type");
      return;
    }

    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      password_confirm: formData.confirmPassword,
      account_type: formData.account_type,
    };

    const result = await register(submitData);

    if (result.success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("verification_email", formData.email);
      }
      router.push("/verify-email-sent");
    } else {
      const authError = result.error as AuthError;
      if (authError?.errors?.email) {
        toast.error(authError.errors.email[0]);
      } else if (authError?.message) {
        toast.error(authError.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        setPendingGoogleCredential(response.credential);
        setShowAccountTypeModal(true);
      } catch {
        toast.error("An error occurred during Google sign-in.", {});
      }
    },
    []
  );

  const handleAccountTypeSelect = async (
    accountType: "WORKER" | "BUSINESS"
  ) => {
    if (!pendingGoogleCredential) return;

    try {
      const result = await googleAuth({
        credential: pendingGoogleCredential,
        token: "",
        account_type: accountType,
      });

      if (result.success) {
        setShowAccountTypeModal(false);
        setPendingGoogleCredential(null);

        const accountTypeName =
          accountType === "WORKER" ? "Worker" : "Business";
        toast.success(
          `Google sign-up successful! Welcome to your ${accountTypeName} account.`,
          {}
        );

        setTimeout(() => {
          router.push("/home");
        }, 100);
      } else {
        toast.error("Google sign-up failed. Please try again.", {});
        setShowAccountTypeModal(false);
        setPendingGoogleCredential(null);
      }
    } catch {
      toast.error("An error occurred during Google sign-up.", {});
      setShowAccountTypeModal(false);
      setPendingGoogleCredential(null);
    }
  };

  const handleAccountTypeCancel = () => {
    setShowAccountTypeModal(false);
    setPendingGoogleCredential(null);
    toast.info("Google sign-up cancelled. You can try again anytime.");
  };

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

          // Render mobile button
          const mobileButtonContainer = document.getElementById(
            "google-signup-button-mobile"
          );
          if (mobileButtonContainer) {
            const containerWidth =
              mobileButtonContainer.parentElement?.offsetWidth || 400;

            (
              window.google.accounts.id.renderButton as (
                element: HTMLElement,
                options: GoogleIdentityButtonOptions
              ) => void
            )(mobileButtonContainer, {
              theme: "outline",
              size: "large",
              width: containerWidth.toString(),
              text: "signup_with",
            });
          }

          // Render desktop button
          const desktopButtonContainer = document.getElementById(
            "google-signup-button-desktop"
          );
          if (desktopButtonContainer) {
            const containerWidth =
              desktopButtonContainer.parentElement?.offsetWidth || 400;

            (
              window.google.accounts.id.renderButton as (
                element: HTMLElement,
                options: GoogleIdentityButtonOptions
              ) => void
            )(desktopButtonContainer, {
              theme: "outline",
              size: "large",
              width: containerWidth.toString(),
              text: "signup_with",
            });
          }
        } catch {
          throw new Error("Google Sign-In initialization failed");
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
    <>
      {/* Account Type Selection Modal */}
      <AccountTypeModal
        open={showAccountTypeModal}
        onSelect={handleAccountTypeSelect}
        onCancel={handleAccountTypeCancel}
        isLoading={isGoogleAuthLoading}
      />

      <div className="bg-gradient-to-br from-white via-slate-50/20 to-amber-50/15 min-h-screen">
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl space-y-6">
            <div className="text-center space-y-3">
              <h1 className="font-bold text-2xl sm:text-3xl text-gray-900">
                Create Your Account
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Join thousands of professionals connecting talent with
                opportunity
              </p>
            </div>

            <Card className="border-0 shadow-lg bg-white w-full">
              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="text-xl sm:text-2xl font-semibold text-center text-gray-900">
                  Sign Up
                </CardTitle>
                <CardDescription className="text-center text-sm sm:text-base text-gray-600">
                  Choose your account type and get started today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign Up Button */}
                <div className="space-y-2">
                  {/* Mobile: Full width, safe padding */}
                  <div className="px-4 lg:hidden">
                    <div className="w-full min-h-[44px] flex items-center justify-center">
                      <div
                        id="google-signup-button-mobile"
                        className="w-full"
                      ></div>
                    </div>
                  </div>

                  {/* Desktop: Centered + nudged right */}
                  <div className="hidden lg:block px-0">
                    <div className="mx-auto max-w-lg xl:max-w-xl min-h-[44px] flex items-center justify-center translate-x-20">
                      <div
                        id="google-signup-button-desktop"
                        className="w-full"
                      ></div>
                    </div>
                  </div>

                  <p className="text-center text-xs sm:text-sm text-gray-500 px-4 lg:px-0">
                    You&apos;ll choose your account type after signing in with
                    Google
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Account Type Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="accountType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Account Type
                    </Label>
                    <Select
                      value={formData.account_type}
                      onValueChange={(value) =>
                        handleInputChange("account_type", value)
                      }
                      disabled={isRegisterLoading || isGoogleAuthLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose your account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WORKER">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span>Worker - Looking for opportunities</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BUSINESS">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-amber-600" />
                            <span>Business - Hiring talent</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {error?.errors?.account_type && (
                      <p className="text-xs sm:text-sm text-red-600">
                        {error.errors.account_type[0]}
                      </p>
                    )}
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={(e) =>
                          handleInputChange("first_name", e.target.value)
                        }
                        className={`w-full ${
                          error?.errors?.first_name ? "border-red-300" : ""
                        }`}
                        required
                        disabled={isRegisterLoading || isGoogleAuthLoading}
                      />
                      {error?.errors?.first_name && (
                        <p className="text-xs sm:text-sm text-red-600">
                          {error.errors.first_name[0]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={(e) =>
                          handleInputChange("last_name", e.target.value)
                        }
                        className={`w-full ${
                          error?.errors?.last_name ? "border-red-300" : ""
                        }`}
                        required
                        disabled={isRegisterLoading || isGoogleAuthLoading}
                      />
                      {error?.errors?.last_name && (
                        <p className="text-xs sm:text-sm text-red-600">
                          {error.errors.last_name[0]}
                        </p>
                      )}
                    </div>
                  </div>

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
                        disabled={isRegisterLoading || isGoogleAuthLoading}
                      />
                    </div>
                    {error?.errors?.email && (
                      <p className="text-xs sm:text-sm text-red-600">
                        {error.errors.email[0]}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className={`pl-10 pr-10 w-full ${
                          error?.errors?.password ? "border-red-300" : ""
                        }`}
                        required
                        disabled={isRegisterLoading || isGoogleAuthLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isRegisterLoading || isGoogleAuthLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {error?.errors?.password && (
                      <p className="text-xs sm:text-sm text-red-600">
                        {error.errors.password[0]}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="pl-10 pr-10 w-full"
                        required
                        disabled={isRegisterLoading || isGoogleAuthLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isRegisterLoading || isGoogleAuthLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms and Privacy */}
                  <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white h-10 sm:h-11 text-sm sm:text-base shadow-sm mt-4 sm:mt-6"
                    disabled={isRegisterLoading || isGoogleAuthLoading}
                  >
                    {isRegisterLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Links */}
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  Sign in here
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
    </>
  );
}
