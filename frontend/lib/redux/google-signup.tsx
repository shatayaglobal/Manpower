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
import { CheckCircle, User, Building2 } from "lucide-react";

interface GoogleSignupSuccessProps {
  open: boolean;
  accountType: "WORKER" | "BUSINESS";
  onContinue: () => void;
}

export default function GoogleSignupSuccess({
  open,
  accountType,
  onContinue,
}: GoogleSignupSuccessProps) {
  const isWorker = accountType === "WORKER";

  return (
    <Dialog open={open} onOpenChange={onContinue}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Account Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Your {isWorker ? "Worker" : "Business"} account has been created
            with Google
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {isWorker ? (
                <User className="h-6 w-6 text-blue-600" />
              ) : (
                <Building2 className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                What&apos;s Next?
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {isWorker ? (
                  <>
                    <li>✓ Complete your professional profile</li>
                    <li>✓ Upload your resume</li>
                    <li>✓ Start browsing job opportunities</li>
                  </>
                ) : (
                  <>
                    <li>✓ Set up your company profile</li>
                    <li>✓ Post your first job opening</li>
                    <li>✓ Start receiving applications</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <Button
            onClick={onContinue}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-11"
          >
            Continue to Dashboard
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          You can update your account settings at any time
        </p>
      </DialogContent>
    </Dialog>
  );
}
