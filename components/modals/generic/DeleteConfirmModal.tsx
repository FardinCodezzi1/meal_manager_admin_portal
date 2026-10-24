"use client";

import { Trash2 } from "lucide-react";
import { AppModal } from "@/components/modals/generic/AppModal";
import { Button } from "@/components/ui/button";

export interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  itemName?: string;
  deleteItemName?: string;
  onConfirm: () => void;
  isPending?: boolean;
  confirmLabel?: string;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title = "Delete item?",
  subtitle,
  itemName,
  deleteItemName,
  onConfirm,
  isPending = false,
  confirmLabel = "Delete",
}: DeleteConfirmModalProps) {
  const targetName = itemName || deleteItemName;
  const description =
    subtitle ??
    (targetName
      ? `“${targetName}” will be permanently removed. This cannot be undone.`
      : "This action cannot be undone.");

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      subtitle={description}
      icon={Trash2}
      size="sm"
      footerAlign="danger"
      primaryActions={
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Deleting…" : confirmLabel}
        </Button>
      }
      secondaryActions={
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
      }
    />
  );
}
