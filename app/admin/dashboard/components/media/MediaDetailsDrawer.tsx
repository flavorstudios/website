"use client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Image from "next/image";
import type { MediaDoc } from "@/types/media";

interface MediaDetailsDrawerProps {
  media: MediaDoc;
  open: boolean;
  onClose: () => void;
}

export default function MediaDetailsDrawer({
  media,
  open,
  onClose,
}: MediaDetailsDrawerProps) {
  if (!media) return null;
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="p-4 space-y-4 max-w-md w-full">
        <Image
          src={media.url}
          alt={media.alt || media.filename}
          width={400}
          height={400}
          className="object-cover w-full h-auto rounded"
        />
        <div>
          <p className="font-semibold">{media.filename}</p>
          <p className="text-sm text-gray-500">{media.mime}</p>
          <p className="text-xs text-gray-400">
            Size: {(media.size / 1024).toFixed(1)} KB
          </p>
          <p className="text-xs text-gray-400">
            Dimensions: {media.width} × {media.height}
          </p>
          <p className="text-xs text-gray-400">
            Uploaded: {new Date(media.createdAt).toLocaleString()}
          </p>
        </div>
        {media.alt && (
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              ALT Text
            </label>
            <p className="text-xs bg-gray-50 px-2 py-1 rounded">{media.alt}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
