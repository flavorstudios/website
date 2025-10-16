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
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">Team Directory</h2>
        <p className="text-sm text-muted-foreground">
          Filter teammates by role, status, and verification state.
        </p>
      </div>
      <UserList />
    </div>
  );
}
