"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/role-permissions"
import AdminPageHeader from "@/components/AdminPageHeader"

export function UserRoleManager() {
  const [uid, setUid] = useState("")
  const [role, setRole] = useState<UserRole>("support")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!uid) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, role }),
      })
      const data = await res.json()
      if (res.ok) {
        toast("Role updated")
        setUid("")
      } else {
        toast(data.error || "Error")
      }
    } catch (err) {
      console.error("Failed to update role", err)
      toast("Update failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Heading and Subheading */}
      <AdminPageHeader
        title="Users"
        subtitle="Manage all users, roles, and permissions"
      />
      <Card>
        <CardHeader>
          <CardTitle>Change User Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="User UID"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saving || !uid}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
