"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Plus,
  Wallet,
  Receipt,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppModal } from "@/components/modals/generic/AppModal";
import { ConfirmModal } from "@/components/modals/generic/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { toursApi } from "@/api/services";
import { getDefaultDateString } from "@/lib/date.util";

const EXPENSE_CATEGORIES = [
  "Transport (Bus/Train/Flight)",
  "Hotel & Accommodation",
  "Food & Dining",
  "Tickets & Entry Passes",
  "Snacks & Tea",
  "Emergency & Misc",
];

function TourWorkspaceContent() {
  const params = useParams();
  const tourId = (params?.id as string) || "";

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "PARTICIPANTS" | "DEPOSITS" | "EXPENSES" | "SETTLEMENT"
  >("OVERVIEW");

  // Modals state
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  // Form states: Deposit
  const [depMemberId, setDepMemberId] = useState("");
  const [depAmount, setDepAmount] = useState("");
  const [depDate, setDepDate] = useState(getDefaultDateString);
  const [depNotes, setDepNotes] = useState("");

  // Form states: Expense
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expDate, setExpDate] = useState(getDefaultDateString);
  const [expMemberId, setExpMemberId] = useState("");
  const [expNotes, setExpNotes] = useState("");

  useEffect(() => {
    setDepDate(new Date().toISOString().slice(0, 10));
    setExpDate(new Date().toISOString().slice(0, 10));
  }, []);

  // Form states: Member
  const [memName, setMemName] = useState("");
  const [memPhone, setMemPhone] = useState("");
  const [memEmail, setMemEmail] = useState("");

  // Delete state
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [deleteDepositId, setDeleteDepositId] = useState<string | null>(null);

  // Query Tour details
  const { data: tourData, isLoading } = useQuery({
    queryKey: ["tours", tourId],
    queryFn: () => toursApi.getTourById(tourId),
  });

  const tour = tourData?.tour;
  const summary = tourData?.summary;
  const members = tourData?.members || [];
  const expenses = tourData?.expenses || [];
  const deposits = tourData?.deposits || [];

  // Determine user role in this tour
  const currentMember = members.find((m) => m.userId === user?.id);
  const isLead = tour?.creatorId === user?.id || currentMember?.role === "LEAD";
  const isAccountant = currentMember?.role === "ACCOUNTANT";
  const canManageFinance = isLead || isAccountant;

  const handleCopyInvite = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast.success("Tour invite code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Add Deposit Mutation
  const addDepositMutation = useMutation({
    mutationFn: () =>
      toursApi.createDeposit(tourId, {
        memberId: depMemberId,
        amount: parseFloat(depAmount),
        date: new Date(depDate).toISOString(),
        notes: depNotes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Deposit recorded!");
      setDepositModalOpen(false);
      setDepAmount("");
      setDepNotes("");
      queryClient.invalidateQueries({ queryKey: ["tours", tourId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to record deposit.");
    },
  });

  // Delete Deposit Mutation
  const deleteDepositMutation = useMutation({
    mutationFn: (id: string) => toursApi.deleteDeposit(tourId, id),
    onSuccess: () => {
      toast.success("Deposit deleted.");
      setDeleteDepositId(null);
      queryClient.invalidateQueries({ queryKey: ["tours", tourId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete deposit.");
    },
  });

  // Add Expense Mutation
  const addExpenseMutation = useMutation({
    mutationFn: () =>
      toursApi.createExpense(tourId, {
        title: expTitle.trim(),
        amount: parseFloat(expAmount),
        category: expCategory,
        date: new Date(expDate).toISOString(),
        memberId: expMemberId || undefined,
        notes: expNotes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Expense receipt saved!");
      setExpenseModalOpen(false);
      setExpTitle("");
      setExpAmount("");
      setExpNotes("");
      queryClient.invalidateQueries({ queryKey: ["tours", tourId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to record expense.");
    },
  });

  // Delete Expense Mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => toursApi.deleteExpense(tourId, id),
    onSuccess: () => {
      toast.success("Expense receipt deleted.");
      setDeleteExpenseId(null);
      queryClient.invalidateQueries({ queryKey: ["tours", tourId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete expense.");
    },
  });

  // Add Offline Friend Mutation
  const addMemberMutation = useMutation({
    mutationFn: () =>
      toursApi.createMember(tourId, {
        name: memName.trim(),
        phone: memPhone.trim() || undefined,
        email: memEmail.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Participant added to tour!");
      setMemberModalOpen(false);
      setMemName("");
      setMemPhone("");
      setMemEmail("");
      queryClient.invalidateQueries({ queryKey: ["tours", tourId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add member.");
    },
  });

  // Update Status / Role Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => toursApi.updateTour(tourId, { status }),
    onSuccess: () => {
      toast.success("Tour status updated!");
      queryClient.invalidateQueries({ queryKey: ["tours", tourId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update status.");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      toursApi.updateMember(tourId, memberId, { role }),
    onSuccess: () => {
      toast.success("Participant role updated!");
      queryClient.invalidateQueries({ queryKey: ["tours", tourId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update member role.");
    },
  });

  if (isLoading || !tour) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/tours"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Tours</span>
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={tour.name}
        description={
          tour.destination
            ? `Destination: ${tour.destination} • Invite Code: ${tour.inviteCode}`
            : `Invite Code: ${tour.inviteCode}`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyInvite(tour.inviteCode)}
            >
              {copiedCode ? (
                <>
                  <Check className="size-4 mr-1 text-emerald-500" /> Copied Code
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-1" /> Copy Code
                </>
              )}
            </Button>

            {isLead && (
              <select
                value={tour.status}
                onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2.5 text-xs font-semibold uppercase text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            )}

            {canManageFinance && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMemberModalOpen(true)}
                >
                  <UserPlus className="size-4 mr-1.5" />
                  Add Friend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositModalOpen(true)}
                >
                  <Wallet className="size-4 mr-1.5" />
                  Deposit
                </Button>
                <Button size="sm" onClick={() => setExpenseModalOpen(true)}>
                  <Plus className="size-4 mr-1.5" />
                  Log Expense
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        <Card className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Deposits
          </p>
          <p className="text-xl font-extrabold text-foreground mt-1">
            ৳{(summary?.totalDeposits || 0).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Expenses
          </p>
          <p className="text-xl font-extrabold text-foreground mt-1">
            ৳{(summary?.totalExpenses || 0).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Fund Balance
          </p>
          <p
            className={`text-xl font-extrabold mt-1 ${
              (summary?.balance || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            ৳{(summary?.balance || 0).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-primary/30 bg-primary/5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Equal Share / Person
          </p>
          <p className="text-xl font-extrabold text-primary font-mono mt-1">
            ৳{(summary?.perMemberShare || 0).toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 col-span-2 md:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Budget Remaining
          </p>
          <p className="text-xl font-extrabold text-foreground mt-1">
            ৳{(summary?.budgetRemaining || 0).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-3 mb-6 overflow-x-auto">
        {[
          { key: "OVERVIEW", label: "Overview & Stats" },
          { key: "PARTICIPANTS", label: `Participants (${members.length})` },
          { key: "DEPOSITS", label: `Deposits (${deposits.length})` },
          { key: "EXPENSES", label: `Expenses (${expenses.length})` },
          { key: "SETTLEMENT", label: "Final Settlement" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`text-xs px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense Categories</CardTitle>
              <CardDescription>Breakdown by major cost centers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary?.categoryBreakdown &&
              Object.keys(summary.categoryBreakdown).length > 0 ? (
                Object.entries(summary.categoryBreakdown).map(([cat, amt]) => {
                  const pct =
                    summary.totalExpenses > 0
                      ? Math.round((amt / summary.totalExpenses) * 100)
                      : 0;

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>{cat}</span>
                        <span className="font-mono font-bold">
                          ৳{amt.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No categorized expenses logged yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tour Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-semibold text-foreground">
                  {tour.destination || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-semibold text-foreground font-mono">
                  ৳{tour.budget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Dates:</span>
                <span className="font-semibold text-foreground">
                  {tour.startDate ? new Date(tour.startDate).toLocaleDateString() : ""}
                  {tour.endDate ? ` to ${new Date(tour.endDate).toLocaleDateString()}` : ""}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Tour Status:</span>
                <Badge variant="outline">{tour.status}</Badge>
              </div>
              {tour.description && (
                <div className="pt-2 text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Itinerary Notes:</p>
                  <p>{tour.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Participants */}
      {activeTab === "PARTICIPANTS" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tour Participants</CardTitle>
                <CardDescription>
                  Registered roommates and offline cash friends
                </CardDescription>
              </div>
              {canManageFinance && (
                <Button size="sm" onClick={() => setMemberModalOpen(true)}>
                  <UserPlus className="size-4 mr-1.5" />
                  Add Friend
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Deposited (৳)</TableHead>
                  <TableHead className="text-right">Equal Share (৳)</TableHead>
                  <TableHead className="text-right">Net Balance</TableHead>
                  {isLead && <TableHead className="text-right">Manage Role</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const net = (m.totalDeposited || 0) - (m.shareCost || 0);

                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-semibold text-sm">{m.name}</div>
                        {m.userId ? (
                          <span className="text-xs text-muted-foreground">{m.email}</span>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] py-0 h-4 mt-0.5">
                            Offline Friend (Cash)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {m.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            m.role === "LEAD"
                              ? "default"
                              : m.role === "ACCOUNTANT"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs font-bold"
                        >
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        ৳{(m.totalDeposited || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        ৳{(m.shareCost || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm">
                        <span className={net >= 0 ? "text-emerald-500" : "text-rose-500"}>
                          {net >= 0 ? `+৳${net.toFixed(2)}` : `-৳${Math.abs(net).toFixed(2)}`}
                        </span>
                      </TableCell>
                      {isLead && (
                        <TableCell className="text-right">
                          {m.role !== "LEAD" && (
                            <select
                              value={m.role}
                              onChange={(e) =>
                                updateRoleMutation.mutate({
                                  memberId: m.id,
                                  role: e.target.value,
                                })
                              }
                              className="h-7 rounded border border-input bg-card px-2 text-xs font-medium text-foreground focus-visible:outline-none"
                            >
                              <option value="MEMBER">Member</option>
                              <option value="ACCOUNTANT">Accountant</option>
                            </select>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Deposits */}
      {activeTab === "DEPOSITS" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tour Fund Deposits</CardTitle>
                <CardDescription>
                  Money paid by participants toward the tour pool
                </CardDescription>
              </div>
              {canManageFinance && (
                <Button size="sm" onClick={() => setDepositModalOpen(true)}>
                  <Plus className="size-4 mr-1.5" />
                  Record Deposit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {deposits.length === 0 ? (
              <p className="text-xs text-muted-foreground p-8 text-center">
                No deposits logged for this tour yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount (৳)</TableHead>
                    {canManageFinance && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="text-xs font-mono">
                        {new Date(dep.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {dep.member?.name || "Participant"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {dep.notes || "Tour deposit"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm">
                        ৳{dep.amount.toLocaleString()}
                      </TableCell>
                      {canManageFinance && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteDepositId(dep.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Expenses */}
      {activeTab === "EXPENSES" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tour Expenses & Receipts</CardTitle>
                <CardDescription>
                  Receipts and expenditures logged during the trip
                </CardDescription>
              </div>
              {canManageFinance && (
                <Button size="sm" onClick={() => setExpenseModalOpen(true)}>
                  <Plus className="size-4 mr-1.5" />
                  Log Expense
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expenses.length === 0 ? (
              <p className="text-xs text-muted-foreground p-8 text-center">
                No expense receipts logged yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Expense Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead className="text-right">Amount (৳)</TableHead>
                    {canManageFinance && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-xs font-mono">
                        {new Date(exp.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">{exp.title}</div>
                        {exp.notes && (
                          <p className="text-xs text-muted-foreground">{exp.notes}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {exp.member?.name || "Shared Tour Pool"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm">
                        ৳{exp.amount.toLocaleString()}
                      </TableCell>
                      {canManageFinance && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteExpenseId(exp.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Final Settlement */}
      {activeTab === "SETTLEMENT" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Final Equal Settlement Sheet</CardTitle>
            <CardDescription>
              Each member's equal cost share is ৳{(summary?.perMemberShare || 0).toFixed(2)}. Members with positive balances are owed a refund; members with negative balances must pay into the pool.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-right">Deposited (৳)</TableHead>
                  <TableHead className="text-right">Equal Share (৳)</TableHead>
                  <TableHead className="text-right">Net Settlement (৳)</TableHead>
                  <TableHead className="text-center">Action Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const net = (m.totalDeposited || 0) - (m.shareCost || 0);
                  const isPositive = net >= 0;

                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-semibold text-sm">{m.name}</div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {m.phone || m.email || "Offline"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        ৳{(m.totalDeposited || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        ৳{(m.shareCost || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-extrabold text-sm">
                        <span className={isPositive ? "text-emerald-500" : "text-rose-500"}>
                          {isPositive ? `+৳${net.toFixed(2)}` : `-৳${Math.abs(net).toFixed(2)}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={isPositive ? "default" : "destructive"}
                          className={
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/20 text-xs"
                          }
                        >
                          {isPositive
                            ? `Refund ৳${net.toFixed(2)}`
                            : `Owes ৳${Math.abs(net).toFixed(2)}`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal: Add Deposit */}
      <AppModal
        open={depositModalOpen}
        onOpenChange={setDepositModalOpen}
        title="Record Tour Deposit"
        subtitle="Participant contribution to the shared pool"
        icon={Wallet}
        primaryActions={
          <Button
            disabled={addDepositMutation.isPending || !depMemberId || !depAmount}
            onClick={() => addDepositMutation.mutate()}
          >
            {addDepositMutation.isPending ? "Recording…" : "Save Deposit"}
          </Button>
        }
        secondaryActions={
          <Button variant="outline" onClick={() => setDepositModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Participant
            </label>
            <select
              value={depMemberId}
              onChange={(e) => setDepMemberId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">-- Select Participant --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (৳)"
              type="number"
              step="any"
              min="1"
              placeholder="e.g. 5000"
              value={depAmount}
              onChange={(e) => setDepAmount(e.target.value)}
              required
            />
            <Input
              label="Date"
              type="date"
              value={depDate}
              onChange={(e) => setDepDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Notes (Optional)"
            placeholder="e.g. bKash / Cash"
            value={depNotes}
            onChange={(e) => setDepNotes(e.target.value)}
          />
        </div>
      </AppModal>

      {/* Modal: Add Expense */}
      <AppModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
        title="Log Tour Expense"
        subtitle="Receipt for transport, hotel, food, tickets, etc."
        icon={Receipt}
        primaryActions={
          <Button
            disabled={addExpenseMutation.isPending || !expTitle.trim() || !expAmount}
            onClick={() => addExpenseMutation.mutate()}
          >
            {addExpenseMutation.isPending ? "Saving…" : "Save Expense"}
          </Button>
        }
        secondaryActions={
          <Button variant="outline" onClick={() => setExpenseModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          <Input
            label="Expense Title"
            placeholder="e.g. Resort Booking / Chander Gari Rental"
            value={expTitle}
            onChange={(e) => setExpTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (৳)"
              type="number"
              step="any"
              min="1"
              placeholder="e.g. 8500"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Category
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Paid By (Optional)
              </label>
              <select
                value={expMemberId}
                onChange={(e) => setExpMemberId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">-- Shared Tour Fund Pool --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Receipt voucher #4491"
            value={expNotes}
            onChange={(e) => setExpNotes(e.target.value)}
          />
        </div>
      </AppModal>

      {/* Modal: Add Offline Friend */}
      <AppModal
        open={memberModalOpen}
        onOpenChange={setMemberModalOpen}
        title="Add Offline Friend"
        subtitle="Track friends joining the trip who don't have an online app account"
        icon={UserPlus}
        primaryActions={
          <Button
            disabled={addMemberMutation.isPending || !memName.trim()}
            onClick={() => addMemberMutation.mutate()}
          >
            {addMemberMutation.isPending ? "Adding…" : "Add Participant"}
          </Button>
        }
        secondaryActions={
          <Button variant="outline" onClick={() => setMemberModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          <Input
            label="Friend's Name"
            placeholder="e.g. Rahim (Cash)"
            value={memName}
            onChange={(e) => setMemName(e.target.value)}
            required
          />
          <Input
            label="Phone Number (Optional)"
            placeholder="017XXXXXXXX"
            value={memPhone}
            onChange={(e) => setMemPhone(e.target.value)}
          />
          <Input
            label="Email (Optional)"
            placeholder="friend@example.com"
            value={memEmail}
            onChange={(e) => setMemEmail(e.target.value)}
          />
        </div>
      </AppModal>

      {/* Delete Deposit Modal */}
      <ConfirmModal
        open={Boolean(deleteDepositId)}
        onOpenChange={(open) => !open && setDeleteDepositId(null)}
        title="Delete Tour Deposit?"
        subtitle="This deposit will be removed from the tour pool."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => deleteDepositId && deleteDepositMutation.mutate(deleteDepositId)}
        isPending={deleteDepositMutation.isPending}
      />

      {/* Delete Expense Modal */}
      <ConfirmModal
        open={Boolean(deleteExpenseId)}
        onOpenChange={(open) => !open && setDeleteExpenseId(null)}
        title="Delete Tour Expense?"
        subtitle="This expense will be deducted from the shared calculations."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => deleteExpenseId && deleteExpenseMutation.mutate(deleteExpenseId)}
        isPending={deleteExpenseMutation.isPending}
      />
    </AppShell>
  );
}

export default function TourWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="p-8 space-y-4 max-w-md w-full">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      }
    >
      <TourWorkspaceContent />
    </Suspense>
  );
}
