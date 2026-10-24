"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Globe,
  Server,
  Save,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { configApi } from "@/api/services";

export default function SystemSettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [appName, setAppName] = useState("Super Manager");
  const [broadcastNotice, setBroadcastNotice] = useState("");
  const [noticeActive, setNoticeActive] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorPortfolio, setCreatorPortfolio] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch App Config
  const { data: configData } = useQuery({
    queryKey: ["app-config"],
    queryFn: () => configApi.getConfig(),
  });

  useEffect(() => {
    if (configData?.config && !isInitialized) {
      setAppName(configData.config.appName || "Super Manager");
      setBroadcastNotice(configData.config.broadcastNotice || "");
      setNoticeActive(Boolean(configData.config.noticeActive));
      setCreatorName(configData.config.creatorName || "");
      setCreatorEmail(configData.config.creatorEmail || "");
      setCreatorPortfolio(configData.config.creatorPortfolio || "");
      setIsInitialized(true);
    }
  }, [configData, isInitialized]);

  // Update Config Mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (payload: any) => {
      return configApi.updateConfig(payload);
    },
    onSuccess: () => {
      toast.success("System configurations updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["app-config"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update system config.");
    },
  });

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate({
      broadcastNotice: broadcastNotice.trim(),
      noticeActive,
    });
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate({
      appName: appName.trim(),
      creatorName: creatorName.trim(),
      creatorEmail: creatorEmail.trim(),
      creatorPortfolio: creatorPortfolio.trim(),
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 w-full">
        <PageHeader
          title="System Controls & Broadcast"
          description="Configure system-wide settings, push global announcement banners, and inspect runtime server status"
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        {/* Card 1: Broadcast Notice Announcement */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="size-4 text-amber-500" />
                <CardTitle className="text-base font-semibold">Global Broadcast Notice</CardTitle>
              </div>
              <Badge variant={noticeActive ? "default" : "secondary"} className="text-[10px]">
                {noticeActive ? "Live Broadcast" : "Inactive"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Pushes a prominent banner across every logged-in user dashboard and top bar in real-time.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSaveBroadcast}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-sm border border-border bg-muted/20 p-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">Activate Global Announcement</span>
                  <p className="text-[11px] text-muted-foreground">
                    When enabled, the message below is broadcast across all client interfaces.
                  </p>
                </div>
                <Switch
                  checked={noticeActive}
                  onCheckedChange={setNoticeActive}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Announcement Message</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Scheduled server maintenance on Sunday at 12:00 AM UTC. Please finalize your monthly bazar accounts."
                  value={broadcastNotice}
                  onChange={(e) => setBroadcastNotice(e.target.value)}
                  className="w-full rounded-sm border border-input bg-field px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </CardContent>

            <CardFooter className="justify-end">
              <Button type="submit" disabled={updateConfigMutation.isPending} className="gap-1.5 text-xs">
                <Save className="size-3.5" />
                <span>{updateConfigMutation.isPending ? "Broadcasting..." : "Save Broadcast Notice"}</span>
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Card 2: System Configuration & Creator Identity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">System App Identity</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Customize the platform name and creator credits stored in global AppConfig.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSaveIdentity}>
            <CardContent className="space-y-3.5">
              <Input
                label="Application Name"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Super Manager"
                required
              />

              <Input
                label="Creator / Author Name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Fardin Ahmed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Creator Contact Email"
                  type="email"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  placeholder="fardin1.codezzi@gmail.com"
                />
                <Input
                  label="Creator Portfolio / Website"
                  value={creatorPortfolio}
                  onChange={(e) => setCreatorPortfolio(e.target.value)}
                  placeholder="https://codezzi.dev"
                />
              </div>
            </CardContent>

            <CardFooter className="justify-end">
              <Button type="submit" disabled={updateConfigMutation.isPending} className="gap-1.5 text-xs">
                <Save className="size-3.5" />
                <span>{updateConfigMutation.isPending ? "Saving..." : "Save App Settings"}</span>
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Card 3: Runtime Server Diagnostics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="size-4 text-emerald-500" />
              <CardTitle className="text-base font-semibold">Live Server & API Diagnostics</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Operational environment parameters connecting to Render Cloud
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-sm border border-border bg-muted/20 p-3 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">API Base URL</span>
              <p className="font-mono text-xs text-foreground truncate">
                https://meal-manager-api.onrender.com/api
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 pt-1">
                <CheckCircle2 className="size-3" />
                <span>Render Host Connected</span>
              </div>
            </div>

            <div className="rounded-sm border border-border bg-muted/20 p-3 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Frontend Framework</span>
              <p className="text-xs font-semibold text-foreground">Next.js 16.4.3 (Turbopack)</p>
              <p className="text-[11px] text-muted-foreground">Base-UI & Tailwind v4 Design Tokens</p>
            </div>

            <div className="rounded-sm border border-border bg-muted/20 p-3 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Super Admin Session</span>
              <p className="font-mono text-xs text-foreground truncate">{user?.email}</p>
              <p className="text-[11px] text-amber-500 font-medium">Root Super Admin Authorized</p>
            </div>
          </CardContent>

          <CardFooter className="justify-between">
            <span className="text-xs text-muted-foreground">
              Last configuration sync: {configData?.config?.updatedAt ? new Date(configData.config.updatedAt).toLocaleString() : "Just now"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries()}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Purge & Refresh Queries</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
      </div>
    </AppShell>
  );
}
