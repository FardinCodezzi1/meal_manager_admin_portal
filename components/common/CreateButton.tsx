"use client";

import { Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn.util";

type CreateButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
};

export function CreateButton({
  children,
  onClick,
  type = "button",
  disabled,
  icon: Icon = Plus,
  className,
}: CreateButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(className)}
    >
      <Icon className="size-4" />
      {children}
    </Button>
  );
}
