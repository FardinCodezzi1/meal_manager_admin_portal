"use client";

import { useQuery } from "@tanstack/react-query";
import { Megaphone, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/layout/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { configApi } from "@/api/services";

export function TopBar() {
  const { user } = useAuth();

  const { data: configData } = useQuery({
    queryKey: ["app-config"],
    queryFn: () => configApi.getConfig(),
    staleTime: 1000 * 60 * 5,
  });

  const broadcastNotice = configData?.config?.broadcastNotice;
  const isNoticeActive = configData?.config?.noticeActive && Boolean(broadcastNotice);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Super Admin Badge / Context */}
        <div className="flex items-center gap-1.5 rounded-sm border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500">
          <ShieldCheck className="size-3.5" />
          <span className="hidden sm:inline">Super Admin Console</span>
          <span className="sm:hidden">Super Admin</span>
        </div>
      </div>

      {/* Broadcast Notice */}
      {isNoticeActive && (
        <div className="hidden md:flex items-center gap-2 max-w-md truncate rounded-sm bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-500">
          <Megaphone className="size-3.5 shrink-0 animate-bounce" />
          <span className="truncate">{broadcastNotice}</span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Animated Day / Night Switch */}
        <ThemeToggle />

        {/* Static Non-Clickable Profile Display */}
        <div className="flex items-center gap-2 rounded-sm border border-border bg-card py-1 px-2.5 text-xs font-medium select-none">
          <div className="flex size-6 items-center justify-center rounded-sm bg-primary/20 text-primary font-bold">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <span className="hidden sm:inline-block max-w-[130px] truncate">
            {user?.name || user?.email || "Super Admin"}
          </span>
          <span title="Super Admin System Creator" className="inline-flex">
            <ShieldCheck className="size-3.5 text-amber-500" />
          </span>
        </div>
      </div>
    </header>
  );
}
