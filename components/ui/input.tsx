"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn.util";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  required?: boolean;
  icon?: LucideIcon;
  containerClassName?: string;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      required,
      icon: Icon,
      containerClassName,
      suffix,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive font-bold">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
              <Icon className="size-4" />
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-9",
              suffix && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center">{suffix}</div>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
