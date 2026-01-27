"use client";

import type React from "react";
import { useState } from "react";
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
  UserCheck,
  MessageCircle,
  Clock,
  Menu,
  Bell,
  FileText,
  X,
  Search,
  LayoutDashboard,
  Users,
  FolderKanban,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useAuthState } from "@/lib/redux/redux";
import { useAuthSlice } from "@/lib/redux/use-auth";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { useMessaging } from "@/lib/redux/use-messaging";
import Image from "next/image";
import { InvitationBadge } from "./staff-notification-invitation-badge";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Add proper type definitions
interface SubNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  subItems?: SubNavItem[];
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthState();
  const { logout } = useAuthSlice();
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useMessaging();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    if (user.first_name) return user.first_name;
    if (user.email) return user.email.split("@")[0];
    return "User";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(
        0
      )}`.toUpperCase();
    }
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const isBusinessUser = user?.account_type === "BUSINESS";
  const isWorkerUser = user?.account_type === "WORKER";

  const businessNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/business",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Jobs",
      icon: <Briefcase className="h-5 w-5" />,
      subItems: [
        {
          label: "Manage Jobs",
          href: "/jobs",
          icon: <FolderKanban className="h-4 w-4" />,
        },
        {
          label: "Post New Job",
          href: "/jobs/create",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          label: "Applications",
          href: "/manage-applications",
          icon: <UserCheck className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "Workforce",
      icon: <Users className="h-5 w-5" />,
      subItems: [
        {
          label: "Staff Management",
          href: "/staff",
          icon: <UserCheck className="h-4 w-4" />,
        },
        {
          label: "Shift Scheduling",
          href: "/shifts",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          label: "Hours & Attendance",
          href: "/hours",
          icon: <Clock className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "Messages",
      href: "/messages",
      icon: <MessageCircle className="h-5 w-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const workerNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/worker-dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Jobs",
      icon: <Search className="h-5 w-5" />,
      subItems: [
        {
          label: "Search Jobs",
          href: "/jobs",
          icon: <Search className="h-4 w-4" />,
        },
        {
          label: "My Applications",
          href: "/jobs/job-applications",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          label: "Saved Jobs",
          href: "/jobs/saved",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "My Work",
      icon: <Clock className="h-5 w-5" />,
      subItems: [
        {
          label: "Clock In/Out",
          href: "/worker-dashboard",
          icon: <Clock className="h-4 w-4" />,
        },
        {
          label: "My Hours",
          href: "/my-hours",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          label: "My Shifts",
          href: "/my-shifts",
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "Messages",
      href: "/messages",
      icon: <MessageCircle className="h-5 w-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: "Invitations",
      href: "/invitations",
      icon: <Bell className="h-5 w-5" />,
    },
  ];

  const navItems = isBusinessUser ? businessNavItems : workerNavItems;

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const [isOpen, setIsOpen] = useState(() => {
      if (item.subItems) {
        return item.subItems.some((sub) => pathname === sub.href);
      }
      return false;
    });

    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = item.href ? pathname === item.href : false;
    const hasActiveChild =
      hasSubItems && item.subItems?.some((sub) => pathname === sub.href);

    // Collapsed view - only show icons
    if (sidebarCollapsed) {
      if (hasSubItems) {
        return (
          <div className="relative group">
            <button
              className={cn(
                "flex items-center justify-center w-full p-3 rounded-lg transition-all duration-200",
                hasActiveChild
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span
                className={cn(
                  "transition-colors",
                  hasActiveChild
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-700"
                )}
              >
                {item.icon}
              </span>
              {item.badge && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              {item.label}
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          </div>
        );
      }

      return (
        <div className="relative group">
          <Link
            href={item.href!}
            className={cn(
              "flex items-center justify-center w-full p-3 rounded-lg transition-all duration-200 relative",
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <span
              className={cn(
                "transition-colors",
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 group-hover:text-gray-700"
              )}
            >
              {item.icon}
            </span>
            {item.badge && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </Link>
          {/* Tooltip on hover */}
          <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            {item.label}
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      );
    }

    // Expanded view - show full labels
    if (hasSubItems) {
      return (
        <div className="space-y-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 group",
              hasActiveChild
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "transition-colors",
                  hasActiveChild
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-700"
                )}
              >
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-all duration-200",
                isOpen ? "rotate-90" : "rotate-0",
                hasActiveChild ? "text-blue-600" : "text-gray-400"
              )}
            />
          </button>

          {isOpen && (
            <div className="ml-3 pl-5 border-l-2 border-gray-200 space-y-0.5 py-1">
              {item.subItems?.map((subItem) => {
                const isSubActive = pathname === subItem.href;
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      isSubActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span
                      className={cn(
                        "transition-colors",
                        isSubActive ? "text-blue-600" : "text-gray-400"
                      )}
                    >
                      {subItem.icon}
                    </span>
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href!}
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group",
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-50"
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "transition-colors",
              isActive
                ? "text-blue-600"
                : "text-gray-500 group-hover:text-gray-700"
            )}
          >
            {item.icon}
          </span>
          <span className="font-medium text-sm">{item.label}</span>
        </div>
        {item.badge && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center font-medium">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center gap-3">
            {/* Desktop Hamburger Menu - Always visible */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>

            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white">
                <Image
                  src="/shataya.jpeg"
                  alt="ShatayaGlobal Ltd"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span className="font-semibold text-lg text-gray-900 hidden sm:block">
                ShatayaGlobal
              </span>
            </Link>
          </div>

          {/* Right side - Notifications and User menu */}
          <div className="flex items-center gap-3">
            {isWorkerUser && <InvitationBadge />}

            {/* Notifications Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 rounded-lg"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2.5 px-2 py-1 hover:bg-gray-100 h-10 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                    {getUserInitials()}
                  </div>
                  <span className="text-gray-700 font-medium hidden md:block text-sm max-w-[100px] truncate">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  {user?.account_type && (
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                      {user.account_type.toLowerCase()} Account
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={
                      user?.account_type === "BUSINESS"
                        ? "/business-profile"
                        : "/profile"
                    }
                    className="flex items-center gap-2 py-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 py-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer flex items-center gap-2 py-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavItemComponent key={index} item={item} />
          ))}
        </nav>
        {sidebarCollapsed && (
          <div className="p-4 border-t border-gray-100 flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {getUserInitials()}
            </div>
          </div>
        )}
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white">
                  <Image
                    src="/shataya.jpeg"
                    alt="ShatayaGlobal Ltd"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-lg text-gray-900">
                  ShatayaGlobal
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item, index) => (
                <NavItemComponent key={index} item={item} />
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
