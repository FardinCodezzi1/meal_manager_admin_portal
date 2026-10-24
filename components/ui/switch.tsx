"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/cn.util";

export type SwitchProps = Omit<SwitchPrimitive.Root.Props, "id"> & {
  id?: string;
  size?: "sm" | "default";
  label?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
};

function Switch({
  className,
  size = "default",
  id,
  label,
  error,
  required,
  disabled,
  containerClassName,
  ...props
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;

  const control = (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      id={switchId}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${switchId}-error` : undefined}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-sm border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-xs bg-amber-100 ring-0 transition-transform group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-2.5 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-1px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-1px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  );

  if (!label && !error) {
    return control;
  }

  return (
    <div className={cn("w-full space-y-1.5", containerClassName)}>
      <div className="flex items-center gap-2">
        {control}
        {label ? (
          <label
            htmlFor={switchId}
            className={cn(
              "text-sm font-medium text-foreground/90",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {label}
            {required ? (
              <span className="ml-1 font-bold text-destructive" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
        ) : null}
      </div>
      {error ? (
        <p
          id={`${switchId}-error`}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Switch };
