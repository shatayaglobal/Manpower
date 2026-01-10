"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { TermsDialog } from "./terms-dialog";
import { Checkbox } from "./ui/checkbox";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
}

export function TermsCheckbox({
  checked,
  onCheckedChange,
  required = true,
  error
}: TermsCheckboxProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={onCheckedChange}
          required={required}
          className="mt-1"
        />
        <Label
          htmlFor="terms"
          className="text-sm font-normal leading-relaxed cursor-pointer"
        >
          I agree to the{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setDialogOpen(true);
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            Terms and Conditions
          </button>
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <TermsDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
