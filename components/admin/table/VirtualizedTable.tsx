"use client";

import { useRef } from "react";
import type { ColumnDef, Row, RowData } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

// Allow columns to specify classes via meta
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}

export interface VirtualizedTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  rowHeight?: number;
  className?: string;
  getRowProps?: (
    row: Row<TData>
  ) => React.HTMLAttributes<HTMLTableRowElement>;
}

export function VirtualizedTable<TData extends RowData>({
  data,
  columns,
  rowHeight = 48,
  className,
  getRowProps,
}: VirtualizedTableProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={`overflow-auto ${className ?? ""}`}>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`p-3 text-left ${
                    header.column.columnDef.meta?.headerClassName ?? ""
                  }`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualRows.map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            const props = getRowProps?.(row) ?? {};
            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                ref={virtualRow.measureElement}
                {...props}
                style={{
                  ...(props.style ?? {}),
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  width: "100%",
                }}
                className={`border-b last:border-b-0 ${props.className ?? ""}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`p-3 ${
                      cell.column.columnDef.meta?.cellClassName ?? ""
                    }`}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default VirtualizedTable;