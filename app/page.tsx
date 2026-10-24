"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  Building2,
  Compass,
  UtensilsCrossed,
  Receipt,
  Wallet,
  Activity,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  RefreshCw,
  BarChart3,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScenicDriveCard } from "@/components/dashboard/ScenicDriveCard";
import { useAuth } from "@/providers/AuthProvider";
import { adminApi, configApi } from "@/api/services";

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const { data: adminData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "platform"],
    queryFn: () => adminApi.getPlatformData(),
    enabled: Boolean(user?.isSuperAdmin),
  });

  const { data: configData } = useQuery({
    queryKey: ["app-config"],
    queryFn: () => configApi.getConfig(),
  });

  const stats = adminData?.stats;
  // Limit to last 4 entries as requested
  const recentUsers = adminData?.users?.slice(0, 4) || [];
  const recentMesses = adminData?.messes?.slice(0, 4) || [];
  const allUsers = adminData?.users || [];
  const tourDestinations = (adminData?.tours || [])
    .map((t) => t.destination?.trim() || t.name?.trim())
    .filter((d): d is string => Boolean(d));

  const broadcastNotice = configData?.config?.broadcastNotice;
  const isNoticeActive = configData?.config?.noticeActive && Boolean(broadcastNotice);

  // User distribution calculations
  const totalUsersCount = allUsers.length || 1;
  const adminCount = allUsers.filter((u) => u.isSuperAdmin).length;
  const managerCount = allUsers.filter((u) => u.currentRole === "MANAGER").length;
  const memberCount = allUsers.filter((u) => u.currentRole === "MEMBER").length;
  const unassignedCount = allUsers.filter((u) => u.currentRole === "NO_MESS").length;

  const adminPct = Math.round((adminCount / totalUsersCount) * 100);
  const managerPct = Math.round((managerCount / totalUsersCount) * 100);
  const memberPct = Math.round((memberCount / totalUsersCount) * 100);
  const unassignedPct = Math.max(0, 100 - (adminPct + managerPct + memberPct));

  // Financial Ratio calculations
  const totalFinancialVolume = (stats?.totalBazarAmount || 0) + (stats?.totalTourBudget || 0) || 1;
  const bazarSharePct = Math.round(((stats?.totalBazarAmount || 0) / totalFinancialVolume) * 100);
  const tourSharePct = 100 - bazarSharePct;

  if (!user?.isSuperAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-500 mb-4">
            <ShieldCheck className="size-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Super Admin Privileges Required</h2>
          <p className="mt-2 max-w-md text-xs text-muted-foreground">
            This console is strictly reserved for the system creator and super administrators. Please sign in with an authorized administrator account to oversee platform operations.
          </p>
          <div className="mt-6 flex gap-3">
            <Button nativeButton={false} render={<Link href="/login" />}>
              Sign In with Admin Account
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Super Admin Dashboard"
          description="Master control console & system-wide platform telemetry"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </Button>
        </PageHeader>

        {/* Broadcast Announcement Alert */}
        {isNoticeActive && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500">
            <div className="flex items-center gap-2 min-w-0">
              <Megaphone className="size-4 shrink-0 animate-bounce" />
              <div className="min-w-0">
                <span className="font-bold">Active Broadcast Notice: </span>
                <span className="truncate">{broadcastNotice}</span>
              </div>
            </div>
            <Button
              size="xs"
              variant="outline"
              nativeButton={false}
              render={<Link href="/settings" />}
              className="border-amber-500/30 text-amber-500 hover:bg-amber-500/20 shrink-0"
            >
              Manage Notice
            </Button>
          </div>
        )}

        {/* 1. Top Statistics KPI Cards (Clean, non-overlapping grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Users */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-medium text-xs">Total Users</CardDescription>
                <div className="flex size-7 items-center justify-center rounded-xs bg-primary/10 text-primary">
                  <Users className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold mt-1 text-foreground">
                {isLoading ? <Skeleton className="h-6 w-14 rounded-xs" /> : stats?.totalUsers.toLocaleString() ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="py-2 text-[11px] text-muted-foreground">
              Registered accounts
            </CardFooter>
          </Card>

          {/* Total Messes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-medium text-xs">Total Messes</CardDescription>
                <div className="flex size-7 items-center justify-center rounded-xs bg-teal-500/10 text-teal-500">
                  <Building2 className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold mt-1 text-foreground">
                {isLoading ? <Skeleton className="h-6 w-14 rounded-xs" /> : stats?.totalMesses.toLocaleString() ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="py-2 text-[11px] text-muted-foreground">
              Active workspaces
            </CardFooter>
          </Card>

          {/* Total Meals */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-medium text-xs">Total Meals</CardDescription>
                <div className="flex size-7 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-500">
                  <UtensilsCrossed className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold mt-1 text-foreground">
                {isLoading ? <Skeleton className="h-6 w-14 rounded-xs" /> : stats?.totalMeals.toLocaleString() ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="py-2 text-[11px] text-muted-foreground">
              Consumed across mess
            </CardFooter>
          </Card>

          {/* Total Bazar Expenses */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-medium text-xs">Total Bazar</CardDescription>
                <div className="flex size-7 items-center justify-center rounded-xs bg-purple-500/10 text-purple-500">
                  <Receipt className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold mt-1 text-foreground">
                {isLoading ? <Skeleton className="h-6 w-14 rounded-xs" /> : `৳${stats?.totalBazarAmount.toLocaleString() ?? "—"}`}
              </CardTitle>
            </CardHeader>
            <CardFooter className="py-2 text-[11px] text-muted-foreground">
              Approved purchases
            </CardFooter>
          </Card>

          {/* Total Tours */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-medium text-xs">Total Tours</CardDescription>
                <div className="flex size-7 items-center justify-center rounded-xs bg-amber-500/10 text-amber-500">
                  <Compass className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold mt-1 text-foreground">
                {isLoading ? <Skeleton className="h-6 w-14 rounded-xs" /> : stats?.totalTours.toLocaleString() ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="py-2 text-[11px] text-muted-foreground">
              Travel workspaces
            </CardFooter>
          </Card>

          {/* Tour Budgets */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="font-medium text-xs">Tour Budgets</CardDescription>
                <div className="flex size-7 items-center justify-center rounded-xs bg-sky-500/10 text-sky-500">
                  <Wallet className="size-3.5" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold mt-1 text-foreground">
                {isLoading ? <Skeleton className="h-6 w-14 rounded-xs" /> : `৳${stats?.totalTourBudget.toLocaleString() ?? "—"}`}
              </CardTitle>
            </CardHeader>
            <CardFooter className="py-2 text-[11px] text-muted-foreground">
              Accumulated budgets
            </CardFooter>
          </Card>
        </div>

        {/* 2. Middle Section: Charts & Visual Analytics on the left, Health & Controls on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Analytics / Graphs (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            {/* Financial & Platform Growth Chart Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-primary" />
                    <div>
                      <CardTitle className="text-sm font-semibold">Financial Volume & System Engagement</CardTitle>
                      <CardDescription className="text-xs">
                        Comparative share of Bazar accounting vs Tour budgets across the system
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] gap-1 font-mono">
                    <TrendingUp className="size-3 text-emerald-500" />
                    Active Volume: ৳{totalFinancialVolume.toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Visual Ratio Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <span className="size-2.5 rounded-xs bg-purple-500" />
                      Approved Bazar Expenses ({bazarSharePct}%)
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <span className="size-2.5 rounded-xs bg-sky-500" />
                      Tour Trip Budgets ({tourSharePct}%)
                    </span>
                  </div>

                  <div className="h-3.5 w-full rounded-sm overflow-hidden bg-muted/40 flex">
                    <div
                      style={{ width: `${bazarSharePct}%` }}
                      className="h-full bg-purple-500 transition-all duration-500"
                      title={`Bazar: ৳${(stats?.totalBazarAmount || 0).toLocaleString()}`}
                    />
                    <div
                      style={{ width: `${tourSharePct}%` }}
                      className="h-full bg-sky-500 transition-all duration-500"
                      title={`Tours: ৳${(stats?.totalTourBudget || 0).toLocaleString()}`}
                    />
                  </div>
                </div>

                {/* Engagement Breakdown Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50">
                  <div className="rounded-sm border border-border bg-muted/20 p-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Mess Meals / Day</span>
                    <div className="text-base font-bold text-emerald-500 mt-1">
                      {stats ? `${(stats.totalMeals / Math.max(1, stats.totalMesses)).toFixed(1)} meals` : "—"}
                    </div>
                    <span className="text-[10px] text-muted-foreground">Average per workspace</span>
                  </div>

                  <div className="rounded-sm border border-border bg-muted/20 p-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Avg. Bazar / Mess</span>
                    <div className="text-base font-bold text-purple-500 mt-1">
                      ৳{stats ? Math.round(stats.totalBazarAmount / Math.max(1, stats.totalMesses)).toLocaleString() : "0"}
                    </div>
                    <span className="text-[10px] text-muted-foreground">Consumption velocity</span>
                  </div>

                  <div className="rounded-sm border border-border bg-muted/20 p-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Avg. Tour Budget</span>
                    <div className="text-base font-bold text-sky-500 mt-1">
                      ৳{stats ? Math.round(stats.totalTourBudget / Math.max(1, stats.totalTours)).toLocaleString() : "0"}
                    </div>
                    <span className="text-[10px] text-muted-foreground">Planned expenditure</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Roles & Population Distribution Chart Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="size-4 text-teal-500" />
                  <div>
                    <CardTitle className="text-sm font-semibold">User Role & Membership Distribution</CardTitle>
                    <CardDescription className="text-xs">
                      Population breakdown across administrative roles and mess assignments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Horizontal Segmented Bar */}
                <div className="h-3 w-full rounded-sm overflow-hidden bg-muted/40 flex">
                  <div style={{ width: `${adminPct}%` }} className="h-full bg-amber-500" title={`Admins: ${adminCount}`} />
                  <div style={{ width: `${managerPct}%` }} className="h-full bg-primary" title={`Managers: ${managerCount}`} />
                  <div style={{ width: `${memberPct}%` }} className="h-full bg-teal-500" title={`Members: ${memberCount}`} />
                  <div style={{ width: `${unassignedPct}%` }} className="h-full bg-muted-foreground/40" title={`Unassigned: ${unassignedCount}`} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-xs bg-amber-500 shrink-0" />
                    <div>
                      <span className="font-semibold block">{adminCount} Admins</span>
                      <span className="text-[10px] text-muted-foreground">{adminPct}% of total</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-xs bg-primary shrink-0" />
                    <div>
                      <span className="font-semibold block">{managerCount} Managers</span>
                      <span className="text-[10px] text-muted-foreground">{managerPct}% of total</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-xs bg-teal-500 shrink-0" />
                    <div>
                      <span className="font-semibold block">{memberCount} Roommates</span>
                      <span className="text-[10px] text-muted-foreground">{memberPct}% of total</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-xs bg-muted-foreground/40 shrink-0" />
                    <div>
                      <span className="font-semibold block">{unassignedCount} Unassigned</span>
                      <span className="text-[10px] text-muted-foreground">{unassignedPct}% of total</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenic Animated Drive (fills vertical empty gap under charts) */}
            <ScenicDriveCard destinations={tourDestinations} className="flex-1 min-h-[120px]" />
          </div>

          {/* Right Column: System Health & Master Shortcuts */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* System Health Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="size-4 text-emerald-500" />
                  System Health & API
                </CardTitle>
                <CardDescription className="text-xs">Live server connection status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-sm border border-border p-2.5 bg-muted/20">
                  <span className="text-xs text-muted-foreground">Backend API</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                    <span className="size-2 rounded-xs bg-emerald-500 animate-pulse" />
                    Live on Render
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-sm border border-border p-2.5 bg-muted/20">
                  <span className="text-xs text-muted-foreground">Database Sync</span>
                  <span className="text-xs font-medium text-foreground">PostgreSQL Active</span>
                </div>

                <div className="flex items-center justify-between rounded-sm border border-border p-2.5 bg-muted/20">
                  <span className="text-xs text-muted-foreground">Super Admin Session</span>
                  <span className="text-xs font-mono font-medium text-amber-500 truncate max-w-[140px]">
                    {user?.email}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="text-[11px] text-muted-foreground">
                Next.js 16.4.3 • Turbopack Active
              </CardFooter>
            </Card>

            {/* Quick Management Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Master Controls</CardTitle>
                <CardDescription className="text-xs">Direct shortcuts to admin sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link
                  href="/users"
                  className="flex items-center justify-between p-2.5 rounded-sm border border-border hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-medium">
                    <Users className="size-4 text-primary" />
                    <span>Manage Users & Passwords</span>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/messes"
                  className="flex items-center justify-between p-2.5 rounded-sm border border-border hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-medium">
                    <Building2 className="size-4 text-teal-500" />
                    <span>Inspect Messes & Roommates</span>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/tours"
                  className="flex items-center justify-between p-2.5 rounded-sm border border-border hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-medium">
                    <Compass className="size-4 text-amber-500" />
                    <span>Supervise Tour Budgets</span>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center justify-between p-2.5 rounded-sm border border-border hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-medium">
                    <Megaphone className="size-4 text-sky-500" />
                    <span>Broadcast Notice & Settings</span>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 3. Bottom Section: Side-by-Side Recent Users and Active Messes (Showing latest 3-4 entries) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Recent Users</CardTitle>
                  <CardDescription className="text-xs">Latest registered accounts on the platform</CardDescription>
                </div>
                <Button size="xs" variant="outline" nativeButton={false} render={<Link href="/users" />}>
                  View All Users <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-full rounded-sm" />
                  <Skeleton className="h-10 w-full rounded-sm" />
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No users registered yet.</div>
              ) : (
                <div className="divide-y divide-border">
                  {recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/20 text-primary font-bold text-xs">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground truncate">{u.name}</span>
                            {u.isSuperAdmin && (
                              <Badge variant="secondary" className="text-[9px] h-3.5 py-0 text-amber-500 border-amber-500/30">
                                Super Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {u.activeMess ? u.activeMess.name : "No Mess"}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Total registered users: {stats?.totalUsers ?? 0}
            </CardFooter>
          </Card>

          {/* Recent Messes Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Active Mess Workspaces</CardTitle>
                  <CardDescription className="text-xs">Mess environments created across the system</CardDescription>
                </div>
                <Button size="xs" variant="outline" nativeButton={false} render={<Link href="/messes" />}>
                  View All Messes <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-full rounded-sm" />
                  <Skeleton className="h-10 w-full rounded-sm" />
                </div>
              ) : recentMesses.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No messes created yet.</div>
              ) : (
                <div className="divide-y divide-border">
                  {recentMesses.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground truncate">{m.name}</span>
                          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded-xs font-bold text-muted-foreground">
                            {m.inviteCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          Manager: {m.managerName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="secondary" className="text-[10px]">
                          {m.activeMembersCount} active members
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Total messes managed: {stats?.totalMesses ?? 0}
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
