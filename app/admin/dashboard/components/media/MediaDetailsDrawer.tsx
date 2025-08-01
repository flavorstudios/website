"use client";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import Image from "next/image";
import type { MediaDoc } from "@/types/media";

export default function MediaDetailsDrawer({ media, onClose }: { media: MediaDoc; onClose: () => void }) {
  return (
    <Drawer open onOpenChange={onClose}>
      <DrawerContent className="p-4 space-y-2">
        <Image src={media.url} alt={media.alt || media.name} width={400} height={400} className="object-cover w-full h-auto" />
        <div>
          <p className="font-semibold">{media.name}</p>
          <p className="text-sm text-gray-500">{media.mimeType}</p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}