"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnSizingState,
  type SortingState,
} from "@tanstack/react-table";
import { useCallback, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FadeIn } from "@/components/common/Motion";
import { fadeUpEase } from "@/lib/motion.variants";
import { cn } from "@/lib/cn.util";

export type { ColumnDef };

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (row: TData, index: number) => string;
  className?: string;
  emptyMessage?: string;
  /** First-mount fade for the table chrome. Disable when a parent already animates this block. */
  animateEntrance?: boolean;
  getRowProps?: (
    row: TData,
    index: number,
  ) => HTMLAttributes<HTMLTableRowElement>;
}

/**
 * Reusable data table built on TanStack Table.
 * - Click header sort control to sort
 * - Drag header edge to resize
 * - Double-click header edge to auto-fit column to content
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  className,
  emptyMessage = "No records found.",
  animateEntrance = false,
  getRowProps,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const tableRef = useRef<HTMLTableElement>(null);

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, columnSizing },
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: {
      minSize: 80,
      size: 160,
      maxSize: 640,
    },
  });

  const autoFitColumn = useCallback(
    (columnId: string) => {
      const root = tableRef.current;
      if (!root) return;

      const cells = root.querySelectorAll<HTMLElement>(
        `[data-column-id="${CSS.escape(columnId)}"]`,
      );
      let max = 0;
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:absolute;visibility:hidden;height:auto;width:auto;white-space:nowrap;pointer-events:none;";
      document.body.appendChild(probe);

      cells.forEach((el) => {
        probe.innerHTML = el.innerHTML;
        max = Math.max(max, probe.scrollWidth);
      });

      document.body.removeChild(probe);

      const column = table.getColumn(columnId);
      if (!column) return;

      const min = column.columnDef.minSize ?? 80;
      const maxAllowed = column.columnDef.maxSize ?? 640;
      const next = Math.min(Math.max(max + 28, min), maxAllowed);

      setColumnSizing((prev) => ({ ...prev, [columnId]: next }));
    },
    [table],
  );

  const totalSize = table.getCenterTotalSize();

  const chrome = (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card shadow-xs",
        className,
      )}
    >
      <div data-slot="table-container" className="relative w-full overflow-x-auto">
        <table
          ref={tableRef}
          data-slot="table"
          className="w-full table-fixed text-sm"
          style={{ minWidth: totalSize }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border bg-muted/30">
                {headerGroup.headers.map((header) => {
                  const canResize = header.column.getCanResize();
                  return (
                    <TableHead
                      key={header.id}
                      data-column-id={header.column.id}
                      className="relative h-10 px-3 first:pl-4 text-xs font-semibold text-muted-foreground select-none"
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        maxWidth: header.column.columnDef.maxSize,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      {canResize ? (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize ${header.column.id} column`}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onDoubleClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            autoFitColumn(header.column.id);
                          }}
                          className={cn(
                            "absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize touch-none select-none",
                            "bg-transparent hover:bg-primary/30",
                            header.column.getIsResizing() && "bg-primary/50",
                          )}
                        />
                      ) : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                  {...getRowProps?.(row.original, index)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      data-column-id={cell.column.id}
                      className="overflow-hidden px-3 py-2.5 first:pl-4 text-xs font-medium"
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                    >
                      <div className="min-w-0 truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-xs text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );

  if (!animateEntrance) return chrome;

  return <FadeIn variants={fadeUpEase}>{chrome}</FadeIn>;
}
