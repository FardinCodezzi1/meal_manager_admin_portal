"use client";

import type { LucideIcon } from "lucide-react";
import { HelpCircle } from "lucide-react";
import { AppModal, type AppModalSize } from "@/components/modals/generic/AppModal";
import { Button } from "@/components/ui/button";

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
  variant?: "default" | "destructive";
  size?: AppModalSize;
  children?: React.ReactNode;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  subtitle,
  icon = HelpCircle,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isPending = false,
  variant = "default",
  size = "sm",
  children,
}: ConfirmModalProps) {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      subtitle={subtitle}
      icon={icon}
      size={size}
      primaryActions={
        <Button
          type="button"
          variant={variant === "destructive" ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Please wait…" : confirmLabel}
        </Button>
      }
      secondaryActions={
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          {cancelLabel}
        </Button>
      }
    >
      {children}
    </AppModal>
  );
}
