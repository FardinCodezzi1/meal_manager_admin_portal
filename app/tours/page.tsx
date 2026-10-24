"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Compass,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  MapPin,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/custom-ui/DataTable";
import { DataTableColumnHeader } from "@/components/ui/custom-ui/DataTableColumnHeader";
import { AppModal } from "@/components/modals/generic/AppModal";
import { DeleteConfirmModal } from "@/components/modals/generic/DeleteConfirmModal";
import { useAuth } from "@/providers/AuthProvider";
import { adminApi, toursApi, type TourSummaryItem } from "@/api/services";

export default function ToursOversightPage() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();

  const [search, setSearch] = useState("");

  // Create Tour Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDestination, setCreateDestination] = useState("");
  const [createBudget, setCreateBudget] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");
  const [createEndDate, setCreateEndDate] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourSummaryItem | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<TourSummaryItem | null>(null);

  // Query platform data from Admin API
  const { data: adminData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "platform"],
    queryFn: () => adminApi.getPlatformData(),
    enabled: Boolean(currentAdmin?.isSuperAdmin),
  });

  const allTours = adminData?.tours || [];

  // Filtered Tours
  const filteredTours = useMemo(() => {
    if (!search.trim()) return allTours;
    const q = search.toLowerCase();
    return allTours.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.destination && t.destination.toLowerCase().includes(q)) ||
        (t.leadName && t.leadName.toLowerCase().includes(q)) ||
        t.inviteCode.toLowerCase().includes(q)
    );
  }, [allTours, search]);

  // Create Tour Mutation
  const createTourMutation = useMutation({
    mutationFn: async () => {
      return toursApi.createTour({
        name: createName.trim(),
        destination: createDestination.trim() || undefined,
        budget: createBudget ? Number(createBudget) : undefined,
        startDate: createStartDate || undefined,
        endDate: createEndDate || undefined,
        description: createDescription.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(`Tour "${createName}" created successfully!`);
      setCreateModalOpen(false);
      setCreateName("");
      setCreateDestination("");
      setCreateBudget("");
      setCreateStartDate("");
      setCreateEndDate("");
      setCreateDescription("");
      queryClient.invalidateQueries({ queryKey: ["admin", "platform"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create tour workspace.");
    },
  });

  // Delete Tour Mutation
  const deleteTourMutation = useMutation({
    mutationFn: async (tourId: string) => {
      return toursApi.deleteTour(tourId);
    },
    onSuccess: () => {
      toast.success(`Tour "${tourToDelete?.name}" has been deleted.`);
      setDeleteModalOpen(false);
      setTourToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "platform"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete tour workspace.");
    },
  });

  const openDetailsModal = (tour: TourSummaryItem) => {
    setSelectedTour(tour);
    setDetailsModalOpen(true);
  };

  const openDeleteModal = (tour: TourSummaryItem) => {
    setTourToDelete(tour);
    setDeleteModalOpen(true);
  };

  // Table Columns
  const columns: ColumnDef<TourSummaryItem, any>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tour Trip" />,
        size: 240,
        minSize: 180,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 font-bold text-xs">
                <Compass className="size-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground text-xs truncate block">{t.name}</span>
                {t.destination && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-2.5" /> {t.destination}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "leadName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Lead Organizer" />,
        size: 150,
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.leadName || "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "membersCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Travelers" />,
        size: 100,
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-[11px] h-5 py-0">
            {row.original.membersCount} members
          </Badge>
        ),
      },
      {
        accessorKey: "budget",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Budget" />,
        size: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground">
            ৳{row.original.budget.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "totalExpenses",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Expenses" />,
        size: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-rose-500">
            ৳{row.original.totalExpenses.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        size: 110,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={status === "ACTIVE" ? "default" : status === "COMPLETED" ? "secondary" : "outline"}
              className="text-[10px] uppercase font-bold"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Super Controls",
        size: 160,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => openDetailsModal(t)}
                className="gap-1 text-[11px]"
                title="View Tour Breakdown"
              >
                <Eye className="size-3 text-primary" />
                <span>Details</span>
              </Button>
              <Button
                variant="destructive"
                size="xs"
                onClick={() => openDeleteModal(t)}
                className="gap-1 text-[11px]"
                title="Delete Tour"
              >
                <Trash2 className="size-3" />
                <span>Delete</span>
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Tours Oversight"
          description="Monitor travel group workspaces, establish new tours, oversee budgets, deposits, and settlement status"
        >
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setCreateName("");
                setCreateDestination("");
                setCreateBudget("");
                setCreateStartDate("");
                setCreateEndDate("");
                setCreateDescription("");
                setCreateModalOpen(true);
              }}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Create Tour</span>
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
                placeholder="Search by tour name, destination, or lead..."
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
          data={filteredTours}
          emptyMessage={isLoading ? "Loading tours..." : "No travel tour workspaces match your search."}
        />
      </div>

      {/* Modal 1: Create New Tour (Generic AppModal) */}
      <AppModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Establish New Tour Workspace"
        subtitle="Provision a group travel workspace with target budget and itinerary details"
        icon={Compass}
        size="md"
        primaryActions={
          <Button
            onClick={() => createTourMutation.mutate()}
            disabled={!createName.trim() || createTourMutation.isPending}
          >
            {createTourMutation.isPending ? "Creating tour..." : "Create Tour"}
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
            label="Tour Trip Name"
            placeholder="e.g. Sajek Valley Winter Expedition"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
          />

          <Input
            label="Destination"
            placeholder="e.g. Sajek Valley, Rangamati"
            value={createDestination}
            onChange={(e) => setCreateDestination(e.target.value)}
          />

          <Input
            label="Target Total Budget (৳)"
            type="number"
            placeholder="e.g. 50000"
            value={createBudget}
            onChange={(e) => setCreateBudget(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={createStartDate}
              onChange={(e) => setCreateStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={createEndDate}
              onChange={(e) => setCreateEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Notes / Description</label>
            <textarea
              rows={3}
              placeholder="Itinerary summary, hotel booking notes, or transport guidelines..."
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              className="w-full rounded-sm border border-input bg-field px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
        </div>
      </AppModal>

      {/* Modal 2: Tour Details (Generic AppModal) */}
      <AppModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        title={selectedTour?.name || "Tour Details"}
        subtitle={selectedTour?.destination ? `Destination: ${selectedTour.destination}` : undefined}
        icon={Compass}
        size="lg"
        primaryActions={
          <Button onClick={() => setDetailsModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedTour && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-sm border border-border bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Planned Budget</span>
                <p className="text-sm font-bold text-foreground mt-0.5">৳{selectedTour.budget.toLocaleString()}</p>
              </div>

              <div className="rounded-sm border border-border bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Deposits</span>
                <p className="text-sm font-bold text-emerald-500 mt-0.5">৳{selectedTour.totalDeposits.toLocaleString()}</p>
              </div>

              <div className="rounded-sm border border-border bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Expenses</span>
                <p className="text-sm font-bold text-rose-500 mt-0.5">৳{selectedTour.totalExpenses.toLocaleString()}</p>
              </div>

              <div className="rounded-sm border border-border bg-muted/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Fund Balance</span>
                <p className={`text-sm font-bold mt-0.5 ${selectedTour.balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  ৳{selectedTour.balance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Tour Metadata */}
            <div className="rounded-sm border border-border p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invite Code:</span>
                <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded-xs">
                  {selectedTour.inviteCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lead Organizer:</span>
                <span className="font-semibold text-foreground">{selectedTour.leadName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Dates:</span>
                <span className="text-foreground">
                  {selectedTour.startDate ? `${new Date(selectedTour.startDate).toLocaleDateString()} - ${selectedTour.endDate ? new Date(selectedTour.endDate).toLocaleDateString() : "Ongoing"}` : "Unscheduled"}
                </span>
              </div>
              {selectedTour.description && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block text-[11px] mb-1">Notes / Description:</span>
                  <p className="text-foreground">{selectedTour.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </AppModal>

      {/* Modal 3: Delete Tour Confirmation (Generic DeleteConfirmModal) */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Permanently Delete Tour"
        subtitle={`Are you sure you want to delete tour "${tourToDelete?.name}"?`}
        itemName={tourToDelete?.name || "this tour workspace"}
        onConfirm={() => {
          if (tourToDelete) {
            deleteTourMutation.mutate(tourToDelete.id);
          }
        }}
        isPending={deleteTourMutation.isPending}
      />
    </AppShell>
  );
}
