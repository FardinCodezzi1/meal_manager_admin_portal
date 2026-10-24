"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, Suspense } from "react";
import { TextLoader } from "@/components/ui/text-loader";
import { useAuth } from "@/providers/AuthProvider";

interface AuthGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

function AuthGuardInner({ children, requireSuperAdmin }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (requireSuperAdmin && !user?.isSuperAdmin) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, requireSuperAdmin, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <TextLoader text="Loading Mess Portal…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireSuperAdmin && !user?.isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}

export function AuthGuard({ children, requireSuperAdmin = false }: AuthGuardProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <TextLoader text="Loading Mess Portal…" />
        </div>
      }
    >
      <AuthGuardInner requireSuperAdmin={requireSuperAdmin}>
        {children}
      </AuthGuardInner>
    </Suspense>
  );
}
