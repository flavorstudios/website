"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MediaLibrary from "./MediaLibrary";

export interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  detailsOpen?: boolean;
  onDetailsOpenChange?: (open: boolean) => void;
}

export default function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  detailsOpen,
  onDetailsOpenChange,
}: MediaPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <MediaLibrary
          onSelect={onSelect}
          detailsOpen={detailsOpen}
          onDetailsOpenChange={onDetailsOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
