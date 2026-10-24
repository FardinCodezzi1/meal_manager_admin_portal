"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  KeyRound,
  Edit2,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Phone,
  Mail,
  User as UserIcon,
  UserPlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/ui/custom-ui/DataTable";
import { DataTableColumnHeader } from "@/components/ui/custom-ui/DataTableColumnHeader";
import { AppModal } from "@/components/modals/generic/AppModal";
import { DeleteConfirmModal } from "@/components/modals/generic/DeleteConfirmModal";
import { useAuth } from "@/providers/AuthProvider";
import { adminApi, authApi } from "@/api/services";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
  currentRole: string;
  activeMess?: {
    id: string;
    name: string;
    inviteCode: string;
    role: string;
    joinedAt: string;
  } | null;
}

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMINS" | "MANAGERS" | "MEMBERS" | "NO_MESS">("ALL");

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createIsSuperAdmin, setCreateIsSuperAdmin] = useState(false);

  // Reset Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [hasCopied, setHasCopied] = useState(false);

  // Edit User Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIsSuperAdmin, setEditIsSuperAdmin] = useState(false);

  // Delete User Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  // Fetch Users via Admin API
  const { data: adminData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "platform"],
    queryFn: () => adminApi.getPlatformData(),
    enabled: Boolean(currentAdmin?.isSuperAdmin),
  });

  const allUsers = adminData?.users || [];

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (roleFilter === "ADMINS" && !u.isSuperAdmin) return false;
      if (roleFilter === "MANAGERS" && u.currentRole !== "MANAGER") return false;
      if (roleFilter === "MEMBERS" && u.currentRole !== "MEMBER") return false;
      if (roleFilter === "NO_MESS" && u.currentRole !== "NO_MESS") return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.activeMess?.name && u.activeMess.name.toLowerCase().includes(q))
      );
    });
  }, [allUsers, search, roleFilter]);

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: async () => {
      try {
        return await adminApi.createUser({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          phone: createPhone.trim() || undefined,
          isSuperAdmin: createIsSuperAdmin,
        });
      } catch {
        // Fallback to register if backend on Render hasn't deployed the admin /users endpoint yet
        const regRes = await authApi.register({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          phone: createPhone.trim() || undefined,
        });
        if (createIsSuperAdmin && regRes?.user?.id) {
          await adminApi.updateUser(regRes.user.id, { isSuperAdmin: true });
        }
        return regRes;
      }
    },
    onSuccess: () => {
      toast.success(`User "${createName}" created successfully!`);
      setCreateModalOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePhone("");
      setCreatePassword("");
      setCreateIsSuperAdmin(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "platform"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create user account.");
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return adminApi.deleteUser(userId);
    },
    onSuccess: () => {
      toast.success(`User "${userToDelete?.name}" has been permanently deleted.`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "platform"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete user.");
    },
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !newPassword) return;
      return adminApi.updateUser(selectedUser.id, { newPassword });
    },
    onSuccess: () => {
      toast.success(`Password for ${selectedUser?.name} reset successfully!`);
      setResetModalOpen(false);
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: ["admin", "platform"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reset password.");
    },
  });

  // Edit User Mutation
  const editUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;
      return adminApi.updateUser(selectedUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
        isSuperAdmin: editIsSuperAdmin,
      });
    },
    onSuccess: () => {
      toast.success("User details updated successfully!");
      setEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "platform"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update user.");
    },
  });

  const generateRandomPassword = (target: "reset" | "create") => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (target === "reset") setNewPassword(pwd);
    else setCreatePassword(pwd);
  };

  const copyPasswordToClipboard = async (pwd: string) => {
    if (!pwd) return;
    try {
      await navigator.clipboard.writeText(pwd);
      setHasCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const openResetModal = (user: UserRecord) => {
    setSelectedUser(user);
    setNewPassword("");
    setHasCopied(false);
    setResetModalOpen(true);
  };

  const openEditModal = (user: UserRecord) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditIsSuperAdmin(user.isSuperAdmin);
    setEditModalOpen(true);
  };

  const openDeleteModal = (user: UserRecord) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // Table Columns Definition
  const columns: ColumnDef<UserRecord, any>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="User Details" />,
        size: 260,
        minSize: 200,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/20 text-primary font-bold text-xs">
                {u.name ? u.name[0].toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground text-xs truncate">{u.name}</span>
                  {u.isSuperAdmin && (
                    <Badge variant="secondary" className="text-[10px] text-amber-500 border-amber-500/30 h-4 py-0">
                      Super Admin
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground truncate block">{u.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.phone || "—"}
          </span>
        ),
      },
      {
        id: "activeMess",
        accessorKey: "activeMess.name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Active Mess" />,
        size: 200,
        cell: ({ row }) => {
          const mess = row.original.activeMess;
          if (!mess) {
            return (
              <span className="text-xs text-muted-foreground/70 italic">
                No Active Mess
              </span>
            );
          }
          return (
            <div className="flex flex-col">
              <span className="font-medium text-xs text-foreground truncate">{mess.name}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge
                  variant={mess.role === "MANAGER" ? "default" : "secondary"}
                  className="text-[9px] h-3.5 py-0 px-1"
                >
                  {mess.role}
                </Badge>
                <span className="font-mono text-[10px] text-muted-foreground">#{mess.inviteCode}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
        size: 130,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Super Controls",
        size: 220,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => openResetModal(u)}
                className="gap-1 text-[11px]"
                title="Reset Password"
              >
                <KeyRound className="size-3 text-amber-500" />
                <span>Pass</span>
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => openEditModal(u)}
                className="gap-1 text-[11px]"
                title="Edit User Details"
              >
                <Edit2 className="size-3" />
                <span>Edit</span>
              </Button>
              <Button
                variant="destructive"
                size="xs"
                onClick={() => openDeleteModal(u)}
                className="gap-1 text-[11px]"
                title="Delete User"
                disabled={u.isSuperAdmin && currentAdmin?.id === u.id}
              >
                <Trash2 className="size-3" />
                <span>Delete</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [currentAdmin]
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Users Management"
          description="Oversee user accounts, register new members, reset passwords, and manage administrative permissions"
        >
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setCreateName("");
                setCreateEmail("");
                setCreatePhone("");
                setCreatePassword("");
                setCreateIsSuperAdmin(false);
                setCreateModalOpen(true);
              }}
              size="sm"
              className="gap-1.5"
            >
              <UserPlus className="size-3.5" />
              <span>Create User</span>
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

        {/* Filters & Search Toolbar */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or mess..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(["ALL", "ADMINS", "MANAGERS", "MEMBERS", "NO_MESS"] as const).map((r) => (
                  <Button
                    key={r}
                    size="xs"
                    variant={roleFilter === r ? "default" : "outline"}
                    onClick={() => setRoleFilter(r)}
                    className="text-[11px] rounded-xs"
                  >
                    {r === "ALL" && "All Users"}
                    {r === "ADMINS" && "Super Admins"}
                    {r === "MANAGERS" && "Mess Managers"}
                    {r === "MEMBERS" && "Roommates"}
                    {r === "NO_MESS" && "Unassigned"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TanStack DataTable */}
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage={isLoading ? "Loading user accounts..." : "No user accounts match your search."}
        />
      </div>

      {/* Modal 1: Create New User (Generic AppModal) */}
      <AppModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Create New User Account"
        subtitle="Provision a new user account with login credentials and system privileges"
        icon={UserPlus}
        size="md"
        primaryActions={
          <Button
            onClick={() => createUserMutation.mutate()}
            disabled={!createName.trim() || !createEmail.trim() || createPassword.length < 6 || createUserMutation.isPending}
          >
            {createUserMutation.isPending ? "Creating account..." : "Create Account"}
          </Button>
        }
        secondaryActions={
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="Full Name"
            icon={UserIcon}
            placeholder="John Doe"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="john@example.com"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number (Optional)"
            icon={Phone}
            placeholder="+880 17XXXXXXXX"
            value={createPhone}
            onChange={(e) => setCreatePhone(e.target.value)}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Initial Password</label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => generateRandomPassword("create")}
                className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
              >
                <Sparkles className="size-3" />
                <span>Auto-Generate</span>
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="At least 6 characters"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="font-mono text-xs"
                required
              />
              {createPassword && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyPasswordToClipboard(createPassword)}
                  title="Copy password to clipboard"
                  className="shrink-0"
                >
                  {hasCopied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-sm border border-amber-500/25 bg-amber-500/5 p-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                <ShieldCheck className="size-3.5" />
                <span>Grant Super Admin Rights</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Authorizes full system creator and administrative control.
              </p>
            </div>
            <Switch
              checked={createIsSuperAdmin}
              onCheckedChange={setCreateIsSuperAdmin}
            />
          </div>
        </div>
      </AppModal>

      {/* Modal 2: Reset Password (Generic AppModal) */}
      <AppModal
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        title="Reset User Password"
        subtitle={`Set or generate a new login password for ${selectedUser?.name}`}
        icon={KeyRound}
        size="md"
        primaryActions={
          <Button
            onClick={() => resetPasswordMutation.mutate()}
            disabled={!newPassword || newPassword.length < 6 || resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? "Updating password..." : "Confirm & Save Password"}
          </Button>
        }
        secondaryActions={
          <Button variant="ghost" onClick={() => setResetModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-sm border border-border bg-muted/20 p-3 space-y-1">
            <div className="text-xs font-semibold text-foreground">{selectedUser?.name}</div>
            <div className="text-xs text-muted-foreground">{selectedUser?.email}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">New Password</label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => generateRandomPassword("reset")}
                className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
              >
                <Sparkles className="size-3" />
                <span>Generate Strong Password</span>
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="font-mono text-xs"
              />
              {newPassword && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyPasswordToClipboard(newPassword)}
                  title="Copy password to clipboard"
                  className="shrink-0"
                >
                  {hasCopied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              After setting this, copy the password and share it securely with the user.
            </p>
          </div>
        </div>
      </AppModal>

      {/* Modal 3: Edit User Profile & Role (Generic AppModal) */}
      <AppModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Edit User Account"
        subtitle={`Update profile details and administrative permissions for ${selectedUser?.name}`}
        icon={Edit2}
        size="md"
        primaryActions={
          <Button
            onClick={() => editUserMutation.mutate()}
            disabled={!editName.trim() || !editEmail.trim() || editUserMutation.isPending}
          >
            {editUserMutation.isPending ? "Saving..." : "Save Details"}
          </Button>
        }
        secondaryActions={
          <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="Full Name"
            icon={UserIcon}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            icon={Phone}
            placeholder="017XXXXXXXX"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
          />

          <div className="flex items-center justify-between rounded-sm border border-amber-500/25 bg-amber-500/5 p-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                <ShieldCheck className="size-3.5" />
                <span>Grant Super Admin Privileges</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Allows full platform oversight, user management, and mess administration.
              </p>
            </div>
            <Switch
              checked={editIsSuperAdmin}
              onCheckedChange={setEditIsSuperAdmin}
            />
          </div>
        </div>
      </AppModal>

      {/* Modal 4: Delete User Confirmation (DeleteConfirmModal) */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Permanently Delete User"
        subtitle={`Are you sure you want to delete ${userToDelete?.name}? All associated personal records will be removed.`}
        itemName={userToDelete?.name || "this user account"}
        onConfirm={() => {
          if (userToDelete) {
            deleteUserMutation.mutate(userToDelete.id);
          }
        }}
        isPending={deleteUserMutation.isPending}
      />
    </AppShell>
  );
}
