"use client";

import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { AppModal, type AppModalSize } from "@/components/modals/generic/AppModal";
import { Button } from "@/components/ui/button";

export type AlertModalVariant = "info" | "success" | "warning";

const variantConfig: Record<
  AlertModalVariant,
  { icon: LucideIcon; defaultTitle: string }
> = {
  info: { icon: Info, defaultTitle: "Notice" },
  success: { icon: CheckCircle2, defaultTitle: "Success" },
  warning: { icon: AlertTriangle, defaultTitle: "Warning" },
};

export interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  variant?: AlertModalVariant;
  icon?: LucideIcon;
  okLabel?: string;
  size?: AppModalSize;
  children?: React.ReactNode;
}

export function AlertModal({
  open,
  onOpenChange,
  title,
  subtitle,
  variant = "info",
  icon,
  okLabel = "OK",
  size = "sm",
  children,
}: AlertModalProps) {
  const config = variantConfig[variant];
  const Icon = icon ?? config.icon;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? config.defaultTitle}
      subtitle={subtitle}
      icon={Icon}
      size={size}
      primaryActions={
        <Button type="button" onClick={() => onOpenChange(false)}>
          {okLabel}
        </Button>
      }
    >
      {children}
    </AppModal>
  );
}
