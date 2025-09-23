"use client";
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/use-debounce";
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
import { logClientError } from "@/lib/log-client";

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
  const debouncedSearch = useDebounce(search, 500);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");  // <-- error state
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const loadUsers = async (token?: string | null) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        pageToken: token || "",
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
        verified: verifiedFilter,
        sort: sortBy,
        order: sortOrder,
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
      logClientError("Failed to load users", err);
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(pageToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageToken, roleFilter, statusFilter, verifiedFilter, sortBy, sortOrder, debouncedSearch]);

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
    setSortOrder("desc");
    setPageToken(null);
    };

  const exportCsv = () => {
    const headers = [
      "uid",
      "email",
      "role",
      "status",
      "emailVerified",
      "lastLogin",
      "createdAt",
    ];
    const rows = users.map((u) => [
      u.uid,
      u.email || "",
      u.role,
      u.disabled ? "disabled" : "active",
      u.emailVerified ? "verified" : "unverified",
      u.lastLogin || "",
      u.createdAt || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      logClientError("Bulk update failed", err);
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
      logClientError("Bulk update failed", err);
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
      logClientError("Bulk delete failed", err);
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPageToken(null);
          }}
          className="w-full sm:w-64"
          aria-label="Search users"
        />
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
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full sm:w-32" aria-label="Order">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Asc</SelectItem>
            <SelectItem value="desc">Desc</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={exportCsv}
          className="ml-auto"
          aria-label="Export CSV"
        >
          Export CSV
        </Button>
      </div>

      {/* State Handling: Loading, Error, Empty, Success */}
      {loading ? (
        <div className="p-4">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-600">{error}</div>
      ) : users.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">No team members found.</div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto">
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
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
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
          <div className="sm:hidden space-y-2">
            {users.map((u) => (
              <div
                key={u.uid}
                className="border rounded p-2 space-y-1 cursor-pointer"
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
                onClick={() => setActiveUid(u.uid)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                    e.preventDefault();
                    setActiveUid(u.uid);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{u.email}</span>
                  <Checkbox
                    aria-label={`Select user ${u.email ?? u.uid}`}
                    checked={selected.includes(u.uid)}
                    onCheckedChange={(checked) => {
                      setSelected((ids) =>
                        checked ? [...ids, u.uid] : ids.filter((i) => i !== u.uid)
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
                  <span>Role: {u.role}</span>
                  <span>{u.disabled ? "Disabled" : "Active"}</span>
                  <span>
                    {u.emailVerified ? (
                      <CheckCircle className="inline h-3 w-3 text-green-600" aria-label="Email verified" />
                    ) : (
                      <XCircle className="inline h-3 w-3 text-red-600" aria-label="Email not verified" />
                    )}
                  </span>
                  {u.lastLogin && <span>Last: {u.lastLogin}</span>}
                  {u.createdAt && <span>Created: {u.createdAt}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
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
