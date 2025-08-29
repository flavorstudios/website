"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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
import { Trash2, Copy, KeyRound, MailCheck } from "lucide-react";

interface UserProfileDrawerProps {
  uid: string | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  role: string;
  createdAt?: string;
  emailVerified?: boolean;
  lastLogin?: string;
}

interface AuditLog {
  id: string;
  action: string;
  actor?: string;
  timestamp: string;
}

export default function UserProfileDrawer({ uid, open, onClose, onDeleted }: UserProfileDrawerProps) {
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState("support");
  const [disabled, setDisabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const copy = async (text: string, message = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleAccountAction = async (action: "reset" | "verify") => {
    if (!uid) return;
    try {
      const res = await fetch(`/api/admin/users/${uid}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.link) {
        await copy(data.link, "Link copied");
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("User action failed", err);
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    if (!uid || !open) return;
    setLogs([]);
    setLogsLoading(true);
    fetch(`/api/admin/users/${uid}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setRole(data.user.role);
        setDisabled(data.user.disabled);
      });
      fetch(`/api/admin/audit-logs/${uid}`)
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLogsLoading(false));
  }, [uid, open]);

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, disabled }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User updated");
        onClose();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to update user", err);
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${uid}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("User deleted");
        setConfirmDelete(false);
        onDeleted?.();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete user", err);
      toast.error("Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="p-4 space-y-4 max-w-md w-full">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email} />
                <AvatarFallback>
                  {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <p className="font-semibold break-all">{user.email}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Copy email"
                    onClick={() => copy(user.email || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span>UID: {user.uid}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Copy UID"
                    onClick={() => copy(user.uid)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {typeof user.emailVerified === "boolean" && (
                  <p className="text-sm text-gray-500">
                    {user.emailVerified ? "✅ Email Verified" : "❌ Email Not Verified"}
                  </p>
                )}
                <p className="text-sm text-gray-500">Created: {user.createdAt}</p>
                {user.lastLogin && (
                  <p className="text-sm text-gray-500">Last login: {user.lastLogin}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="user-status">
                Status
              </label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="user-status"
                  checked={!disabled}
                  onCheckedChange={(checked) => setDisabled(!checked)}
                  aria-label="Toggle user status"
                />
                <label htmlFor="user-status" className="text-sm">
                  {disabled ? "Disabled" : "Active"}
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-medium">Account Actions</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAccountAction("reset")}
                >
                  <KeyRound className="mr-1 h-4 w-4" /> Reset Password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAccountAction("verify")}
                >
                  <MailCheck className="mr-1 h-4 w-4" /> Send Verification
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-medium">Recent Activity</h2>
              {logsLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                <ul className="max-h-40 overflow-y-auto text-sm divide-y">
                  {logs.map((log) => (
                    <li key={log.id} className="py-1">
                      <p>
                        {new Date(log.timestamp).toLocaleString()} – {log.action}
                        {log.actor ? ` by ${log.actor}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </div>
            <AlertDialog
              open={confirmDelete}
              onOpenChange={(o) => !o && setConfirmDelete(false)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4">Loading...</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
