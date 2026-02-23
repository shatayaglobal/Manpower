"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import Link from "next/link";
import { useAuthState } from "@/lib/redux/redux";
import { useMessaging } from "@/lib/redux/use-messaging";
import { websocketActions } from "@/lib/redux/websocket-actions";
import Image from "next/image";
import { getCurrentUserThunk } from "@/lib/redux/authSlice";
import DashboardLayout from "@/components/dashboard-layout";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar({ children }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuthState();
  const dispatch = useDispatch<AppDispatch>();
  const { getUnreadCount } = useMessaging();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(getCurrentUserThunk());
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      getUnreadCount();
      dispatch(websocketActions.connect());
      const interval = setInterval(() => getUnreadCount(), 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, dispatch, getUnreadCount, user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isAuthenticated && !user) {
    return null;
  }

  if (isAuthenticated && user) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Navbar ── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200",
          scrolled
            ? "border-b border-gray-100 shadow-sm"
            : "border-b border-gray-100"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <Image
                  src="/shataya.jpeg"
                  alt="ShatayaGlobal"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span className="font-bold text-gray-900 text-sm hidden sm:block">
                ShatayaGlobal <span className="text-blue-600">Ltd</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold h-9 px-5 rounded-xl transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="md:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 mt-3 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full border border-gray-200 h-10 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl text-sm font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Page ── */}
      <main className="pt-16 flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <Image
                    src="/shataya.jpeg"
                    alt="Shataya Global"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  Shataya <span className="text-blue-600">Global</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                Empowering people.
                <br />
                Strengthening businesses.
              </p>
              <p className="text-xs text-gray-300">
                Hapelech 7, Tel Aviv, Israel
              </p>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Contact
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:Shatayaglobal@gmail.com"
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Shatayaglobal@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+972546126874"
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    +972 546 126 874
                  </a>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Platform
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  { href: "/jobs", label: "Find Jobs" },
                  { href: "/jobs/create", label: "Post a Job" },
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Follow Us
              </p>
              <div className="flex gap-2 flex-wrap">
                {[
                  {
                    href: "https://www.facebook.com/profile.php?id=61571282913432",
                    label: "Facebook",
                    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                  },
                  {
                    href: "https://www.linkedin.com/in/shataya-global-7a45b338b",
                    label: "LinkedIn",
                    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                  },
                  {
                    href: "https://www.instagram.com/shatayaglobal",
                    label: "Instagram",
                    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                  },
                  {
                    href: "https://www.tiktok.com/@shatayaglobal",
                    label: "TikTok",
                    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z",
                  },
                ].map(({ href, label, path }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-all group"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© 2025 Shataya Global Ltd. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link
                href="/privacy-policy"
                className="hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
