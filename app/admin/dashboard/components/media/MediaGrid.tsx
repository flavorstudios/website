"use client";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import type { MediaDoc } from "@/types/media";
import { useArrowNavigation } from "@/hooks/useArrowNavigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

interface Props {
  items: MediaDoc[];
  onSelect: (item: MediaDoc) => void;
  onPick?: (url: string) => void;
  selected?: Set<string>;
  toggleSelect?: (id: string) => void;
}

// lightweight, file-local long-press helper (no external deps)
function useLongPress(onLongPress: () => void, ms = 400) {
  const timer = useRef<number | null>(null);

  const start = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onLongPress, ms);
  }, [ms, onLongPress]);

  const clear = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    // also treat native context menu as long-press trigger
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      onLongPress();
    },
  };
}

export default function MediaGrid({ items, onSelect, onPick, selected, toggleSelect }: Props) {
  // Virtualization container
  const parentRef = useRef<HTMLDivElement>(null);

  // Responsive column count
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const updateCols = () => {
      const width = parentRef.current?.clientWidth || window.innerWidth;
      if (width >= 768) setCols(4);
      else if (width >= 640) setCols(3);
      else setCols(2);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Arrow navigation hook (kept as-is, now driven by dynamic cols)
  const navRef = useArrowNavigation<HTMLDivElement>({ mode: "grid", cols });

  // Roving tabindex over virtualized grid
  const [activeIndex, setActiveIndex] = useState(0);

  // Ensure active index stays within bounds if items change
  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(items.length ? items.length - 1 : 0);
    }
  }, [items.length, activeIndex]);

  // Virtual rows
  const rowCount = Math.ceil((items.length || 0) / Math.max(cols, 1));
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 136, // ~ item height + gap
    overscan: 5,
  });

  // Focus a grid item by global index (virtualization-aware)
  const focusByIndex = useCallback(
    (idx: number) => {
      if (!items.length) return;
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      setActiveIndex(clamped);
      // Scroll the row into view
      const rowIndex = Math.floor(clamped / Math.max(cols, 1));
      rowVirtualizer.scrollToIndex(rowIndex);

      // Try to focus after the row is in DOM
      requestAnimationFrame(() => {
        const el = parentRef.current?.querySelector<HTMLElement>(`[data-index="${clamped}"]`);
        el?.focus();
      });
    },
    [items.length, cols, rowVirtualizer]
  );

  // Handle keyboard at cell level (arrows, Home/End, Space, Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number, item: MediaDoc) => {
      let next = idx;
      const colSpan = Math.max(cols, 1);

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          next = Math.min(idx + 1, items.length - 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          next = Math.max(idx - 1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          next = Math.min(idx + colSpan, items.length - 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          next = Math.max(idx - colSpan, 0);
          break;
        case "Home":
          e.preventDefault();
          // Jump to first cell in current row
          next = idx - (idx % colSpan);
          break;
        case "End":
          e.preventDefault();
          // Jump to last cell in current row (or last item)
          next = Math.min(idx - (idx % colSpan) + (colSpan - 1), items.length - 1);
          break;
        case " ":
          if (toggleSelect) {
            e.preventDefault();
            toggleSelect(item.id);
          }
          return;
        case "Enter":
          e.preventDefault();
          onSelect(item);
          onPick?.(item.url);
          return;
        default:
          return; // let the hook handle anything else
      }

      if (next !== idx) {
        focusByIndex(next);
      }
    },
    [cols, items.length, onPick, onSelect, toggleSelect, focusByIndex]
  );

  return (
    <div
      ref={(el) => {
        parentRef.current = el;
        // merge refs so arrow navigation listens on the same scrollable container
        (navRef as any).current = el;
      }}
      className="max-h-[60vh] overflow-auto"
      role="grid"
      aria-label="Media grid"
      aria-rowcount={rowCount}
      aria-colcount={cols}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((row) => {
          const start = row.index * cols;
          const rowItems = items.slice(start, start + cols);

          return (
            <div
              key={row.index}
              role="row"
              className={
                cols === 4
                  ? "grid grid-cols-4 gap-2"
                  : cols === 3
                  ? "grid grid-cols-3 gap-2"
                  : "grid grid-cols-2 gap-2"
              }
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${row.start}px)`,
              }}
            >
              {rowItems.map((item, colOffset) => {
                const isSelected = selected?.has(item.id);
                const globalIndex = start + colOffset;
                const longPress = useLongPress(() => toggleSelect?.(item.id));

                return (
                  <ContextMenu key={item.id}>
                    <ContextMenuTrigger asChild>
                      <button
                        type="button"
                        role="gridcell"
                        data-media-item
                        data-index={globalIndex}
                        className="relative overflow-hidden rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[48px]"
                        onClick={() => {
                          onSelect(item);
                          onPick?.(item.url);
                          // keep focus consistent with click
                          focusByIndex(globalIndex);
                        }}
                        tabIndex={globalIndex === activeIndex ? 0 : -1}
                        aria-selected={!!isSelected}
                        aria-label={item.filename || (item as any).name}
                        onKeyDown={(e) => handleKeyDown(e, globalIndex, item)}
                        {...longPress}
                      >
                        {/* Bulk selection checkbox, if enabled */}
                        {toggleSelect && (
                          <div className="absolute left-1 top-1 z-10 rounded bg-white/90">
                            <Checkbox
                              aria-label={`Select ${item.filename || (item as any).name}`}
                              checked={!!isSelected}
                              onCheckedChange={() => toggleSelect(item.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6"
                            />
                          </div>
                        )}

                        {/* Main image */}
                        <Image
                          src={item.url}
                          alt={item.alt || item.filename || (item as any).name || ""}
                          width={160}
                          height={160}
                          className="h-32 w-full object-cover"
                          draggable={false}
                        />
                      </button>
                    </ContextMenuTrigger>

                    {toggleSelect && (
                      <ContextMenuContent>
                        <ContextMenuItem onSelect={() => toggleSelect(item.id)}>
                          {isSelected ? "Unselect" : "Select"}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    )}
                  </ContextMenu>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
