"use client";
import { useEffect, useState } from "react";
import BulkActionsBar from "./BulkActionsBar";
import UserProfileDrawer from "./UserProfileDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [activeUid, setActiveUid] = useState<string | null>(null);

  const loadUsers = async (token?: string | null) => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?pageToken=${token || ""}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users);
      setNextPageToken(data.nextPageToken);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers(pageToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageToken]);

  const handleSearch = () => {
    setPageToken(null);
    loadUsers(null);
  };

  const bulkDisable = async (disable: boolean) => {
    await fetch("/api/admin/users/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, disabled: disable }),
    });
    setSelected([]);
    loadUsers(pageToken);
  };

  const bulkMakeAdmin = async () => {
    await fetch("/api/admin/users/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, role: "admin" }),
    });
    setSelected([]);
    loadUsers(pageToken);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {loading ? (
        <div className="p-4">Loading...</div>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  checked={selected.length === users.length && users.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? users.map((u) => u.uid) : [])
                  }
                />
              </th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.uid}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setActiveUid(u.uid)}
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(u.uid)}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelected((ids) =>
                        ids.includes(u.uid)
                          ? ids.filter((i) => i !== u.uid)
                          : [...ids, u.uid]
                      );
                    }}
                  />
                </td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.disabled ? "Disabled" : "Active"}</td>
                <td className="p-2">{u.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
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