"use client";
import Image from "next/image";
import type { MediaDoc } from "@/types/media";

interface Props {
  items: MediaDoc[];
  onSelect: (item: MediaDoc) => void;
  onPick?: (url: string) => void;
}

export default function MediaGrid({ items, onSelect, onPick }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="border rounded overflow-hidden"
          onClick={() => {
            onSelect(item);
            onPick?.(item.url);
          }}
        >
          <Image src={item.url} alt={item.alt || item.name} width={160} height={160} className="object-cover w-full h-32" />
        </button>
      ))}
    </div>
  );
}