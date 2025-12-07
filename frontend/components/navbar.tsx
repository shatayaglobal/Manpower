"use client";

import type React from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthState } from "@/lib/redux/redux";
import { useMessaging } from "@/lib/redux/use-messaging";
import { websocketActions } from "@/lib/redux/websocket-actions";
import Image from "next/image";
import { getCurrentUserThunk } from "@/lib/redux/authSlice";
import DashboardLayout from "@/components/dashboard-layout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuthState();
  const dispatch = useDispatch<AppDispatch>();
  const { getUnreadCount } = useMessaging();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCurrentUserThunk());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      getUnreadCount();
      dispatch(websocketActions.connect());

      const interval = setInterval(() => {
        getUnreadCount();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, dispatch, getUnreadCount, user]);

  // If user is authenticated, use dashboard layout
  if (isAuthenticated && user) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Otherwise, use public website layout
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar - Fixed positioning */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 flex-shrink-0"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-white bg-white">
                <Image
                  src="/shataya.jpeg"
                  alt="ShatayaGlobal Ltd"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span className="font-semibold text-base sm:text-lg lg:text-xl text-gray-900">
                ShatayaGlobal Ltd
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link
                href="/home"
                className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm"
              >
                Contact
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm"
              >
                Blog
              </Link>
            </nav>

            {/* Right side - Auth buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-blue-500 text-sm px-3"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 text-sm shadow-sm"
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Add padding top to account for fixed header */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4 text-center md:text-left">
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-white bg-white">
                  <Image
                    src="/shataya.jpeg"
                    alt="Shataya Global"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-lg text-gray-900">
                  Shataya Global
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                Empowering people. Strengthening businesses.
              </p>
              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <p className="leading-relaxed">Hapelech 7, Tel Aviv, Israel</p>
                <p className="text-gray-500">Serving clients worldwide</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4">
                Contact Us
              </h3>
              <ul className="space-y-3 text-gray-600 text-xs sm:text-sm">
                <li>
                  <a
                    href="mailto:Shatayaglobal@gmail.com"
                    className="hover:text-blue-500 transition-colors block"
                  >
                    Shatayaglobal@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+972546126874"
                    className="hover:text-blue-500 transition-colors block"
                  >
                    +972 546126874
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 text-gray-600 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/jobs"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/post-job"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-blue-500 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4">
                Follow Us
              </h3>
              <div className="flex gap-3 justify-center md:justify-start">
                <a
                  href="https://www.facebook.com/profile.php?id=61571282913432"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-500 flex items-center justify-center transition-colors group"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/shataya-global-7a45b338b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-500 flex items-center justify-center transition-colors group"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/shatayaglobal?igsh=MXRnMnUxcXp2ODBoMg%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-yellow-400 flex items-center justify-center transition-colors group"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@shatayaglobal?_t=ZS-90rgJ7P7OMa&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-900 flex items-center justify-center transition-colors group"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 mt-10 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
            <p>&copy; 2025 Shataya Global. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
