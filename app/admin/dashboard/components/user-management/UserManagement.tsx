"use client";
import UserList from "./UserList";
import { useRole } from "../../contexts/role-context";

export default function UserManagement() {
  const { hasPermission } = useRole();
  if (!hasPermission("canManageUsers")) {
    return (
      <p className="text-sm text-muted-foreground">
        You do not have permission to manage users.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">Manage user accounts</p>
      </div>
      <UserList />
    </div>
  );
}
