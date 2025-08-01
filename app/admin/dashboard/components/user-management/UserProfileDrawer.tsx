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
import { toast } from "@/hooks/use-toast";

interface UserProfileDrawerProps {
  uid: string | null;
  open: boolean;
  onClose: () => void;
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
}

export default function UserProfileDrawer({ uid, open, onClose }: UserProfileDrawerProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState("support");
  const [disabled, setDisabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid || !open) return;
    fetch(`/api/admin/users/${uid}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setRole(data.user.role);
        setDisabled(data.user.disabled);
      });
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
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-gray-500">UID: {user.uid}</p>
                {typeof user.emailVerified === "boolean" && (
                  <p className="text-sm text-gray-500">
                    {user.emailVerified ? "✅ Email Verified" : "❌ Email Not Verified"}
                  </p>
                )}
                <p className="text-sm text-gray-500">Created: {user.createdAt}</p>
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4">Loading...</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
