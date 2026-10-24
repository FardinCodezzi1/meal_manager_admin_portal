"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn.util";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          "truncate text-xs font-semibold uppercase tracking-wide text-foreground/80",
          className
        )}
      >
        {title}
      </div>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-7 gap-1 px-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/85 hover:bg-primary/10 hover:text-primary rounded-xs",
        className
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span className="truncate">{title}</span>
      {sorted === "asc" ? (
        <ArrowUp className="size-3 shrink-0 text-primary" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3 shrink-0 text-primary" />
      ) : (
        <ArrowUpDown className="size-3 shrink-0 opacity-40" />
      )}
    </Button>
  );
}
