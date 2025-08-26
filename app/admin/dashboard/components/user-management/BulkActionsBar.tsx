"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Ban, UserCheck, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkActionsBarProps {
  count: number;
  onEnable: () => void;
  onDisable: () => void;
  onMakeAdmin: () => void;
  onDelete: () => void;
}

export default function BulkActionsBar({
  count,
  onEnable,
  onDisable,
  onMakeAdmin,
  onDelete,
}: BulkActionsBarProps) {
  const [pending, setPending] = useState<
    null | "enable" | "disable" | "admin" | "delete"
  >(null);
  const confirm = () => {
    if (pending === "enable") onEnable();
    else if (pending === "disable") onDisable();
    else if (pending === "admin") onMakeAdmin();
    else if (pending === "delete") onDelete();
    setPending(null);
  };
  if (count === 0) return null;
  const actionLabel =
    pending === "enable"
      ? "enable"
      : pending === "disable"
        ? "disable"
        : pending === "admin"
          ? "make admin"
          : "delete";
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 border-t bg-white p-2 shadow sm:static sm:justify-start sm:border-0 sm:p-0 sm:shadow-none"
    >
      <span aria-live="polite" className="mr-2 text-sm text-muted-foreground">
        {count} selected
      </span>
      <Button variant="outline" size="sm" onClick={() => setPending("enable")}> 
        <UserCheck className="mr-1 h-4 w-4" /> Enable
      </Button>
      <Button variant="outline" size="sm" onClick={() => setPending("disable")}>
        <Ban className="mr-1 h-4 w-4" /> Disable
      </Button>
      <Button variant="outline" size="sm" onClick={() => setPending("admin")}> 
        <Shield className="mr-1 h-4 w-4" /> Make Admin
      </Button>
      <Button variant="outline" size="sm" onClick={() => setPending("delete")}>
        <Trash2 className="mr-1 h-4 w-4" /> Delete
      </Button>
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {actionLabel}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionLabel} {count} user{count > 1 ? "s" : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
