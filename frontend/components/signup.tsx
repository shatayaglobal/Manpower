"use client";

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
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useAuthSlice } from "@/lib/redux/use-auth";
import { useAuthState } from "@/lib/redux/redux";
import { toast } from "sonner";
import { AuthError, GoogleCredentialResponse } from "@/lib/types";
import AccountTypeModal from "@/components/account-type-modal";

type GoogleGIS = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }) => void;
      renderButton: (element: HTMLElement, options: {
        theme?: "outline" | "filled_blue" | "filled_black";
        size?: "large" | "medium" | "small";
        text?: "signin_with" | "signup_with" | "continue_with" | "signin";
        width?: string;
      }) => void;
    };
  };
};

export default function SignUpPage() {
  const router = useRouter();
  const { register, googleAuth, clearAuthError, clearAuthSuccessStates } = useAuthSlice();
  const { isRegisterLoading, error, isAuthenticated, isGoogleAuthLoading } = useAuthState();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    account_type: "",
  });

  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColor = passwordStrength <= 2 ? "bg-red-500" : passwordStrength === 3 ? "bg-yellow-500" : "bg-green-500";
  const strengthText = passwordStrength <= 2 ? "Weak" : passwordStrength === 3 ? "Medium" : "Strong";

  useEffect(() => {
    if (isAuthenticated) router.push("/home");
  }, [isAuthenticated, router]);

  useEffect(() => {
    clearAuthError();
    clearAuthSuccessStates();
  }, [clearAuthError, clearAuthSuccessStates]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearAuthError();
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

    const result = await register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      password_confirm: formData.confirmPassword,
      account_type: formData.account_type as "WORKER" | "BUSINESS",
    });

    if (result.success) {
      sessionStorage.setItem("verification_email", formData.email);
      router.push("/verify-email-sent");
    } else {
      const err = result.error as AuthError;
      if (err?.errors) {
        const firstField = Object.keys(err.errors)[0] as keyof typeof err.errors;
        toast.error(err.errors[firstField][0]);
      } else {
        toast.error(err?.message || "Registration failed");
      }
    }
  };

  const handleCredentialResponse = useCallback((response: GoogleCredentialResponse) => {
    setPendingGoogleCredential(response.credential);
    setShowAccountTypeModal(true);
  }, []);

  const handleAccountTypeSelect = async (accountType: "WORKER" | "BUSINESS") => {
    if (!pendingGoogleCredential) return;

    const result = await googleAuth({
      credential: pendingGoogleCredential,
      token: "",
      account_type: accountType,
    });

    if (result.success) {
      setShowAccountTypeModal(false);
      setPendingGoogleCredential(null);
      toast.success(`Welcome to your ${accountType === "WORKER" ? "Worker" : "Business"} account!`);
      setTimeout(() => router.push("/home"), 100);
    } else {
      toast.error("Google sign-up failed. Please try again.");
      setShowAccountTypeModal(false);
      setPendingGoogleCredential(null);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      const google = window.google as unknown as GoogleGIS | undefined;

      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const renderButton = (id: string) => {
          const container = document.getElementById(id);
          if (!container) return;

          const width = container.parentElement?.offsetWidth || 400;

          google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: width.toString(),
            text: "signup_with",
          });
        };

        renderButton("google-signup-button-mobile");
        renderButton("google-signup-button-desktop");
      }
    };

    return () => {
      document.head.contains(script) && document.head.removeChild(script);
    };
  }, [handleCredentialResponse]);

  return (
    <>
      <AccountTypeModal
        open={showAccountTypeModal}
        onSelect={handleAccountTypeSelect}
        onCancel={() => {
          setShowAccountTypeModal(false);
          setPendingGoogleCredential(null);
          toast.info("Google sign-up cancelled.");
        }}
        isLoading={isGoogleAuthLoading}
      />

      <div className="bg-gradient-to-br from-white via-slate-50/20 to-amber-50/15 min-h-screen">
        <div className="flex items-center justify-center min-h-screen py-8 px-4">
          <div className="w-full max-w-3xl space-y-6">
            <div className="text-center space-y-3">
              <h1 className="font-bold text-3xl text-gray-900">Create Your Account</h1>
              <p className="text-base text-gray-600">
                Join thousands of professionals connecting talent with opportunity
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>Choose your account type and get started</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}

                {/* Google Button */}
                <div className="space-y-4">
                  <div className="px-4 lg:hidden">
                    <div id="google-signup-button-mobile" className="w-full min-h-[50px]" />
                  </div>
                  <div className="hidden lg:block">
                    <div className="max-w-md mx-auto translate-x-12">
                      <div id="google-signup-button-desktop" className="w-full min-h-[50px]" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    You&apos;ll choose your account type after signing in with Google
                  </p>
                </div>

                <Separator>
                  <span className="bg-white px-3 text-sm text-gray-500">Or continue with email</span>
                </Separator>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Account Type - Full Width */}
                  <div className="space-y-2">
                    <Label htmlFor="account-type" className="text-sm font-medium">
                      Account Type
                    </Label>
                    <Select
                      value={formData.account_type}
                      onValueChange={(v) => handleInputChange("account_type", v)}
                    >
                      <SelectTrigger id="account-type" className="w-full">
                        <SelectValue placeholder="Choose your account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WORKER">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Worker - Looking for opportunities</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="BUSINESS">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>Business - Hiring talent</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name" className="text-sm font-medium">
                        First Name
                      </Label>
                      <Input
                        id="first-name"
                        value={formData.first_name}
                        onChange={e => handleInputChange("first_name", e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="last-name"
                        value={formData.last_name}
                        onChange={e => handleInputChange("last_name", e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={e => handleInputChange("email", e.target.value)}
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={e => handleInputChange("password", e.target.value)}
                        placeholder="Create a strong password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${strengthColor}`} style={{ width: `${(passwordStrength / 5) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{strengthText}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        value={formData.confirmPassword}
                        onChange={e => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className="flex items-center gap-2 mt-2">
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-11 bg-blue-500 hover:bg-blue-600" disabled={isRegisterLoading}>
                    {isRegisterLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
