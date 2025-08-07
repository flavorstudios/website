"use client";
import { useEffect, useState, useMemo } from "react";
import BulkActionsBar from "./BulkActionsBar";
import UserProfileDrawer from "./UserProfileDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import { VirtualizedTable } from "@/components/admin/table";

interface UserRow {
  uid: string;
  email?: string;
  displayName?: string;
  disabled: boolean;
  role: string;
  createdAt?: string;
}

export default function UserList() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");

  const allSelected = selected.length === users.length && users.length > 0;

  // Columns for TanStack Table
  const columns = useMemo<ColumnDef<UserRow>[]>(() => [
    {
      id: "select",
      header: () => (
        <Checkbox
          aria-label="Select all users"
          checked={allSelected}
          onCheckedChange={checked =>
            setSelected(checked ? users.map(u => u.uid) : [])
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select user ${row.original.email ?? row.original.uid}`}
          checked={selected.includes(row.original.uid)}
          onCheckedChange={checked => {
            setSelected(ids =>
              checked
                ? [...ids, row.original.uid]
                : ids.filter(i => i !== row.original.uid)
            );
          }}
          onClick={e => e.stopPropagation()}
        />
      ),
      size: 32,
    },
    {
      accessorKey: "email",
      header: () => "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "role",
      header: () => "Role",
      cell: ({ row }) => row.original.role,
    },
    {
      id: "status",
      header: () => "Status",
      cell: ({ row }) => (row.original.disabled ? "Disabled" : "Active"),
    },
    {
      accessorKey: "createdAt",
      header: () => "Created",
      cell: ({ row }) => row.original.createdAt,
    },
  ], [allSelected, selected, users]);

  // Fetch logic remains the same
  const loadUsers = async (token?: string | null) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        pageToken: token || "",
        search,
        role: roleFilter,
        status: statusFilter,
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
  }, [pageToken, roleFilter, statusFilter, sortBy]);

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

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPageToken(null);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search users"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Button onClick={handleSearch}>Search</Button>
        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-40" aria-label="Role">
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
          <SelectTrigger className="w-40" aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-40" aria-label="Sort">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="status">Status</SelectItem>
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
        <VirtualizedTable<UserRow>
          data={users}
          columns={columns}
          className="overflow-x-auto border max-h-[600px]"
          rowHeight={48}
          getRowProps={row => ({
            className:
              "border-t hover:bg-gray-50 cursor-pointer focus-visible:bg-blue-50 focus-visible:outline-none",
            tabIndex: 0,
            onClick: () => setActiveUid(row.original.uid),
            onKeyDown: e => {
              if (
                (e.key === "Enter" || e.key === " ") &&
                e.target === e.currentTarget
              ) {
                e.preventDefault();
                setActiveUid(row.original.uid);
              }
            },
          })}
        />
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
      />

      <UserProfileDrawer uid={activeUid} open={!!activeUid} onClose={() => setActiveUid(null)} />
    </div>
  );
}
