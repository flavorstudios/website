"use client";
import { Button } from "@/components/ui/button";
import { Shield, Ban, UserCheck } from "lucide-react";

interface BulkActionsBarProps {
  count: number;
  onEnable: () => void;
  onDisable: () => void;
  onMakeAdmin: () => void;
}

export default function BulkActionsBar({
  count,
  onEnable,
  onDisable,
  onMakeAdmin,
}: BulkActionsBarProps) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 border-t bg-white p-2 shadow sm:static sm:justify-start sm:border-0 sm:p-0 sm:shadow-none">
      <span className="mr-2 text-sm text-muted-foreground">{count} selected</span>
      <Button variant="outline" size="sm" onClick={onEnable}>
        <UserCheck className="mr-1 h-4 w-4" /> Enable
      </Button>
      <Button variant="outline" size="sm" onClick={onDisable}>
        <Ban className="mr-1 h-4 w-4" /> Disable
      </Button>
      <Button variant="outline" size="sm" onClick={onMakeAdmin}>
        <Shield className="mr-1 h-4 w-4" /> Make Admin
      </Button>
    </div>
  );
}