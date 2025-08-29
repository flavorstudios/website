"use client";
import { useEffect, useState } from "react";
import BulkActionsBar from "./BulkActionsBar";
import UserProfileDrawer from "./UserProfileDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRow {
  uid: string;
  email?: string;
  displayName?: string;
  disabled: boolean;
  role: string;
  createdAt?: string;
  emailVerified?: boolean;
  lastLogin?: string;
}

export default function UserList() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");  // <-- error state
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const loadUsers = async (token?: string | null) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        pageToken: token || "",
        search,
        role: roleFilter,
        status: statusFilter,
        verified: verifiedFilter,
        sort: sortBy,
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUsers(data.users || []);
        setNextPageToken(data.nextPageToken || null);
      } else {
        setError(data.error || "Failed to load users");
        setUsers([]);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load users", err);
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(pageToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageToken, roleFilter, statusFilter, verifiedFilter, sortBy]);

  const handleSearch = () => {
    setPageToken(null);
    loadUsers(null);
  };

  const handleRoleChange = (val: string) => {
    setRoleFilter(val);
    setPageToken(null);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPageToken(null);
  };

  const handleVerifiedChange = (val: string) => {
    setVerifiedFilter(val);
    setPageToken(null);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPageToken(null);
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerifiedFilter("all");
    setSortBy("created");
    setPageToken(null);
    loadUsers(null);
  };

  const bulkDisable = async (disable: boolean) => {
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, disabled: disable }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success(disable ? "Users disabled" : "Users enabled");
      } else {
        toast.error(d.error || "Update failed");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Bulk update failed", err);
      toast.error("Update failed");
    } finally {
      setSelected([]);
      loadUsers(pageToken);
    }
  };

  const bulkMakeAdmin = async () => {
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, role: "admin" }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success("Users updated");
      } else {
        toast.error(d.error || "Update failed");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Bulk update failed", err);
      toast.error("Update failed");
    } finally {
      setSelected([]);
      loadUsers(pageToken);
    }
  };

  const bulkDelete = async () => {
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, delete: true }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success("Users deleted");
      } else {
        toast.error(d.error || "Delete failed");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Bulk delete failed", err);
      toast.error("Delete failed");
    } finally {
      setSelected([]);
      loadUsers(pageToken);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
          aria-label="Search users"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <Button onClick={handleSearch} aria-label="Search">
          Search
        </Button>
        <Button
          variant="outline"
          onClick={handleResetFilters}
          aria-label="Reset filters"
        >
          Reset
        </Button>
        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Role">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verifiedFilter} onValueChange={handleVerifiedChange}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Verified">
            <SelectValue placeholder="Verified" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Email States</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Sort">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="lastLogin">Last Login</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* State Handling: Loading, Error, Empty, Success */}
      {loading ? (
        <div className="p-4">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-600">{error}</div>
      ) : users.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">
                  <Checkbox
                    aria-label="Select all users"
                    checked={selected.length === users.length && users.length > 0}
                    onCheckedChange={(checked) =>
                      setSelected(checked ? users.map((u) => u.uid) : [])
                    }
                  />
                </th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Verified</th>
                <th className="p-2 text-left">Last Login</th>
                <th className="p-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.uid}
                  className="border-t hover:bg-gray-50 cursor-pointer focus-visible:bg-blue-50 focus-visible:outline-none"
                  tabIndex={0}
                  onClick={() => setActiveUid(u.uid)}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Enter" || e.key === " ") &&
                      e.target === e.currentTarget
                    ) {
                      e.preventDefault();
                      setActiveUid(u.uid);
                    }
                  }}
                >
                  <td className="p-2">
                    <Checkbox
                      aria-label={`Select user ${u.email ?? u.uid}`}
                      checked={selected.includes(u.uid)}
                      onCheckedChange={(checked) => {
                        setSelected((ids) =>
                          checked
                            ? [...ids, u.uid]
                            : ids.filter((i) => i !== u.uid)
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    <Badge
                      variant={
                        u.role === "admin"
                          ? "destructive"
                          : u.role === "editor"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-2">{u.disabled ? "Disabled" : "Active"}</td>
                  <td className="p-2">
                    {u.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" aria-label="Email verified" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" aria-label="Email not verified" />
                    )}
                  </td>
                  <td className="p-2">{u.lastLogin}</td>
                  <td className="p-2">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pageToken}
          onClick={() => setPageToken(null)}
        >
          First Page
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!nextPageToken}
          onClick={() => setPageToken(nextPageToken)}
        >
          Next
        </Button>
      </div>

      <BulkActionsBar
        count={selected.length}
        onEnable={() => bulkDisable(false)}
        onDisable={() => bulkDisable(true)}
        onMakeAdmin={bulkMakeAdmin}
        onDelete={bulkDelete}
      />

      <UserProfileDrawer
        uid={activeUid}
        open={!!activeUid}
        onClose={() => setActiveUid(null)}
        onDeleted={() => {
          setActiveUid(null);
          loadUsers(pageToken);
        }}
      />
    </div>
  );
}
