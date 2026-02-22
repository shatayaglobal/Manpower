"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { TermsCheckbox } from "@/components/terms-checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContactFormData {
  email_address: string;
  name: string;
  inquiry_type: string;
  title: string;
  subject: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    email_address: "",
    name: "",
    inquiry_type: "GENERAL",
    title: "",
    subject: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email_address.trim()) {
      newErrors.email_address = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      newErrors.email_address = "Please enter a valid email address";
    }
    if (!formData.title.trim()) newErrors.title = "Subject is required";
    if (!formData.subject.trim()) newErrors.subject = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setTermsError("");
    if (!termsAccepted) {
      setTermsError("You must accept the Terms and Conditions to send a message");
      return;
    }
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ email_address: "", name: "", inquiry_type: "GENERAL", title: "", subject: "" });
      setTermsAccepted(false);
    } catch {
      setErrors({ submit: "Failed to send message. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Message Sent!</h2>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Thanks for reaching out. We'll get back to you within 24 hours.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-7 rounded-xl font-semibold text-base"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">
                Get in Touch
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Contact <span className="text-blue-600">Our Team</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Have a question, a partnership idea, or need support? We&apos;re here
              and we respond fast. Reach out through the form or find us
              directly below.
            </p>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* ── Left: Contact Info ── */}
            <div className="flex flex-col gap-5">
              {/* Info card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-6">
                  Contact Details
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base mb-0.5">Email</p>
                      <p className="text-base text-gray-500">info@shatayaglobal.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base mb-0.5">Phone</p>
                      <p className="text-base text-gray-500">+972 54-612-6874</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base mb-0.5">Address</p>
                      <p className="text-base text-gray-500">Hapalekh Street 7, Tel Aviv, Israel</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account deletion card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">
                  Account Deletion
                </p>
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  Want to delete your account?
                </h3>
                <p className="text-base text-gray-500 leading-relaxed">
                  To request deletion of your Shataya account and associated
                  data, email us at{" "}
                  <a
                    href="mailto:shatayabuilding@gmail.com"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    shatayabuilding@gmail.com
                  </a>{" "}
                  with your account email address. We will process your request
                  within 30 days. All personal data including your profile,
                  messages, and application history will be permanently deleted.
                </p>
              </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-6">
                Send a Message
              </p>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-base text-red-700">{errors.submit}</p>
                </div>
              )}

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"
                    )}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email_address: e.target.value }))}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                      errors.email_address ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"
                    )}
                    placeholder="your@email.com"
                  />
                  {errors.email_address && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.email_address}</p>
                  )}
                </div>

                {/* Inquiry Type */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1.5">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.inquiry_type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, inquiry_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-colors"
                  >
                    <option value="GENERAL">General Inquiry</option>
                    <option value="SUPPORT">Technical Support</option>
                    <option value="BUSINESS">Business Partnership</option>
                    <option value="BUG_REPORT">Bug Report</option>
                    <option value="FEATURE_REQUEST">Feature Request</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
                      errors.title ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"
                    )}
                    placeholder="Brief subject line"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.title}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    rows={5}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors",
                      errors.subject ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"
                    )}
                    placeholder="Tell us how we can help..."
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.subject}</p>
                  )}
                </div>

                {/* Terms */}
                <TermsCheckbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    setTermsAccepted(checked);
                    if (checked && termsError) setTermsError("");
                  }}
                  error={termsError}
                />

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-semibold text-base disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
