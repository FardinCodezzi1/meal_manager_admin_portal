"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Compass,
  Sliders,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn.util";
import { useSidebar } from "@/layout/SidebarContext";
import { useAuth } from "@/providers/AuthProvider";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Users Management", href: "/users", icon: Users },
  { title: "Messes Directory", href: "/messes", icon: Building2 },
  { title: "Tours Oversight", href: "/tours", icon: Compass },
  { title: "System Controls", href: "/settings", icon: Sliders },
  { title: "My Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div
          onClick={toggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 md:static",
          collapsed
            ? "-translate-x-full md:translate-x-0 md:w-16"
            : "translate-x-0 w-64"
        )}
      >
        {/* Header / Brand */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border transition-all duration-300",
            collapsed ? "justify-center px-2" : "justify-between px-3"
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center overflow-hidden transition-all duration-300",
              collapsed ? "justify-center w-full" : "gap-2.5"
            )}
            title="Super Manager"
          >
            {/* Logo Image */}
            <Image
              src="/assets/logo/logo.png"
              alt="Super Manager"
              width={32}
              height={32}
              className="size-8 object-contain shrink-0"
              priority
            />
            {/* Fallback Icon (hidden unless image fails) */}
            <div
              style={{ display: "none" }}
              className="size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold shadow-xs text-xs"
            >
              SM
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-white leading-tight truncate">
                  Super Manager
                </span>
                <span className="text-[10px] text-sidebar-foreground/70 font-medium truncate">
                  Admin Console
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={toggle}
              className="hidden md:flex size-7 shrink-0 items-center justify-center rounded-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button when sidebar is collapsed on desktop */}
        {collapsed && (
          <div className="hidden md:flex justify-center py-2 border-b border-sidebar-border/40">
            <button
              type="button"
              onClick={toggle}
              className="size-7 flex items-center justify-center rounded-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.title : undefined}
                className={cn(
                  "group flex items-center rounded-sm text-xs font-medium transition-all duration-150",
                  collapsed
                    ? "size-10 justify-center mx-auto"
                    : "gap-3 px-3 py-2 w-full",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                    isActive ? "text-primary-foreground" : "text-sidebar-foreground/70"
                  )}
                />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card / Footer */}
        <div className="border-t border-sidebar-border p-2">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2 rounded-sm bg-sidebar-accent/50 p-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/20 text-primary font-bold text-xs">
                  {user?.name ? user.name[0].toUpperCase() : "A"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.name || "Super Admin"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium truncate">
                    System Creator
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="size-7 flex items-center justify-center rounded-sm text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive cursor-pointer transition-colors"
                title="Log out"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={logout}
                className="size-8 flex items-center justify-center rounded-sm text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive cursor-pointer transition-colors"
                title="Log out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
