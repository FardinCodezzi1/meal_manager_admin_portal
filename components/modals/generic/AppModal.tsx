"use client";

import type { LucideIcon } from "lucide-react";
import { XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn.util";

export type AppModalSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClasses: Record<AppModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  full: "sm:max-w-4xl",
};

export interface AppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  size?: AppModalSize;
  children?: React.ReactNode;
  primaryActions?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  bodyClassName?: string;
  /** default: Cancel left / primary right. danger: confirm left / Cancel right. */
  footerAlign?: "default" | "danger";
}

export function AppModal({
  open,
  onOpenChange,
  title,
  subtitle,
  icon: Icon,
  size = "md",
  children,
  primaryActions,
  secondaryActions,
  showCloseButton = true,
  className,
  bodyClassName,
  footerAlign = "default",
}: AppModalProps) {
  const handleOpenChange = (
    nextOpen: boolean,
    eventDetails?: { reason?: string },
  ) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    const reason = eventDetails?.reason;
    if (
      reason === "escapeKey" ||
      reason === "outsidePress" ||
      reason === "focusOut"
    ) {
      return;
    }

    onOpenChange(false);
  };

  const close = () => onOpenChange(false);

  // Check if header content exists
  const hasHeaderContent = Boolean(title || subtitle || Icon);

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      disablePointerDismissal
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
          sizeClasses[size],
          className,
        )}
      >
        {/* Floating Close Button if no header exists but showCloseButton is true */}
        {!hasHeaderContent && showCloseButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-2.5 right-2.5 z-10"
            aria-label="Close"
            onClick={close}
          >
            <XIcon className="size-4" />
          </Button>
        ) : null}

        {/* Accessible Fallback Title for Accessibility if title is omitted */}
        {!hasHeaderContent ? (
          <DialogTitle className="sr-only">Modal Dialog</DialogTitle>
        ) : null}

        {/* Render Header conditionally */}
        {hasHeaderContent ? (
          <div
            className={cn(
              "flex border-b px-4 py-3 pr-12",
              subtitle ? "items-start gap-3" : "items-center gap-3",
            )}
          >
            {Icon ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              {title ? (
                <DialogTitle className="text-base font-semibold leading-tight">
                  {title}
                </DialogTitle>
              ) : (
                <DialogTitle className="sr-only">Modal Dialog</DialogTitle>
              )}

              {subtitle ? (
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {subtitle}
                </DialogDescription>
              ) : null}
            </div>

            {showCloseButton ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-2.5 right-2.5 hover:cursor-pointer"
                aria-label="Close"
                onClick={close}
              >
                <XIcon className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null}

        {/* Modal Body */}
        {children != null ? (
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-4 py-4",
              bodyClassName,
            )}
          >
            {children}
          </div>
        ) : null}

        {/* Footer */}
        {primaryActions != null || secondaryActions != null ? (
          <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {footerAlign === "danger" ? primaryActions : secondaryActions}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {footerAlign === "danger" ? secondaryActions : primaryActions}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}