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
      <DialogContent className="max-w-3xl" aria-label="Media Picker Dialog">
        {/* If you want to add a heading for accessibility, uncomment below: */}
        {/* <h2 className="sr-only">Select a media file</h2> */}
        <MediaLibrary onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  );
}
