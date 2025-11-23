"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthSlice } from "@/lib/redux/use-auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmPasswordReset } = useAuthSlice();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      toast.error("Invalid or missing reset token");
      router.push("/forgot-password");
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, router]);

  const validatePassword = (pwd: string): boolean => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);

    if (!minLength) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (!hasUpperCase) {
      toast.error("Password must contain at least one uppercase letter");
      return false;
    }
    if (!hasLowerCase) {
      toast.error("Password must contain at least one lowercase letter");
      return false;
    }
    if (!hasNumber) {
      toast.error("Password must contain at least one number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setIsLoading(true);

    try {
      const result = await confirmPasswordReset(token, password);

      if (result.success) {
        setPasswordReset(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error("Failed to reset password. The link may have expired.");
      }
    } catch  {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor =
    passwordStrength <= 2
      ? "bg-red-500"
      : passwordStrength === 3
        ? "bg-yellow-500"
        : "bg-green-500";
  const strengthText =
    passwordStrength <= 2
      ? "Weak"
      : passwordStrength === 3
        ? "Medium"
        : "Strong";

  if (passwordReset) {
    return (
      <div className="bg-gradient-to-br from-white via-slate-50/20 to-amber-50/15 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg bg-white">
            {/* Success Icon */}
            <div className="flex justify-center pt-8 pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            {/* Header */}
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Password Reset Successful!
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-2">
                Your password has been successfully reset. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>

            {/* Content */}
            <CardContent>
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="bg-gradient-to-br from-white via-slate-50/20 to-amber-50/15 min-h-screen flex items-center justify-center px-4 py-8 -mt-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <Card className="border-0 shadow-lg bg-white">
          {/* Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Header */}
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-2">
              Please enter your new password below.
            </CardDescription>
          </CardHeader>

          {/* Form */}
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strengthColor}`}
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {strengthText}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Match Indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-1.5">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600">
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">
                          Passwords do not match
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Password must contain:
                </p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    One number
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading || !token}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
