"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Building2, CheckCircle } from "lucide-react";

interface AccountTypeModalProps {
  open: boolean;
  onSelect: (accountType: "WORKER" | "BUSINESS") => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AccountTypeModal({
  open,
  onSelect,
  onCancel,
  isLoading = false,
}: AccountTypeModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && !isLoading && onCancel()}
    >
      {/* Mobile: compact + scrollable | Desktop: original wide layout */}
      <DialogContent
        className="
          /* Mobile */
          w-[95vw] max-w-full mx-auto p-3
          max-h-[85vh] overflow-y-auto

          /* Desktop – restores your original styling */
          sm:max-w-[600px] sm:p-6 sm:max-h-none
        "
      >
        {/* Header – mobile smaller, desktop original */}
        <DialogHeader className="text-center pb-3 sm:pb-0">
          <DialogTitle className="text-lg sm:text-2xl font-bold">
            Choose Your Account Type
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-base pt-1 sm:pt-2 text-gray-600">
            Select the type of account you want to create with Google
          </DialogDescription>
        </DialogHeader>

        {/* Grid – mobile: 1 col, desktop: 2 col (original) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-6">
          {/* ==================== WORKER CARD ==================== */}
          <Card
            className="relative cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-500 group overflow-hidden"
            onClick={() => !isLoading && onSelect("WORKER")}
          >
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>

              {/* Title + Subtitle */}
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-xl font-semibold text-gray-900">
                  Worker
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 px-1">
                  Looking for job opportunities and career growth
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                {[
                  "Browse and apply to jobs",
                  "Create professional profile",
                  "Get job recommendations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                className="w-full h-9 sm:h-auto text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Continue as Worker"}
              </Button>
            </div>
          </Card>

          {/* ==================== BUSINESS CARD ==================== */}
          <Card
            className="relative cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-amber-500 group overflow-hidden"
            onClick={() => !isLoading && onSelect("BUSINESS")}
          >
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-amber-100 transition-colors">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>

              {/* Title + Subtitle */}
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-xl font-semibold text-gray-900">
                  Business
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 px-1">
                  Hiring talented professionals for your company
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                {[
                  "Post job opportunities",
                  "Access talent pool",
                  "Manage applications",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                className="w-full h-9 sm:h-auto text-sm sm:text-base bg-amber-500 hover:bg-amber-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Continue as Business"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4 px-2">
          You can always change your account type later in settings
        </p>
      </DialogContent>
    </Dialog>
  );
}
