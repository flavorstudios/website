"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import app, { firebaseInitError } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Guard: If Firebase config error, abort and show error + redirect
    if (firebaseInitError || !app) {
      setError(
        firebaseInitError?.message ||
        "Firebase app failed to initialize due to misconfiguration. Please contact the site administrator."
      );
      router.replace("/admin/login");
      setAuthChecked(true);
      return;
    }

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
    if (firebaseInitError || !app) {
      setError(
        firebaseInitError?.message ||
        "Firebase app failed to initialize due to misconfiguration. Please contact the site administrator."
      );
      router.replace("/admin/login");
      return;
    }
    // Check admin permission (email/domain) for this user only
    async function fetchIsAllowed() {
      try {
        const res = await fetch("/api/admin/allowed-email");
        if (!res.ok) {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

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
