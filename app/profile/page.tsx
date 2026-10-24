"use client";

import { useState } from "react";
import { User, Phone, Mail, Lock, ShieldAlert, AlertTriangle, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/modals/generic/ConfirmModal";
import { useAuth } from "@/providers/AuthProvider";
import { authApi } from "@/api/services";

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Delete Account Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await authApi.updateMe({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim(),
      });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await authApi.updateMe({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your current password to confirm account deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      await authApi.deleteMe({ password: deletePassword });
      toast.success("Account deleted successfully.");
      logout();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 w-full">
        <PageHeader
          title="Profile & Settings"
          description="Manage your root administrator credentials, security access keys, and system identity"
        />

        {/* Distributed 2-Column Full Width Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
          {/* Left Column: Personal Information & Password */}
          <div className="space-y-6">
            {/* Personal Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                <CardDescription className="text-xs">Update your public identity and contact details</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-4">
                  <Input
                    label="Full Name"
                    icon={User}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    icon={Phone}
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? "Saving changes…" : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                <CardDescription className="text-xs">Ensure your master account is protected with a secure password</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    icon={Lock}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="New Password"
                      type="password"
                      icon={KeyRound}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      icon={KeyRound}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" disabled={isSavingPassword}>
                    {isSavingPassword ? "Updating password…" : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right Column: Super Admin Status, Security Telemetry & Danger Zone */}
          <div className="space-y-6">
            {/* Super Admin Privileges Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-amber-500" />
                    <CardTitle className="text-base font-semibold">Super Admin Privileges</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px] text-amber-500 border-amber-500/30">
                    Active Authority
                  </Badge>
                </div>
                <CardDescription className="text-xs">System creator authorization & root control capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-sm border border-amber-500/25 bg-amber-500/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">Root Super Admin</span>
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-xs font-bold">
                      SYSTEM CREATOR
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Session Email: <span className="font-mono font-semibold text-foreground">{user?.email}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    You hold full root authority to oversee all user accounts, reset passwords, inspect and delete mess workspaces, and push platform-wide broadcast notices.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-sm border border-border p-2.5 bg-muted/20">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Admin Status</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 mt-0.5">
                      <CheckCircle2 className="size-3" />
                      <span>Verified Root</span>
                    </div>
                  </div>
                  <div className="rounded-sm border border-border p-2.5 bg-muted/20">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">User ID</span>
                    <p className="font-mono text-xs text-foreground truncate mt-0.5">{user?.id || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security & Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Security & Session Details</CardTitle>
                <CardDescription className="text-xs">Active authentication credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-sm border border-border bg-muted/20 text-xs">
                  <span className="text-muted-foreground">Authentication Protocol</span>
                  <span className="font-mono font-medium text-foreground">JWT Bearer Authorization</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-sm border border-border bg-muted/20 text-xs">
                  <span className="text-muted-foreground">Storage Persistence</span>
                  <span className="font-mono font-medium text-foreground">LocalStorage auth_token</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-sm border border-border bg-muted/20 text-xs">
                  <span className="text-muted-foreground">Access Level</span>
                  <span className="font-semibold text-amber-500">Unrestricted Master Access</span>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="size-4" />
                  <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Irreversible account termination. This will erase your personal administrative credentials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full cursor-pointer"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete Admin Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Account Deletion"
        subtitle="This action cannot be undone. Enter your password to proceed."
        icon={AlertTriangle}
        variant="destructive"
        confirmLabel="Permanently Delete Account"
        onConfirm={handleDeleteAccount}
        isPending={isDeleting}
      >
        <div className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            Your personal user credentials will be permanently erased from the database.
          </p>
          <Input
            label="Your Current Password"
            type="password"
            placeholder="Enter password to verify"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            required
          />
        </div>
      </ConfirmModal>
    </AppShell>
  );
}
