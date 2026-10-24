"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  Plus,
  Check,
  X,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
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
import { bazarApi, type ChecklistItem } from "@/api/services";
import { getDefaultMonthKey, getDefaultDateString } from "@/lib/date.util";

const CATEGORIES = [
  "Vegetables",
  "Fish/Meat",
  "Groceries & Rice",
  "Spices & Oil",
  "Gas & Utilities",
  "Miscellaneous",
];

export default function BazarPage() {
  const queryClient = useQueryClient();
  const { user, membership } = useAuth();
  const isManager = membership?.role === "MANAGER";

  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonthKey);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create Entry Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<"QUICK" | "CHECKLIST">("QUICK");
  const [entryDate, setEntryDate] = useState(getDefaultDateString);

  useEffect(() => {
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setEntryDate(new Date().toISOString().slice(0, 10));
  }, []);
  const [entryCategory, setEntryCategory] = useState(CATEGORIES[0]);
  const [quickAmount, setQuickAmount] = useState("");
  const [entryNotes, setEntryNotes] = useState("");

  // Checklist Items State
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { name: "", qty: "", price: 0, bought: true },
  ]);

  // Delete State
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  // Queries
  const { data: bazarData, isLoading: isBazarLoading } = useQuery({
    queryKey: ["bazar", selectedMonth],
    queryFn: () => bazarApi.getEntries(selectedMonth),
    enabled: Boolean(membership),
  });

  const entries = bazarData?.entries || [];

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    if (statusFilter === "ALL") return true;
    return e.status === statusFilter;
  });

  // Calculate totals
  const approvedTotal = entries
    .filter((e) => e.status === "APPROVED")
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingTotal = entries
    .filter((e) => e.status === "PENDING")
    .reduce((sum, e) => sum + e.amount, 0);

  // Checklist Helpers
  const addChecklistItem = () => {
    setChecklistItems((prev) => [
      ...prev,
      { name: "", qty: "", price: 0, bought: true },
    ]);
  };

  const updateChecklistItem = (
    index: number,
    field: keyof ChecklistItem,
    value: any
  ) => {
    setChecklistItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  const checklistTotal = checklistItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  );

  // Create Mutation
  const createEntryMutation = useMutation({
    mutationFn: () => {
      const amount =
        entryMode === "QUICK" ? parseFloat(quickAmount) : checklistTotal;

      return bazarApi.createEntry({
        monthKey: selectedMonth,
        amount,
        category: entryCategory,
        date: new Date(entryDate).toISOString(),
        mode: entryMode,
        items: entryMode === "CHECKLIST" ? checklistItems : undefined,
        notes: entryNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(
        isManager
          ? "Bazar entry recorded and approved!"
          : "Bazar entry submitted for manager approval!"
      );
      setCreateModalOpen(false);
      setQuickAmount("");
      setEntryNotes("");
      setChecklistItems([{ name: "", qty: "", price: 0, bought: true }]);
      queryClient.invalidateQueries({ queryKey: ["bazar", selectedMonth] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit bazar entry.");
    },
  });

  // Approve / Reject Mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      bazarApi.approveEntry(id, status),
    onSuccess: (_, vars) => {
      toast.success(`Bazar entry marked as ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["bazar", selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ["summary", selectedMonth] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update entry status.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bazarApi.deleteEntry(id),
    onSuccess: () => {
      toast.success("Bazar entry deleted.");
      setDeleteEntryId(null);
      queryClient.invalidateQueries({ queryKey: ["bazar", selectedMonth] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete entry.");
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Bazar Expense Tracker"
        description="Submit receipts, checklist purchases, and manage manager approvals"
        actions={
          <div className="flex items-center gap-3">
            {/* Month Selector */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />

            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              Log Bazar
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Approved Bazar
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              ৳{approvedTotal.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Counted in meal rate calculation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Pending Approvals
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-amber-500">
              ৳{pendingTotal.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {entries.filter((e) => e.status === "PENDING").length} submissions awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">
              Total Purchases
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {entries.length} Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">For month of {selectedMonth}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bazar Table with Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Bazar Expense Logs</CardTitle>
              <CardDescription>
                Detailed receipts submitted by members and manager
              </CardDescription>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-lg border border-border">
              {["ALL", "APPROVED", "PENDING", "REJECTED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isBazarLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No bazar entries match the selected month and filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Details / Notes</TableHead>
                  <TableHead className="text-right">Amount (৳)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => {
                  const isSubmitter = entry.member?.userId === user?.id;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs font-mono">
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {entry.member?.user?.name || "Roommate"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs max-w-xs space-y-1">
                          {entry.notes && <p className="text-foreground">{entry.notes}</p>}
                          {entry.items && entry.items.length > 0 && (
                            <div className="text-[11px] text-muted-foreground">
                              {entry.items.map((it, i) => (
                                <span key={i} className="inline-block mr-2">
                                  • {it.name} ({it.qty || "1"}) ৳{it.price}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm font-mono">
                        ৳{entry.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.status === "APPROVED"
                              ? "default"
                              : entry.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            entry.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : entry.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : ""
                          }
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Manager Approval Controls */}
                          {isManager && entry.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                title="Approve"
                                className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                onClick={() =>
                                  approveMutation.mutate({ id: entry.id, status: "APPROVED" })
                                }
                              >
                                <Check className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                title="Reject"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  approveMutation.mutate({ id: entry.id, status: "REJECTED" })
                                }
                              >
                                <X className="size-4" />
                              </Button>
                            </>
                          )}

                          {/* Delete Button (Manager or Owner if pending) */}
                          {(isManager || (isSubmitter && entry.status === "PENDING")) && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title="Delete entry"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteEntryId(entry.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Log Bazar Modal (Quick vs Checklist) */}
      <AppModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Log Bazar Purchase"
        subtitle={
          isManager
            ? "Manager purchases are auto-approved"
            : "Roommate submissions will be sent to the manager for review"
        }
        icon={ShoppingCart}
        size="lg"
        primaryActions={
          <Button
            disabled={
              createEntryMutation.isPending ||
              (entryMode === "QUICK" && (!quickAmount || parseFloat(quickAmount) <= 0)) ||
              (entryMode === "CHECKLIST" && checklistTotal <= 0)
            }
            onClick={() => createEntryMutation.mutate()}
          >
            {createEntryMutation.isPending
              ? "Saving…"
              : `Submit ৳${entryMode === "QUICK" ? quickAmount || "0" : checklistTotal}`}
          </Button>
        }
        secondaryActions={
          <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-border p-1 bg-muted/30">
            <button
              type="button"
              onClick={() => setEntryMode("QUICK")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                entryMode === "QUICK"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Quick Mode (Single Total)
            </button>
            <button
              type="button"
              onClick={() => setEntryMode("CHECKLIST")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                entryMode === "CHECKLIST"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Checklist Mode (Itemized List)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Purchase Date"
              type="date"
              icon={Calendar}
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Category
              </label>
              <select
                value={entryCategory}
                onChange={(e) => setEntryCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Mode Input */}
          {entryMode === "QUICK" ? (
            <Input
              label="Total Amount (৳)"
              type="number"
              step="any"
              min="1"
              icon={DollarSign}
              placeholder="e.g. 1250"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              required
            />
          ) : (
            /* Checklist Mode Itemized Rows */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Purchased Items
                </span>
                <span className="text-xs font-mono font-bold text-primary">
                  Subtotal: ৳{checklistTotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Rice)"
                      value={item.name}
                      onChange={(e) => updateChecklistItem(idx, "name", e.target.value)}
                      className="flex-1 h-9 rounded-md border border-input bg-card px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Qty (e.g. 5kg)"
                      value={item.qty}
                      onChange={(e) => updateChecklistItem(idx, "qty", e.target.value)}
                      className="w-20 h-9 rounded-md border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Price"
                      value={item.price || ""}
                      onChange={(e) =>
                        updateChecklistItem(idx, "price", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 h-9 rounded-md border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      disabled={checklistItems.length <= 1}
                      onClick={() => removeChecklistItem(idx)}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-30 p-1 cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={addChecklistItem}
              >
                <Plus className="size-3 mr-1" /> Add Another Item
              </Button>
            </div>
          )}

          <Input
            label="Notes / Receipt info (Optional)"
            icon={FileText}
            placeholder="e.g. Market vendor: Kashem Store"
            value={entryNotes}
            onChange={(e) => setEntryNotes(e.target.value)}
          />
        </div>
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteEntryId)}
        onOpenChange={(open) => !open && setDeleteEntryId(null)}
        title="Delete Bazar Entry?"
        subtitle="This action will remove the record from the monthly calculation"
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => deleteEntryId && deleteMutation.mutate(deleteEntryId)}
        isPending={deleteMutation.isPending}
      />
    </AppShell>
  );
}
