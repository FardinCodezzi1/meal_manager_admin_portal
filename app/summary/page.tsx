"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UtensilsCrossed,
  Receipt,
  Copy,
  Check,
  Upload,
  Plus,
  Trash2,
  Wallet,
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
import {
  summaryApi,
  depositsApi,
  messApi,
} from "@/api/services";
import { getDefaultMonthKey, getDefaultDateString } from "@/lib/date.util";

export default function SummaryPage() {
  const queryClient = useQueryClient();
  const { membership } = useAuth();
  const isManager = membership?.role === "MANAGER";

  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonthKey);

  const [copiedExport, setCopiedExport] = useState(false);

  // Sub-tabs: Summary vs Deposits
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "DEPOSITS">("SUMMARY");

  // Record Deposit Modal State
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositMemberId, setDepositMemberId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDate, setDepositDate] = useState(getDefaultDateString);
  const [depositNotes, setDepositNotes] = useState("");

  useEffect(() => {
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setDepositDate(new Date().toISOString().slice(0, 10));
  }, []);

  // Delete Deposit Modal State
  const [deleteDepositId, setDeleteDepositId] = useState<string | null>(null);

  // Import JSON Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");

  // Query Summary
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["summary", selectedMonth],
    queryFn: () => summaryApi.getSummary(selectedMonth),
    enabled: Boolean(membership),
  });

  // Query Deposits
  const { data: depositsData, isLoading: isDepositsLoading } = useQuery({
    queryKey: ["deposits", selectedMonth],
    queryFn: () => depositsApi.getDeposits(selectedMonth),
    enabled: Boolean(membership),
  });

  // Query Mess Members for selector
  const { data: membersData } = useQuery({
    queryKey: ["mess", "members"],
    queryFn: () => messApi.getMembers(),
    enabled: Boolean(membership),
  });

  const members = membersData?.members || [];
  const deposits = depositsData?.deposits || [];

  // Record Deposit Mutation
  const recordDepositMutation = useMutation({
    mutationFn: () =>
      depositsApi.createDeposit({
        monthKey: selectedMonth,
        memberId: depositMemberId,
        amount: parseFloat(depositAmount),
        date: new Date(depositDate).toISOString(),
        notes: depositNotes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Deposit recorded successfully!");
      setDepositModalOpen(false);
      setDepositAmount("");
      setDepositNotes("");
      queryClient.invalidateQueries({ queryKey: ["deposits", selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ["summary", selectedMonth] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to record deposit.");
    },
  });

  // Delete Deposit Mutation
  const deleteDepositMutation = useMutation({
    mutationFn: (id: string) => depositsApi.deleteDeposit(id),
    onSuccess: () => {
      toast.success("Deposit record removed.");
      setDeleteDepositId(null);
      queryClient.invalidateQueries({ queryKey: ["deposits", selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ["summary", selectedMonth] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete deposit.");
    },
  });

  // Export JSON & Copy to Clipboard
  const handleExportJson = async () => {
    try {
      const data = await messApi.exportData(selectedMonth);
      const jsonStr = JSON.stringify(data, null, 2);

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(jsonStr);
        setCopiedExport(true);
        toast.success("Full month backup JSON copied to clipboard!");
        setTimeout(() => setCopiedExport(false), 2500);
      }

      // Also trigger file download fallback
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mess-backup-${selectedMonth}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err?.message || "Failed to export data.");
    }
  };

  // Import JSON Mutation
  const importMutation = useMutation({
    mutationFn: (payload: any) => messApi.importData(payload),
    onSuccess: () => {
      toast.success("Data imported and restored successfully!");
      setImportModalOpen(false);
      setImportJsonText("");
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["bazar"] });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to import data JSON.");
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Monthly Summary & Balances"
        description="Comprehensive meal rates, deposit balances, reconciliation, and cloud backups"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />

            <Button variant="outline" size="sm" onClick={handleExportJson}>
              {copiedExport ? (
                <>
                  <Check className="size-4 mr-1.5 text-emerald-500" />
                  Copied JSON!
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-1.5" />
                  Export Backup
                </>
              )}
            </Button>

            {isManager && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportModalOpen(true)}
              >
                <Upload className="size-4 mr-1.5" />
                Restore JSON
              </Button>
            )}

            {isManager && (
              <Button size="sm" onClick={() => setDepositModalOpen(true)}>
                <Plus className="size-4 mr-1.5" />
                Record Deposit
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Approved Bazar
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              ৳{(summaryData?.totalApprovedBazar || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Receipt className="size-3.5" />
              Total approved groceries
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Total Deposits
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              ৳{(summaryData?.totalDeposits || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Wallet className="size-3.5" />
              Funds collected
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Meals Consumed
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {(summaryData?.totalMeals || 0).toFixed(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <UtensilsCrossed className="size-3.5" />
              Total member meal count
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-primary">
              Meal Rate (৳ / Meal)
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-primary font-mono">
              ৳{(summaryData?.mealRate || 0).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-mono">
              Bazar / Total Meals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tab view: Balance Sheet vs Recorded Deposits */}
      <div className="flex gap-2 border-b border-border pb-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("SUMMARY")}
          className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            activeTab === "SUMMARY"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Reconciliation Balance Sheet
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("DEPOSITS")}
          className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            activeTab === "DEPOSITS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Recorded Deposits ({deposits.length})
        </button>
      </div>

      {activeTab === "SUMMARY" ? (
        /* Balance Sheet Table */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Member Reconciliation</CardTitle>
            <CardDescription>
              Calculation: Balance = Total Deposit - (Total Meals × Meal Rate). Green indicates refund due to member; Red indicates amount owed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isSummaryLoading ? (
              <div className="p-8 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !summaryData?.memberSummaries?.length ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No member records found for {selectedMonth}.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Total Meals</TableHead>
                    <TableHead className="text-right">Deposited (৳)</TableHead>
                    <TableHead className="text-right">Meal Cost (৳)</TableHead>
                    <TableHead className="text-right">Net Balance (৳)</TableHead>
                    <TableHead className="text-center">Settlement Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.memberSummaries.map((m) => {
                    const isPositive = m.balance >= 0;

                    return (
                      <TableRow key={m.memberId}>
                        <TableCell>
                          <div className="font-semibold text-sm">{m.name}</div>
                          <span className="text-xs text-muted-foreground">{m.email}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {m.totalMeals.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          ৳{m.totalDeposit.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          ৳{m.mealCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-extrabold text-sm">
                          <span
                            className={
                              isPositive
                                ? "text-emerald-500 font-bold"
                                : "text-rose-500 font-bold"
                            }
                          >
                            {isPositive ? `+৳${m.balance.toFixed(2)}` : `-৳${Math.abs(m.balance).toFixed(2)}`}
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
                            {isPositive ? "Refund Due" : "Payment Due"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Deposits Log Table */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Monthly Deposits</CardTitle>
                <CardDescription>
                  List of member contributions logged by the manager
                </CardDescription>
              </div>
              {isManager && (
                <Button size="sm" onClick={() => setDepositModalOpen(true)}>
                  <Plus className="size-4 mr-1.5" />
                  Add Deposit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isDepositsLoading ? (
              <div className="p-8 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : deposits.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No deposits recorded for {selectedMonth}.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount (৳)</TableHead>
                    {isManager && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="text-xs font-mono">
                        {new Date(dep.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {dep.member?.user?.name || "Roommate"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {dep.notes || "Monthly deposit"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm">
                        ৳{dep.amount.toLocaleString()}
                      </TableCell>
                      {isManager && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="Delete deposit"
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

      {/* Record Deposit Modal */}
      <AppModal
        open={depositModalOpen}
        onOpenChange={setDepositModalOpen}
        title="Record Member Deposit"
        subtitle="Credits will be factored into the member's monthly balance"
        icon={Wallet}
        primaryActions={
          <Button
            disabled={
              recordDepositMutation.isPending ||
              !depositMemberId ||
              !depositAmount ||
              parseFloat(depositAmount) <= 0
            }
            onClick={() => recordDepositMutation.mutate()}
          >
            {recordDepositMutation.isPending ? "Recording…" : "Save Deposit"}
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
              Roommate
            </label>
            <select
              value={depositMemberId}
              onChange={(e) => setDepositMemberId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">-- Select Member --</option>
              {members
                .filter((m) => m.status === "ACTIVE")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.user.name} ({m.user.email})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Deposit Amount (৳)"
              type="number"
              step="any"
              min="1"
              placeholder="e.g. 3000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
            />
            <Input
              label="Date"
              type="date"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Notes (Optional)"
            placeholder="e.g. bKash payment / Cash"
            value={depositNotes}
            onChange={(e) => setDepositNotes(e.target.value)}
          />
        </div>
      </AppModal>

      {/* Delete Deposit Modal */}
      <ConfirmModal
        open={Boolean(deleteDepositId)}
        onOpenChange={(open) => !open && setDeleteDepositId(null)}
        title="Delete Deposit Record?"
        subtitle="This will adjust the member's balance immediately."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => deleteDepositId && deleteDepositMutation.mutate(deleteDepositId)}
        isPending={deleteDepositMutation.isPending}
      />

      {/* Restore JSON Modal */}
      <AppModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        title="Cloud Data Restore"
        subtitle="Paste a previously exported mess JSON backup payload"
        icon={Upload}
        size="lg"
        primaryActions={
          <Button
            disabled={importMutation.isPending || !importJsonText.trim()}
            onClick={() => {
              try {
                const parsed = JSON.parse(importJsonText);
                importMutation.mutate(parsed);
              } catch {
                toast.error("Invalid JSON syntax. Please verify the copied string.");
              }
            }}
          >
            {importMutation.isPending ? "Restoring…" : "Restore Backup"}
          </Button>
        }
        secondaryActions={
          <Button variant="outline" onClick={() => setImportModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            Paste the raw JSON data below. This will overwrite/merge records for the corresponding month.
          </p>
          <textarea
            rows={10}
            className="w-full rounded-md border border-input bg-card p-3 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder='{"monthKey": "2026-10", "bazar": [...], "meals": [...]}'
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
          />
        </div>
      </AppModal>
    </AppShell>
  );
}
