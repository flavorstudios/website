"use client";
import { useDroppable } from "@dnd-kit/core";

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
}

interface Props {
  folders: Folder[];
  current: string;
  onSelect: (id: string) => void;
}

function FolderItem({ folder, onSelect }: { folder: Folder; onSelect: () => void }) {
  const { setNodeRef } = useDroppable({ id: `folder-${folder.id}` });
  return (
    <div ref={setNodeRef} className="p-1">
      <button
        type="button"
        className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
        onClick={onSelect}
      >
        {folder.name}
      </button>
    </div>
  );
}

export default function FolderSidebar({ folders, current, onSelect }: Props) {
  return (
    <aside className="w-40 border-r pr-2 space-y-1" aria-label="Folders">
      {folders
        .filter((f) => !f.parentId)
        .map((f) => (
          <FolderItem key={f.id} folder={f} onSelect={() => onSelect(f.id)} />
        ))}
    </aside>
  );
}