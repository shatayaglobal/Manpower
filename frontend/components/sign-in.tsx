"use client";

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
import AccountTypeModal from "@/components/account-type-modal";

interface GoogleCredentialResponse {
  credential: string;
}

interface AuthError {
  message?: string;
  googleLoginRequired?: boolean;
  status?: number;
}

interface AuthResult {
  success: boolean;
  error?: AuthError;
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleAuth, clearAuthError, resetLoading } = useAuthSlice();
  const { isLoginLoading, error, isAuthenticated, isGoogleAuthLoading, user } =
    useAuthState();

  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<
    string | null
  >(null);
  const [isGoogleButtonReady, setIsGoogleButtonReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const getRedirectUrl = useCallback((accountType?: string) => {
    if (accountType === "WORKER") {
      return "/worker-dashboard";
    }
    if (accountType === "BUSINESS") {
      return "/business";
    }
    return "/worker-dashboard";
  }, []);

  useEffect(() => {
    const registered = searchParams.get("registered");
    const loginSuccess = searchParams.get("loginSuccess");

    if (registered === "true" || loginSuccess === "true") {
      toast.success(
        registered === "true"
          ? "Registration successful! Please sign in."
          : "Welcome back!"
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("registered");
      url.searchParams.delete("loginSuccess");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user?.account_type) {
      const redirectUrl = getRedirectUrl(user.account_type);
      router.push(redirectUrl);
    }
  }, [isAuthenticated, user?.account_type, router, getRedirectUrl]);

  useEffect(() => {
    resetLoading();
    clearAuthError();
  }, [resetLoading, clearAuthError]);

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    const result = (await login(formData)) as AuthResult;

    if (result.success) {
      toast.success("Welcome back!");
      // The useEffect will handle the redirect when user data is loaded
    } else {
      const err = result.error;
      if (err?.googleLoginRequired) {
        toast.error(
          "This account was created with Google. Please use the Google button.",
          { duration: 7000 }
        );
      } else {
        toast.error(err?.message || "Login failed. Please try again.");
      }
    }
  };

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      const result = (await googleAuth({
        credential: response.credential,
        token: "",
      })) as AuthResult;

      if (result.success) {
        toast.success("Signed in with Google!");
        // The useEffect will handle the redirect when user data is loaded
      } else {
        const err = result.error;
        if (err?.status === 404) {
          setPendingGoogleCredential(response.credential);
          setShowAccountTypeModal(true);
        } else {
          toast.error(err?.message || "Google sign-in failed");
        }
      }
    },
    [googleAuth]
  );

  const handleAccountTypeSelect = async (type: "WORKER" | "BUSINESS") => {
    if (!pendingGoogleCredential) return;

    const result = (await googleAuth({
      credential: pendingGoogleCredential,
      token: "",
      account_type: type,
    })) as AuthResult;

    if (result.success) {
      setShowAccountTypeModal(false);
      setPendingGoogleCredential(null);
      toast.success(
        `Welcome to your ${type === "WORKER" ? "Worker" : "Business"} account!`
      );
      // The useEffect will handle the redirect when user data is loaded
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      type GoogleGIS = {
        accounts: {
          id: {
            initialize: (config: {
              client_id: string;
              callback: (resp: GoogleCredentialResponse) => void;
              auto_select?: boolean;
              cancel_on_tap_outside?: boolean;
            }) => void;
            renderButton: (
              el: HTMLElement,
              options: { theme: string; size: string; width?: string }
            ) => void;
          };
        };
      };

      const google = window.google as unknown as GoogleGIS | undefined;

      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        ["mobile", "desktop"].forEach((type) => {
          const el = document.getElementById(`google-signin-button-${type}`);
          if (el) {
            google.accounts.id.renderButton(el, {
              theme: "outline",
              size: "large",
              width: "100%",
            });
          }
        });

        setIsGoogleButtonReady(true);
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
        }}
        isLoading={isGoogleAuthLoading}
      />

      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/20 to-amber-50/15 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-gray-600">Sign in to continue</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>Choose your preferred method</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="lg:hidden">
                  <div
                    id="google-signin-button-mobile"
                    className={!isGoogleButtonReady ? "opacity-0" : ""}
                  />
                </div>
                <div className="hidden lg:block">
                  <div
                    id="google-signin-button-desktop"
                    className={!isGoogleButtonReady ? "opacity-0" : ""}
                  />
                </div>
                <p className="text-xs text-center text-gray-500">
                  Google sign-in creates a Worker account
                </p>
              </div>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500">
                  Or continue with email
                </span>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                autoComplete="on"
                method="post"
                action="#"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="email"
                      name="username"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-10"
                      autoComplete="username"
                      spellCheck="false"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-blue-600 hover:underline"
                      tabIndex={-1}
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-500 hover:bg-blue-600"
                  disabled={isLoginLoading || isGoogleAuthLoading}
                >
                  {isLoginLoading ? (
                    "Signing in..."
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

          <p className="text-center text-sm text-gray-600">
            No account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
