"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TermsDialog({ trigger, open, onOpenChange }: TermsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read our terms and conditions carefully
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
              <p className="text-gray-600">
                By accessing and using Shataya Global platform, you accept and agree to be bound by
                the terms and provision of this agreement. If you do not agree to these terms,
                please do not use our service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. User Accounts</h3>
              <p className="text-gray-600">
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account. You agree to notify us
                immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. User Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Update your information to keep it current and accurate</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Service Usage</h3>
              <p className="text-gray-600">
                Our platform connects workers with businesses for employment opportunities.
                Users agree to use the service only for lawful purposes and in accordance with
                these terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Privacy Policy</h3>
              <p className="text-gray-600">
                Your use of our service is also governed by our Privacy Policy. We collect,
                use, and protect your personal information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Prohibited Activities</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Posting false or misleading information</li>
                <li>Impersonating another person or entity</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Attempting to gain unauthorized access to the platform</li>
                <li>Using the service for illegal purposes</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Intellectual Property</h3>
              <p className="text-gray-600">
                All content, features, and functionality of our service are owned by Shataya Global
                and are protected by international copyright, trademark, and other intellectual
                property laws.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Termination</h3>
              <p className="text-gray-600">
                We reserve the right to suspend or terminate your account at any time for violations
                of these terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Limitation of Liability</h3>
              <p className="text-gray-600">
                Shataya Global shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use or inability to use
                the service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Changes to Terms</h3>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. We will notify users of
                any material changes. Your continued use of the service after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. Contact Information</h3>
              <p className="text-gray-600">
                If you have any questions about these Terms and Conditions, please contact us
                through our contact form or email us at support@shatayaglobal.com.
              </p>
            </section>

            <p className="text-xs text-gray-500 mt-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
