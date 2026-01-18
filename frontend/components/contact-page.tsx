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
    // Clear previous terms error
    setTermsError("");

    // Validate terms acceptance first
    if (!termsAccepted) {
      setTermsError(
        "You must accept the Terms and Conditions to send a message"
      );
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Replace with actual API call: await contactAPI.submitContact(formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({
        email_address: "",
        name: "",
        inquiry_type: "GENERAL",
        title: "",
        subject: "",
      });
      setTermsAccepted(false); // Reset terms checkbox
    } catch {
      setErrors({ submit: "Failed to send message. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Message Sent!
          </h2>
          <p className="text-gray-600 mb-6">
            We&apos;ll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-gray-600">Get in touch with our team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">info@shatayaglobal.com</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">+972 54-612-6874</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">
                    Hapalekh Street 7, Tel Aviv, Israel
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Account Deletion Requests
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To request deletion of your Shataya account and associated data,
                please contact us at{" "}
                <a
                  href="mailto:shatayabuilding@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  shatayabuilding@gmail.com
                </a>{" "}
                with your account email address. We will process your request
                within 30 days. All personal data including your profile,
                messages, and application history will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Send Message
            </h2>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email_address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email_address: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email_address ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email_address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email_address}
                  </p>
                )}
              </div>

              {/* Inquiry Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inquiry Type
                </label>
                <select
                  value={formData.inquiry_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      inquiry_type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Brief subject"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.subject ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Your message..."
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <TermsCheckbox
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(checked);
                  if (checked && termsError) {
                    setTermsError("");
                  }
                }}
                error={termsError}
              />

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50"
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
