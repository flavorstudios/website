"use client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

interface Props {
  url: string;
  onClose: () => void;
}

export default function MediaCropper({ url, onClose }: Props) {
  const [cropping] = useState(false);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="p-4">
        <Image src={url} alt="Crop" width={500} height={500} className="max-w-full h-auto" />
        {cropping && <p>Processing...</p>}
      </DialogContent>
    </Dialog>
  );
}