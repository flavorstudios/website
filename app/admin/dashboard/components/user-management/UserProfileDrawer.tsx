"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
    await fetch(`/api/admin/users/${uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, disabled }),
    });
    setSaving(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="p-4 space-y-4 max-w-md w-full">
        {user ? (
          <div className="space-y-4">
            <div>
              <p className="font-semibold">{user.email}</p>
              <p className="text-sm text-gray-500">UID: {user.uid}</p>
              <p className="text-sm text-gray-500">Created: {user.createdAt}</p>
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
              <label className="block text-sm font-medium">Status</label>
              <Input
                type="checkbox"
                checked={!disabled}
                onChange={(e) => setDisabled(!e.target.checked)}
                className="mr-2"
              />
              <span>{disabled ? "Disabled" : "Active"}</span>
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