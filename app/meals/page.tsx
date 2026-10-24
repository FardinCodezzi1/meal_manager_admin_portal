"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UtensilsCrossed,
  Check,
  X,
  Plus,
  PlaneTakeoff,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { mealsApi, type MessMemberData } from "@/api/services";
import { getDefaultMonthKey, getDefaultDateString } from "@/lib/date.util";

export default function MealsPage() {
  const queryClient = useQueryClient();
  const { user, membership } = useAuth();
  const isManager = membership?.role === "MANAGER";

  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonthKey);

  // Meal Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState("");
  const [editMemberName, setEditMemberName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLunch, setEditLunch] = useState<number>(1.0);
  const [editDinner, setEditDinner] = useState<number>(1.0);

  // Leave Request Modal State
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState(getDefaultDateString);
  const [leaveEndDate, setLeaveEndDate] = useState(getDefaultDateString);
  const [leaveReason, setLeaveReason] = useState("");

  useEffect(() => {
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setLeaveStartDate(new Date().toISOString().slice(0, 10));
    setLeaveEndDate(new Date().toISOString().slice(0, 10));
  }, []);

  // Sub-tab view: Grid vs Leaves
  const [viewTab, setViewTab] = useState<"GRID" | "LEAVES">("GRID");

  // Query Daily Meals
  const { data: mealsData, isLoading: isMealsLoading } = useQuery({
    queryKey: ["meals", selectedMonth],
    queryFn: () => mealsApi.getMeals(selectedMonth),
    enabled: Boolean(membership),
  });

  // Query Leave Requests
  const { data: leaveData, isLoading: isLeaveLoading } = useQuery({
    queryKey: ["meals", "leaves"],
    queryFn: () => mealsApi.getLeaveRequests(),
    enabled: Boolean(membership),
  });

  const meals = mealsData?.meals || [];
  const members = mealsData?.members || [];
  const leaveRequests = leaveData?.requests || [];

  // Generate array of days for selectedMonth (e.g. 1..31)
  const [yearStr, monthStr] = selectedMonth.split("-");
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || new Date().getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Update Meal Mutation
  const updateMealMutation = useMutation({
    mutationFn: () =>
      mealsApi.updateMeal({
        memberId: editMemberId,
        date: new Date(Date.UTC(year, month - 1, parseInt(editDate, 10))).toISOString(),
        lunch: editLunch,
        dinner: editDinner,
      }),
    onSuccess: () => {
      toast.success("Meal record updated!");
      setEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["meals", selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ["summary", selectedMonth] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update meal record.");
    },
  });

  // Submit Leave Request Mutation
  const leaveRequestMutation = useMutation({
    mutationFn: () =>
      mealsApi.createLeaveRequest({
        startDate: new Date(leaveStartDate).toISOString(),
        endDate: new Date(leaveEndDate).toISOString(),
        reason: leaveReason.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Leave request submitted!");
      setLeaveModalOpen(false);
      setLeaveReason("");
      queryClient.invalidateQueries({ queryKey: ["meals", "leaves"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit leave request.");
    },
  });

  // Approve / Reject Leave Mutation
  const approveLeaveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      mealsApi.approveLeaveRequest(id, status),
    onSuccess: (_, vars) => {
      toast.success(`Leave request ${vars.status.toLowerCase()}!`);
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["summary", selectedMonth] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update leave request.");
    },
  });

  // Open Edit Modal for a cell
  const handleCellClick = (member: MessMemberData, day: number) => {
    // Permission check
    const isSelf = member.userId === user?.id;
    if (!isManager && !isSelf) {
      toast.error("You can only log your own daily meals.");
      return;
    }

    const dayPad = String(day).padStart(2, "0");
    const datePrefix = `${selectedMonth}-${dayPad}`;

    // Find existing meal record
    const record = meals.find((m) => {
      const mDate = m.date.slice(0, 10);
      return m.memberId === member.id && mDate === datePrefix;
    });

    setEditMemberId(member.id);
    setEditMemberName(member.user.name);
    setEditDate(String(day));
    setEditLunch(record ? record.lunch : 1.0);
    setEditDinner(record ? record.dinner : 1.0);
    setEditModalOpen(true);
  };

  return (
    <AppShell>
      <PageHeader
        title="Daily Meals Tracker"
        description="Daily meal counts (Lunch/Dinner decimals) and official leave requests"
        actions={
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveModalOpen(true)}
            >
              <PlaneTakeoff className="size-4 mr-1.5" />
              Request Leave
            </Button>
          </div>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-border pb-3 mb-6">
        <button
          type="button"
          onClick={() => setViewTab("GRID")}
          className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            viewTab === "GRID"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly Meals Matrix
        </button>
        <button
          type="button"
          onClick={() => setViewTab("LEAVES")}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            viewTab === "LEAVES"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Leave Requests
          {leaveRequests.filter((r) => r.status === "PENDING").length > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-black font-bold">
              {leaveRequests.filter((r) => r.status === "PENDING").length}
            </span>
          )}
        </button>
      </div>

      {viewTab === "GRID" ? (
        /* Matrix Grid */
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-card pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">
                  Meals Grid for {selectedMonth}
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any cell to edit lunch/dinner values. Numbers show Total (Lunch + Dinner).
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-2.5 rounded-full bg-primary" /> Active Meal
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2.5 rounded-full bg-amber-500" /> Approved Leave
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {isMealsLoading ? (
              <div className="p-8 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No active members found in this mess.
              </div>
            ) : (
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="sticky left-0 z-10 bg-muted/90 p-2.5 text-left font-bold min-w-[140px] border-r border-border backdrop-blur-xs">
                      Roommate
                    </th>
                    {daysArray.map((day) => (
                      <th
                        key={day}
                        className="p-1.5 text-center font-bold text-muted-foreground border-r border-border/50 min-w-[38px]"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="p-2.5 text-center font-bold min-w-[60px] bg-muted/60">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const isSelf = member.userId === user?.id;
                    let memberTotal = 0;

                    return (
                      <tr
                        key={member.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                      >
                        {/* Member Name Fixed Column */}
                        <td className="sticky left-0 z-10 bg-card p-2.5 font-medium border-r border-border whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[100px]">{member.user.name}</span>
                            {isSelf && (
                              <Badge variant="secondary" className="text-[9px] py-0 h-3.5">
                                You
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Days Cells */}
                        {daysArray.map((day) => {
                          const dayPad = String(day).padStart(2, "0");
                          const datePrefix = `${selectedMonth}-${dayPad}`;

                          const record = meals.find((m) => {
                            const mDate = m.date.slice(0, 10);
                            return m.memberId === member.id && mDate === datePrefix;
                          });

                          const lunch = record ? record.lunch : 1.0;
                          const dinner = record ? record.dinner : 1.0;
                          const isLeave = record?.isLeave;
                          const dayTotal = isLeave ? 0 : lunch + dinner;
                          memberTotal += dayTotal;

                          const canEdit = isManager || isSelf;

                          return (
                            <td
                              key={day}
                              onClick={() => handleCellClick(member, day)}
                              className={`p-1 text-center font-mono border-r border-border/50 transition-colors ${
                                canEdit ? "cursor-pointer hover:bg-primary/10" : ""
                              } ${
                                isLeave
                                  ? "bg-amber-500/10 text-amber-500 font-bold"
                                  : dayTotal === 0
                                  ? "text-muted-foreground/40"
                                  : "text-foreground font-semibold"
                              }`}
                              title={`${member.user.name} - Day ${day}: Lunch ${lunch}, Dinner ${dinner}${
                                isLeave ? " (Leave)" : ""
                              }`}
                            >
                              {isLeave ? "L" : dayTotal}
                            </td>
                          );
                        })}

                        {/* Row Total */}
                        <td className="p-2.5 text-center font-bold font-mono text-sm bg-muted/30">
                          {memberTotal.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Leave Requests Tab */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Leave Requests</CardTitle>
                <CardDescription>
                  Review submitted date-range meal leaves
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setLeaveModalOpen(true)}>
                <Plus className="size-4 mr-1.5" />
                Submit New Leave
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLeaveLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No leave requests filed yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium text-sm">
                        {req.member?.user?.name || "Roommate"}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {new Date(req.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {new Date(req.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {req.reason || "Personal leave"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.status === "APPROVED"
                              ? "default"
                              : req.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            req.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : req.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : ""
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isManager && req.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title="Approve leave"
                              className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              onClick={() =>
                                approveLeaveMutation.mutate({ id: req.id, status: "APPROVED" })
                              }
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title="Reject leave"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                approveLeaveMutation.mutate({ id: req.id, status: "REJECTED" })
                              }
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Single Day Meal Modal */}
      <AppModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title={`Edit Meals - Day ${editDate}`}
        subtitle={`Member: ${editMemberName}`}
        icon={UtensilsCrossed}
        size="sm"
        primaryActions={
          <Button
            disabled={updateMealMutation.isPending}
            onClick={() => updateMealMutation.mutate()}
          >
            {updateMealMutation.isPending ? "Saving…" : "Save Meals"}
          </Button>
        }
        secondaryActions={
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          {/* Lunch Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Lunch Meals
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 0.5, 1.0, 1.5, 2.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEditLunch(val)}
                  className={`py-1.5 rounded-md border text-xs font-bold font-mono transition-colors cursor-pointer ${
                    editLunch === val
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-input bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Dinner Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Dinner Meals
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 0.5, 1.0, 1.5, 2.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEditDinner(val)}
                  className={`py-1.5 rounded-md border text-xs font-bold font-mono transition-colors cursor-pointer ${
                    editDinner === val
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-input bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground flex justify-between items-center font-mono">
            <span>Day Total:</span>
            <span className="font-bold text-foreground text-sm">
              {(editLunch + editDinner).toFixed(1)} meals
            </span>
          </div>
        </div>
      </AppModal>

      {/* Request Leave Modal */}
      <AppModal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        title="Submit Leave Request"
        subtitle="Approved leaves automatically zero out daily meals"
        icon={PlaneTakeoff}
        primaryActions={
          <Button
            disabled={leaveRequestMutation.isPending || !leaveStartDate || !leaveEndDate}
            onClick={() => leaveRequestMutation.mutate()}
          >
            {leaveRequestMutation.isPending ? "Submitting…" : "Submit Request"}
          </Button>
        }
        secondaryActions={
          <Button variant="outline" onClick={() => setLeaveModalOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={leaveStartDate}
              onChange={(e) => setLeaveStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={leaveEndDate}
              onChange={(e) => setLeaveEndDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Reason (Optional)"
            placeholder="e.g. Vacation, going home for weekend"
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
          />
        </div>
      </AppModal>
    </AppShell>
  );
}
