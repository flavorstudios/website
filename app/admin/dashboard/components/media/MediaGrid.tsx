"use client";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import type { MediaDoc } from "@/types/media";

interface Props {
  items: MediaDoc[];
  onSelect: (item: MediaDoc) => void;
  onPick?: (url: string) => void;
  selected?: Set<string>;
  toggleSelect?: (id: string) => void;
}

export default function MediaGrid({ items, onSelect, onPick, selected, toggleSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {items.map((item) => {
        const isSelected = selected?.has(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className="relative border rounded overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              onSelect(item);
              onPick?.(item.url);
            }}
            tabIndex={0}
            aria-pressed={isSelected}
          >
            {/* Bulk selection checkbox, if enabled */}
            {toggleSelect && (
              <div className="absolute top-1 left-1 z-10 bg-white rounded">
                <Checkbox
                  aria-label={`Select ${item.filename || item.name}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {/* Main image */}
            <Image
              src={item.url}
              alt={item.alt || item.filename || item.name}
              width={160}
              height={160}
              className="object-cover w-full h-32"
            />
          </button>
        );
      })}
    </div>
  );
}
