"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/admin/user-activity/${uid}`)
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [uid, open]);

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
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <ul className="space-y-2">
                {activities.map((a) => (
                  <li key={a.id} className="text-sm text-gray-700">
                    {new Date(a.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}