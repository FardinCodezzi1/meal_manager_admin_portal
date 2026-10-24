import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SidebarProvider } from "@/layout/SidebarContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Super Manager - Admin Console",
  description: "System Creator & Master Control Console for Mess & Tour Workspaces",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <SidebarProvider>
                {children}
                <Toaster richColors position="top-right" />
              </SidebarProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
