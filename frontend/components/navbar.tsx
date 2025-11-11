"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Briefcase,
  Calendar,
  Building,
  UserCheck,
  Search,
  MessageCircle,
  Clock,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useAuthState } from "@/lib/redux/redux";
import { useAuthSlice } from "@/lib/redux/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMessaging } from "@/lib/redux/use-messaging";
import { websocketActions } from "@/lib/redux/websocket-actions";
import Image from "next/image";
import { getCurrentUserThunk } from "@/lib/redux/authSlice";

interface AppLayoutProps {
  children: React.ReactNode;
}

type MobileNavAccordionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

function MobileNavAccordion({
  title,
  icon,
  children,
}: MobileNavAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="pb-2">{children}</div>
      </div>
    </div>
  );
}

type MobileNavItemProps = {
  href: string;
  children: React.ReactNode;
};

function MobileNavItem({ href, children }: MobileNavItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 py-2 px-8 text-sm text-gray-600 hover:text-blue-500 transition"
    >
      {children}
    </Link>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuthState();
  const { logout } = useAuthSlice();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { unreadCount, getUnreadCount } = useMessaging();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Error logging out");
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "";

    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }

    if (user.first_name) {
      return user.first_name;
    }

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  const getUserInitials = () => {
    if (!user) return "U";

    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(
        0
      )}`.toUpperCase();
    }

    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  const isBusinessUser = user?.account_type === "BUSINESS";
  const isWorkerUser = user?.account_type === "WORKER";

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
              {isAuthenticated ? (
                <>
                  {isBusinessUser && (
                    <>
                      <Link
                        href="/business"
                        className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm flex items-center gap-1"
                      >
                        <Building className="h-4 w-4" />
                        My Business
                      </Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm flex items-center gap-1">
                            Jobs
                            <ChevronDown className="h-3 w-3 opacity-70" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href="/jobs" className="flex items-center">
                              <Briefcase className="mr-2 h-4 w-4" />
                              Manage Jobs
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/jobs/create"
                              className="flex items-center"
                            >
                              <Briefcase className="mr-2 h-4 w-4" />
                              Post New Job
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/manage-applications"
                              className="flex items-center"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Manage Applications
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm flex items-center gap-1">
                            Workforce
                            <ChevronDown className="h-3 w-3 opacity-70" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href="/staff" className="flex items-center">
                              <UserCheck className="mr-2 h-4 w-4" />
                              Staff Management
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/shifts" className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              Shift Scheduling
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/hours" className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              Hours & Attendance
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                  {isWorkerUser && (
                    <>
                      <Link
                        href="/companies"
                        className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm flex items-center gap-1"
                      >
                        <Building className="h-4 w-4" />
                        Companies
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm flex items-center gap-1 min-w-fit">
                            Jobs
                            <ChevronDown className="h-3 w-3 flex-shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href="/jobs" className="flex items-center">
                              <Search className="mr-2 h-4 w-4" />
                              Search All Jobs
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/jobs/job-applications"
                              className="flex items-center"
                            >
                              <Briefcase className="mr-2 h-4 w-4" />
                              My Applications
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/jobs/saved"
                              className="flex items-center"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Saved Jobs
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                  <Link
                    href="/messages"
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm flex items-center gap-1 relative"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden xl:inline">Messages</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm"
                  >
                    Blog
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
            </nav>

            {/* Right side - Auth/Profile + Mobile Menu */}
            <div className="flex items-center gap-2">
              {/* Authentication Section */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 h-10"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getUserInitials()}
                      </div>
                      <span className="text-gray-700 font-medium hidden md:block text-sm max-w-[100px] truncate">
                        {getUserDisplayName()}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      {user.account_type && (
                        <p className="text-xs text-blue-500 capitalize mt-1">
                          {user.account_type.toLowerCase()} Account
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2">
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
              )}

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <DropdownMenu
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64">
                    {isAuthenticated ? (
                      <>
                        {/* USER PROFILE HEADER */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email || "No email"}
                          </p>
                        </div>

                        {/* BUSINESS USER: My Business */}
                        {isBusinessUser && (
                          <DropdownMenuItem asChild>
                            <Link
                              href="/business"
                              className="flex items-center gap-2 py-2 px-4 text-sm"
                            >
                              <Building className="h-4 w-4" />
                              My Business
                            </Link>
                          </DropdownMenuItem>
                        )}

                        {/* JOBS SECTION (accordion) */}
                        <MobileNavAccordion
                          title="Jobs"
                          icon={<Briefcase className="h-4 w-4" />}
                        >
                          {isBusinessUser && (
                            <>
                              <MobileNavItem href="/jobs">
                                Manage Jobs
                              </MobileNavItem>
                              <MobileNavItem href="/jobs/create">
                                Post New Job
                              </MobileNavItem>
                              <MobileNavItem href="/manage-applications">
                                Manage Applications
                              </MobileNavItem>
                            </>
                          )}
                          {isWorkerUser && (
                            <>
                              <MobileNavItem href="/jobs">
                                Search All Jobs
                              </MobileNavItem>
                              <MobileNavItem href="/jobs/job-applications">
                                My Applications
                              </MobileNavItem>
                              <MobileNavItem href="/jobs/saved">
                                Saved Jobs
                              </MobileNavItem>
                            </>
                          )}
                        </MobileNavAccordion>

                        {/* WORKFORCE SECTION (only business) */}
                        {isBusinessUser && (
                          <MobileNavAccordion
                            title="Workforce"
                            icon={<UserCheck className="h-4 w-4" />}
                          >
                            <MobileNavItem href="/staff">
                              Staff Management
                            </MobileNavItem>
                            <MobileNavItem href="/shifts">
                              Shift Scheduling
                            </MobileNavItem>
                            <MobileNavItem href="/hours">
                              Hours & Attendance
                            </MobileNavItem>
                          </MobileNavAccordion>
                        )}

                        {/* MESSAGES */}
                        <DropdownMenuItem asChild>
                          <Link
                            href="/messages"
                            className="flex items-center justify-between py-2 px-4 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Messages
                            </div>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </Link>
                        </DropdownMenuItem>

                        {/* BLOG */}
                        <DropdownMenuItem asChild>
                          <Link
                            href="/blog"
                            className="flex items-center gap-2 py-2 px-4 text-sm"
                          >
                            Blog
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* PROFILE & SETTINGS */}
                        <DropdownMenuItem asChild>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 py-2 px-4 text-sm"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 py-2 px-4 text-sm"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>

                        {/* LOGOUT */}
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="flex items-center gap-2 py-2 px-4 text-sm text-red-600"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/home"
                            className="flex items-center py-2 px-4 text-sm"
                          >
                            Home
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/about"
                            className="flex items-center py-2 px-4 text-sm"
                          >
                            About
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/contact"
                            className="flex items-center py-2 px-4 text-sm"
                          >
                            Contact
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/login"
                            className="flex items-center py-2 px-4 text-sm"
                          >
                            Sign In
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/signup"
                            className="flex items-center py-2 px-4 text-sm text-blue-500 font-medium"
                          >
                            Get Started
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
