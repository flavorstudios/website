"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MediaLibrary from "./MediaLibrary";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export default function MediaPickerDialog({ open, onOpenChange, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <MediaLibrary onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  );
}
