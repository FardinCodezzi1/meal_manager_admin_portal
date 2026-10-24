"use client";

import { AuthGuard } from "@/components/common/AuthGuard";
import { TopBar } from "@/layout/TopBar";
import { Sidebar } from "@/layout/Sidebar";

export function AppShell({
  children,
  requireSuperAdmin = false,
}: {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}) {
  return (
    <AuthGuard requireSuperAdmin={requireSuperAdmin}>
      <div className="flex h-svh overflow-hidden bg-background">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
