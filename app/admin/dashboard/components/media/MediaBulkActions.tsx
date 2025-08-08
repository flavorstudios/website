"use client";

import { Button } from "@/components/ui/button";
import {
  Trash2,
  Tag as TagIcon,
  Download as DownloadIcon,
  Copy as CopyIcon,
  Folder as FolderIcon,
  Paperclip,
  Unlink,
} from "lucide-react";

type Props = {
  count: number;
  onDelete: () => void;
  onTag: () => void;
  onCopy: () => void;
  onMove: () => void;
  onAttach: () => void;
  onDetach: () => void;
  onDownloadOriginals: () => void;
};

export default function MediaBulkActions({
  count,
  onDelete,
  onTag,
  onCopy,
  onMove,
  onAttach,
  onDetach,
  onDownloadOriginals,
}: Props) {
  if (count === 0) return null;

  // Keyboard shortcuts for bulk actions (when the bar is focused):
  // C=Copy, M=Move, A=Attach, D=Detach, O=Download originals, T=Tag, Delete=Delete
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const k = e.key.toLowerCase();
    if (k === "c") {
      e.preventDefault();
      onCopy();
    } else if (k === "m") {
      e.preventDefault();
      onMove();
    } else if (k === "a") {
      e.preventDefault();
      onAttach();
    } else if (k === "d") {
      e.preventDefault();
      onDetach();
    } else if (k === "o") {
      e.preventDefault();
      onDownloadOriginals();
    } else if (k === "t") {
      e.preventDefault();
      onTag();
    } else if (e.key === "Delete") {
      e.preventDefault();
      onDelete();
    }
  }

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="fixed bottom-0 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-2 border-t bg-white/95 p-3 shadow-md backdrop-blur focus:outline-none sm:static sm:flex-nowrap sm:justify-start sm:border-0 sm:p-0 sm:shadow-none"
    >
      <span className="mr-2 text-sm text-muted-foreground" aria-live="polite">
        {count} selected
      </span>

      <Button variant="outline" className="h-12 min-w-24 px-4" onClick={onCopy} aria-label="Copy URLs (C)">
        <CopyIcon className="mr-2 h-4 w-4" /> Copy URLs
      </Button>

      <Button variant="outline" className="h-12 min-w-24 px-4" onClick={onMove} aria-label="Move to folder (M)">
        <FolderIcon className="mr-2 h-4 w-4" /> Move to folder
      </Button>

      <Button variant="outline" className="h-12 min-w-24 px-4" onClick={onAttach} aria-label="Attach to… (A)">
        <Paperclip className="mr-2 h-4 w-4" /> Attach to…
      </Button>

      <Button variant="outline" className="h-12 min-w-24 px-4" onClick={onDetach} aria-label="Detach (D)">
        <Unlink className="mr-2 h-4 w-4" /> Detach
      </Button>

      <Button
        variant="outline"
        className="h-12 min-w-24 px-4"
        onClick={onDownloadOriginals}
        aria-label="Download originals (O)"
      >
        <DownloadIcon className="mr-2 h-4 w-4" /> Download originals
      </Button>

      <Button variant="outline" className="h-12 min-w-24 px-4" onClick={onTag} aria-label="Tag (T)">
        <TagIcon className="mr-2 h-4 w-4" /> Tag
      </Button>

      <Button
        variant="outline"
        className="h-12 min-w-24 px-4 text-red-600"
        onClick={onDelete}
        aria-label="Delete (Del)"
      >
        <Trash2 className="mr-2 h-4 w-4" /> Delete
      </Button>
    </div>
  );
}
