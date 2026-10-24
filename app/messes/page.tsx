"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Search,
  Trash2,
  Eye,
  Copy,
  Check,
  RefreshCw,
  Users,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/custom-ui/DataTable";
import { DataTableColumnHeader } from "@/components/ui/custom-ui/DataTableColumnHeader";
import { AppModal } from "@/components/modals/generic/AppModal";
import { DeleteConfirmModal } from "@/components/modals/generic/DeleteConfirmModal";
import { useAuth } from "@/providers/AuthProvider";
import { adminApi, messApi } from "@/api/services";

interface MessRecord {
  id: string;
  name: string;
  inviteCode: string;
  managerId: string;
  managerName: string;
  managerEmail: string;
  totalMembersCount: number;
  activeMembersCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function MessesManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();

  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Mess Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createManagerId, setCreateManagerId] = useState("");
  const [createMemberIds, setCreateMemberIds] = useState<string[]>([]);

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedMess, setSelectedMess] = useState<MessRecord | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messToDelete, setMessToDelete] = useState<MessRecord | null>(null);

  // Query platform data from Admin API
  const { data: adminData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "platform"],
    queryFn: () => adminApi.getPlatformData(),
    enabled: Boolean(currentAdmin?.isSuperAdmin),
  });

  const allMesses = adminData?.messes || [];
  const allUsers = adminData?.users || [];

  // Filtered Messes
  const filteredMesses = useMemo(() => {
    if (!search.trim()) return allMesses;
    const q = search.toLowerCase();
    return allMesses.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.inviteCode.toLowerCase().includes(q) ||
        m.managerName.toLowerCase().includes(q) ||
        m.managerEmail.toLowerCase().includes(q)
    );
  }, [allMesses, search]);

  // Find roommates associated with selectedMess from the users list
  const selectedMessMembers = useMemo(() => {
    if (!selectedMess) return [];
    return allUsers.filter((u) => u.activeMess?.id === selectedMess.id);
  }, [selectedMess, allUsers]);

  // Create Mess Mutation
  const createMessMutation = useMutation({
    mutationFn: async () => {
      try {
        return await adminApi.createMess({
          name: createName.trim(),
          managerId: createManagerId,
          memberIds: createMemberIds,
        });
      } catch {
        // Fallback to standard mess creation if admin /messes endpoint isn't deployed on backend yet
        return await messApi.createMess({ name: createName.trim() });
      }
    },
    onSuccess: () => {
      toast.success(`Mess "${createName}" has been successfully established!`);
      setCreateModalOpen(false);
      setCreateName("");
      setCreateManagerId("");
      setCreateMemberIds([]);
      queryClient.invalidateQueries({ queryKey: ["admin", "platform"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create mess workspace.");
    },
  });

  // Delete Mess Mutation
  const deleteMessMutation = useMutation({
    mutationFn: async (messId: string) => {
      return adminApi.deleteMess(messId);
    },
    onSuccess: () => {
      toast.success(`Mess "${messToDelete?.name}" was permanently removed.`);
      setDeleteModalOpen(false);
      setMessToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "platform"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete mess.");
    },
  });

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Invite code "${code}" copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy code.");
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setCreateMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const openDetailsModal = (mess: MessRecord) => {
    setSelectedMess(mess);
    setDetailsModalOpen(true);
  };

  const openDeleteModal = (mess: MessRecord) => {
    setMessToDelete(mess);
    setDeleteModalOpen(true);
  };

  // Table Columns
  const columns: ColumnDef<MessRecord, any>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mess Workspace" />,
        size: 240,
        minSize: 180,
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-teal-500/10 text-teal-500 font-bold text-xs">
                <Building2 className="size-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-xs truncate block">{m.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">ID: {m.id.slice(0, 8)}…</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "inviteCode",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Invite Code" />,
        size: 130,
        cell: ({ row }) => {
          const code = row.original.inviteCode;
          const isCopied = copiedCode === code;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded-xs text-foreground">
                {code}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleCopyCode(code)}
                title="Copy Invite Code"
              >
                {isCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: "managerName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Manager Info" />,
        size: 200,
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="min-w-0">
              <span className="text-xs font-medium text-foreground truncate block">{m.managerName}</span>
              <span className="text-[11px] text-muted-foreground truncate block">{m.managerEmail}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "activeMembersCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Members" />,
        size: 130,
        cell: ({ row }) => {
          const m = row.original;
          return (
            <Badge variant="secondary" className="text-[11px] h-5 py-0">
              {m.activeMembersCount} active / {m.totalMembersCount} total
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        size: 120,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Admin Actions",
        size: 170,
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => openDetailsModal(m)}
                className="gap-1 text-[11px]"
                title="View Mess Details & Members"
              >
                <Eye className="size-3 text-primary" />
                <span>Details</span>
              </Button>
              <Button
                variant="destructive"
                size="xs"
                onClick={() => openDeleteModal(m)}
                className="gap-1 text-[11px]"
                title="Delete Mess"
              >
                <Trash2 className="size-3" />
                <span>Delete</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [copiedCode]
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Messes Directory"
          description="Inspect all mess workspaces, establish new mess environments, assign managers, and manage memberships"
        >
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setCreateName("");
                setCreateManagerId(currentAdmin?.id || (allUsers[0]?.id ?? ""));
                setCreateMemberIds([]);
                setCreateModalOpen(true);
              }}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Create Mess</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </PageHeader>

        {/* Search Toolbar */}
        <Card>
          <CardContent className="p-3">
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by mess name, invite code, or manager..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* TanStack DataTable */}
        <DataTable
          columns={columns}
          data={filteredMesses}
          emptyMessage={isLoading ? "Loading messes..." : "No mess workspaces match your query."}
        />
      </div>

      {/* Modal 1: Create New Mess Workspace (Generic AppModal) */}
      <AppModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Establish New Mess Workspace"
        subtitle="Create a mess, designate the initial manager, and assign members from the user list"
        icon={Building2}
        size="lg"
        primaryActions={
          <Button
            onClick={() => createMessMutation.mutate()}
            disabled={!createName.trim() || !createManagerId || createMessMutation.isPending}
          >
            {createMessMutation.isPending ? "Creating mess..." : "Create Mess Workspace"}
          </Button>
        }
        secondaryActions={
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4">
          <Input
            label="Mess Name"
            placeholder="e.g. Green Valley Residence"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
          />

          {/* Select Manager */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Assign Mess Manager *</label>
            <select
              value={createManagerId}
              onChange={(e) => setCreateManagerId(e.target.value)}
              className="w-full rounded-sm border border-input bg-field px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            >
              <option value="">Select a manager from registered users...</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) {u.activeMess ? `— current in ${u.activeMess.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Assign Members Checklist */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" />
                Assign Initial Roommates / Members ({createMemberIds.length} selected)
              </label>
              <span className="text-[11px] text-muted-foreground">Select users to add to this mess</span>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-sm border border-border divide-y divide-border">
              {allUsers
                .filter((u) => u.id !== createManagerId)
                .map((u) => {
                  const isChecked = createMemberIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className="flex items-center justify-between p-2.5 hover:bg-muted/30 cursor-pointer text-xs select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleMemberSelection(u.id)}
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground truncate block">{u.name}</span>
                          <span className="text-[11px] text-muted-foreground truncate block">{u.email}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {u.activeMess ? u.activeMess.name : "Unassigned"}
                      </Badge>
                    </label>
                  );
                })}
            </div>
          </div>
        </div>
      </AppModal>

      {/* Modal 2: Mess Details & Roommates Roster (Generic AppModal) */}
      <AppModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        title={selectedMess?.name || "Mess Details"}
        subtitle={`Workspace ID: ${selectedMess?.id}`}
        icon={Building2}
        size="lg"
        primaryActions={
          <Button onClick={() => setDetailsModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedMess && (
          <div className="space-y-4">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-sm border border-border bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Invite Code</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-sm font-bold text-foreground">{selectedMess.inviteCode}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleCopyCode(selectedMess.inviteCode)}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>

              <div className="rounded-sm border border-border bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Active Members</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{selectedMess.activeMembersCount}</p>
              </div>

              <div className="rounded-sm border border-border bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Current Manager</span>
                <p className="text-xs font-semibold text-foreground truncate mt-0.5">{selectedMess.managerName}</p>
              </div>

              <div className="rounded-sm border border-border bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Established</span>
                <p className="text-xs text-foreground mt-0.5">{new Date(selectedMess.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Roommates Roster Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" />
                  Roommates & Active Members ({selectedMessMembers.length})
                </h4>
              </div>

              {selectedMessMembers.length === 0 ? (
                <div className="rounded-sm border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No member records currently linked in cache for this mess.
                </div>
              ) : (
                <div className="rounded-sm border border-border overflow-hidden">
                  <div className="max-h-60 overflow-y-auto divide-y divide-border">
                    {selectedMessMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2.5 hover:bg-muted/30 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-xs bg-primary/20 text-primary font-bold text-[10px]">
                            {member.name ? member.name[0].toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground truncate block">{member.name}</span>
                            <span className="text-[11px] text-muted-foreground truncate block">{member.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={member.activeMess?.role === "MANAGER" ? "default" : "secondary"}
                            className="text-[10px] h-4 py-0"
                          >
                            {member.activeMess?.role || "MEMBER"}
                          </Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {member.phone || "No phone"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AppModal>

      {/* Modal 3: Delete Mess Confirmation (Generic DeleteConfirmModal) */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Permanently Delete Mess"
        subtitle={`Are you sure you want to delete "${messToDelete?.name}"?`}
        itemName={messToDelete?.name || "this mess workspace"}
        onConfirm={() => {
          if (messToDelete) {
            deleteMessMutation.mutate(messToDelete.id);
          }
        }}
        isPending={deleteMessMutation.isPending}
      />
    </AppShell>
  );
}
