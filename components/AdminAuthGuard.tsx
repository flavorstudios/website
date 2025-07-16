"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import app from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/admin/login");
      } else {
        setUser(firebaseUser);
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Check admin permission (email/domain) for this user only
    async function fetchIsAllowed() {
      try {
        const res = await fetch("/api/admin/allowed-email");
        if (!res.ok) {
          // Force sign out and redirect if not allowed or error
          getAuth(app).signOut();
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        if (!data.isAllowed) {
          getAuth(app).signOut();
          router.replace("/admin/login");
          return;
        }
        setIsAllowed(true);
      } catch {
        getAuth(app).signOut();
        router.replace("/admin/login");
      }
    }
    fetchIsAllowed();
  }, [router]);

  if (!authChecked || isAllowed === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin mb-4 h-8 w-8 text-purple-500" />
        <p className="text-gray-500 text-sm">Checking admin authentication…</p>
      </div>
    );
  }

  // Render children only if authenticated and explicitly allowed
  return <>{user && isAllowed && children}</>;
}
