"use client";

import type React from "react";
import { useEffect } from "react";
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
  Users,
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
} from "lucide-react";
import Link from "next/link";
import { useAuthState } from "@/lib/redux/redux";
import { useAuthSlice } from "@/lib/redux/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMessaging } from "@/lib/redux/use-messaging";
import { websocketActions } from "@/lib/redux/websocket-actions";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuthState();
  const { logout } = useAuthSlice();
  const router = useRouter();
  const dispatch = useDispatch();
  const { unreadCount, getUnreadCount } = useMessaging();

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

      return () => {
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, user?.id, dispatch, user, getUnreadCount]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-xl text-gray-900">
                ShatayaGlobal Ltd
              </span>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                // Authenticated Navigation
                <>
                  {/* Business User Navigation */}
                  {/* Business User Navigation */}
                  {isBusinessUser && (
                    <>
                      <Link
                        href="/jobs"
                        className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
                      >
                        Manage Jobs
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
                            Business
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}

                  {/* Worker User Navigation */}
                  {isWorkerUser && (
                    <>
                      <Link
                        href="/companies"
                        className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
                      >
                        <Building className="h-4 w-4" />
                        Browse Companies
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
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

                  {/* Common authenticated links */}
                  <Link
                    href="/messages"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1 relative"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[1.25rem]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
                  >
                    Blog
                  </Link>
                </>
              ) : (
                // Unauthenticated Navigation
                <>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    Contact
                  </Link>
                </>
              )}
            </nav>

            {/* Authentication Section */}
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                // Authenticated User Menu
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getUserInitials()}
                      </div>
                      <span className="text-gray-700 font-medium hidden sm:block">
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
                        <p className="text-xs text-blue-600 capitalize mt-1">
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
                // Unauthenticated User Buttons
                <>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-blue-600"
                    asChild
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 shadow-sm"
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

      <main>{children}</main>

      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-gray-900">
                  ShatayaGlobal Ltd
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connecting talent with opportunity through innovative workforce
                solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                For Job Seekers
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <Link
                    href="/companies"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Browse Companies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="hover:text-yellow-600 transition-colors"
                  >
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Career Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                For Employers
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <Link
                    href="/post-job"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Post Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff"
                    className="hover:text-yellow-600 transition-colors"
                  >
                    Find Talent
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shifts"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Workforce Solutions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-yellow-600 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 ShatayaGlobal Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
