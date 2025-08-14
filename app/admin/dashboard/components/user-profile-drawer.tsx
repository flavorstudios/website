// app/admin/dashboard/components/user-profile-drawer.tsx
"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RetryableSection } from "@/components/RetryableSection";
import { fetchJson } from "@/lib/http";

interface UserProfileDrawerProps {
  uid: string;
  open: boolean;
  onClose: () => void;
}

interface Activity {
  id: string;
  timestamp: string;
  [key: string]: unknown;
}

export default function UserProfileDrawer({
  uid,
  open,
  onClose,
}: UserProfileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="p-4 space-y-4 max-w-md w-full">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <p className="text-sm text-gray-700">User ID: {uid}</p>
          </TabsContent>

          <TabsContent value="activity">
            {!open ? (
              <p className="text-sm text-muted-foreground">Closed</p>
            ) : (
              <RetryableSection<{ activities: Activity[] }>
                // includes credentials + timeout + structured errors
                load={() => fetchJson(`/api/admin/user-activity/${uid}`)}
                render={(data) =>
                  !data?.activities?.length ? (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  ) : (
                    <ul className="space-y-2">
                      {data.activities.map((a) => (
                        <li key={a.id} className="text-sm text-gray-700">
                          {new Date(a.timestamp).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  )
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
