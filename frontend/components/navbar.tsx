"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuthState();
  const { logout } = useAuthSlice();
  const router = useRouter();
  const dispatch = useDispatch();
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
    if (isAuthenticated && user) {
      getUnreadCount();
      dispatch(websocketActions.connect());
      const interval = setInterval(() => {
        getUnreadCount();
      }, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, dispatch, user, getUnreadCount]);

  return (
    <div className="min-h-screen bg-white mt-4">
      {/* Header/Navbar */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md sm:max-w-2xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full overflow-hidden shadow-sm border-2 border-white bg-white">
                <Image
                  src="/shataya.jpeg"
                  alt="ShatayaGlobal Ltd"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span className="font-semibold text-lg sm:text-xl text-gray-900">
                ShatayaGlobal Ltd
              </span>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 sm:space-x-6">
              {isAuthenticated ? (
                <>
                  {isBusinessUser && (
                    <>
                      <Link
                        href="/jobs"
                        className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm sm:text-base flex items-center gap-1"
                      >
                        Manage Jobs
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm sm:text-base flex items-center gap-1">
                            Business
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
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
                          <DropdownMenuItem asChild>
                            <Link
                              href="/business"
                              className="flex items-center"
                            >
                              <Building className="mr-2 h-4 w-4" />
                              My Business
                            </Link>
                          </DropdownMenuItem>
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
                        className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm sm:text-base flex items-center gap-1"
                      >
                        <Building className="h-4 w-4" />
                        Browse Companies
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm sm:text-base flex items-center gap-1">
                            Jobs & Applications
                            <ChevronDown className="h-3 w-3" />
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
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm sm:text-base flex items-center gap-1 relative"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 sm:h-5 w-4 sm:w-5 flex items-center justify-center min-w-[1.25rem]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm sm:text-base flex items-center gap-1"
                  >
                    Blog
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm sm:text-base"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-blue-500 transition-colors font-medium text-sm sm:text-base"
                  >
                    Contact
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <DropdownMenu
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isAuthenticated ? (
                    <>
                      {isBusinessUser && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/jobs" className="flex items-center">
                              Manage Jobs
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href="/post-job"
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
                          <DropdownMenuItem asChild>
                            <Link
                              href="/business"
                              className="flex items-center"
                            >
                              <Building className="mr-2 h-4 w-4" />
                              My Business
                            </Link>
                          </DropdownMenuItem>
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
                        </>
                      )}
                      {isWorkerUser && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/companies"
                              className="flex items-center"
                            >
                              <Building className="mr-2 h-4 w-4" />
                              Browse Companies
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/messages"
                          className="flex items-center relative"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Messages
                          {unreadCount > 0 && (
                            <span className="absolute left-6 top-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/blog" className="flex items-center">
                          Blog
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/about" className="flex items-center">
                          About
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/contact" className="flex items-center">
                          Contact
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Authentication Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 hover:bg-gray-100"
                    >
                      <div className="w-7 sm:w-8 h-7 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                        {getUserInitials()}
                      </div>
                      <span className="text-gray-700 font-medium hidden sm:block text-sm sm:text-base">
                        {getUserDisplayName()}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
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
                <>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-blue-500 text-sm sm:text-base px-2 sm:px-3"
                    asChild
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 text-sm sm:text-base shadow-sm"
                    asChild
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="py-8 sm:py-12">{children}</main>

      <footer className="bg-white border-t border-gray-200 py-12 sm:py-16">
        <div className="max-w-md sm:max-w-2xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Logo and Description - Full width on mobile */}
            <div className="col-span-2 space-y-3 sm:space-y-4 text-center md:text-left md:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 justify-center md:justify-start">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full overflow-hidden shadow-sm border-2 border-white bg-white">
                  <Image
                    src="/shataya.jpeg"
                    alt="ShatayaGlobal Ltd"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-base sm:text-lg text-gray-900">
                  ShatayaGlobal Ltd
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Connecting talent with opportunity through innovative workforce
                solutions.
              </p>
            </div>

            {/* For Job Seekers */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">
                For Job Seekers
              </h3>
              <ul className="space-y-2 text-gray-600 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/companies"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Browse Companies
                  </Link>
                </li>
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
                    href="/profile"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Career Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Employers */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">
                For Employers
              </h3>
              <ul className="space-y-2 text-gray-600 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/post-job"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Post Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Find Talent
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shifts"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Workforce Solutions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support - Now properly aligned */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">
                Support
              </h3>
              <ul className="space-y-2 text-gray-600 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-blue-500 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
            <p>&copy; 2025 ShatayaGlobal Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
