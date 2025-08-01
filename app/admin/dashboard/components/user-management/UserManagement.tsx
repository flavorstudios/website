"use client";
import UserList from "./UserList";

export default function UserManagement() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage user accounts</p>
      </div>
      <UserList />
    </div>
  );
}
