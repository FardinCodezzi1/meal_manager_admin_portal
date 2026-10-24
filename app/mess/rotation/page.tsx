"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  ArrowDown,
  Shield,
  ShieldAlert,
  Save,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppModal } from "@/components/modals/generic/AppModal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { messApi, type MessMemberData } from "@/api/services";

export default function ManagerRotationPage() {
  const queryClient = useQueryClient();
  const { user, membership, refreshUser } = useAuth();
  const isManager = membership?.role === "MANAGER";

  // Reorder state
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Transfer Modal state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [transferReason, setTransferReason] = useState("");

  // Queries
  const { isLoading: isSequenceLoading } = useQuery({
    queryKey: ["mess", "sequence"],
    queryFn: async () => {
      const res = await messApi.getSequence();
      // Initialize local order if not dirty
      if (!isDirty && res.sequence) {
        setLocalOrder(res.sequence.map((s) => s.memberId));
      }
      return res;
    },
    enabled: Boolean(membership),
  });

  const { data: membersData } = useQuery({
    queryKey: ["mess", "members"],
    queryFn: () => messApi.getMembers(),
    enabled: Boolean(membership),
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ["mess", "manager-logs"],
    queryFn: () => messApi.getLogs(),
    enabled: Boolean(membership),
  });

  const members = membersData?.members || [];
  const activeMembers = members.filter((m) => m.status === "ACTIVE");

  // Save sequence mutation
  const saveSequenceMutation = useMutation({
    mutationFn: (memberIds: string[]) => messApi.updateSequence({ memberIds }),
    onSuccess: () => {
      toast.success("Manager rotation sequence saved!");
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["mess", "sequence"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update sequence.");
    },
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: (data: { newManagerId: string; reason: string }) =>
      messApi.transferManager(data),
    onSuccess: async () => {
      toast.success("Manager role transferred successfully!");
      setTransferModalOpen(false);
      setTransferReason("");
      setTargetMemberId("");
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["mess"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to transfer manager role.");
    },
  });

  // Move member up/down in local order
  const handleMove = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= localOrder.length) return;

    const copy = [...localOrder];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    setLocalOrder(copy);
    setIsDirty(true);
  };

  // Build sorted members list
  const orderedMembers: MessMemberData[] = localOrder
    .map((id) => activeMembers.find((m) => m.id === id))
    .filter(Boolean) as MessMemberData[];

  // Append any active members not yet in local order
  activeMembers.forEach((m) => {
    if (!localOrder.includes(m.id)) {
      orderedMembers.push(m);
    }
  });

  return (
    <AppShell>
      <PageHeader
        title="Manager Rotation & Anti-Cheat Audit"
        description="Fair sequence queue for monthly management rotation with immutable event logging"
        actions={
          isManager && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setTransferModalOpen(true)}
              >
                <ShieldAlert className="size-4 mr-1.5" />
                Emergency Transfer
              </Button>
              {isDirty && (
                <Button
                  size="sm"
                  disabled={saveSequenceMutation.isPending}
                  onClick={() => saveSequenceMutation.mutate(localOrder)}
                >
                  <Save className="size-4 mr-1.5" />
                  {saveSequenceMutation.isPending ? "Saving…" : "Save Sequence"}
                </Button>
              )}
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sequence Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Rotation Queue Sequence</CardTitle>
                  <CardDescription>
                    Who is next in line to become Manager at the end of the month
                  </CardDescription>
                </div>
                {isDirty && (
                  <Badge variant="secondary" className="text-amber-500 font-bold border-amber-500/20">
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isSequenceLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : orderedMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No active members found to order.
                </p>
              ) : (
                <div className="space-y-2">
                  {orderedMembers.map((member, index) => {
                    const isCurrentManager = member.role === "MANAGER";

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold font-mono">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{member.user.name}</span>
                              {isCurrentManager && (
                                <Badge variant="default" className="text-[10px] py-0 h-4 bg-amber-500">
                                  Current Manager
                                </Badge>
                              )}
                              {member.userId === user?.id && (
                                <Badge variant="secondary" className="text-[10px] py-0 h-4">
                                  You
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{member.user.email}</span>
                          </div>
                        </div>

                        {/* Controls (Manager only) */}
                        {isManager && (
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              disabled={index === 0}
                              onClick={() => handleMove(index, "up")}
                              title="Move up"
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              disabled={index === orderedMembers.length - 1}
                              onClick={() => handleMove(index, "down")}
                              title="Move down"
                            >
                              <ArrowDown className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Anti-Cheat Rules & Next Up info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                Anti-Cheat Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                To prevent unfair manager takeover or sudden abandonment:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Every sequence change is permanently recorded in the immutable audit log.</li>
                <li>Emergency overrides require an explicit mandatory reason for all roommates to see.</li>
                <li>Historical meal entries cannot be rewritten by subsequent managers.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Width Table: Anti-Cheat Audit Logs */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="size-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Audit Timeline</CardTitle>
                  <CardDescription>
                    Chronological record of manager transitions and manual overrides
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLogsLoading ? (
              <div className="p-6 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : !logsData?.logs?.length ? (
              <p className="text-xs text-muted-foreground p-6 text-center">
                No rotation logs recorded yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsData.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {log.reason || "Scheduled cycle rotation"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Transfer Modal */}
      <AppModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        title="Emergency Role Transfer"
        subtitle="Immediately assign the MANAGER role to another roommate"
        icon={ShieldAlert}
        primaryActions={
          <Button
            variant="destructive"
            disabled={transferMutation.isPending || !targetMemberId || !transferReason.trim()}
            onClick={() =>
              transferMutation.mutate({
                newManagerId: targetMemberId,
                reason: transferReason.trim(),
              })
            }
          >
            {transferMutation.isPending ? "Transferring…" : "Confirm Transfer"}
          </Button>
        }
        secondaryActions={
          <Button variant="outline" onClick={() => setTransferModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Select New Manager
            </label>
            <select
              value={targetMemberId}
              onChange={(e) => setTargetMemberId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">-- Choose Roommate --</option>
              {activeMembers
                .filter((m) => m.role !== "MANAGER")
                .map((m) => (
                  <option key={m.id} value={m.userId}>
                    {m.user.name} ({m.user.email})
                  </option>
                ))}
            </select>
          </div>

          <Input
            label="Reason for Emergency Transfer"
            placeholder="e.g. Traveling home for 2 weeks / exams"
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
            required
          />
        </div>
      </AppModal>
    </AppShell>
  );
}
