"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import app from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [allowedEmails, setAllowedEmails] = useState<string[] | null>(null);
  const [allowedDomain, setAllowedDomain] = useState<string | null>(null); // NEW
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Get user from Firebase Auth
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
    // 2. Securely fetch allowed admin email(s) and domain from API
    async function fetchAllowedEmails() {
      try {
        const res = await fetch("/api/admin/allowed-email");
        if (res.ok) {
          const data = await res.json();
          setAllowedEmails(data.allowedEmails || []);
          setAllowedDomain(data.allowedDomain || null); // NEW
        } else {
          setAllowedEmails([]);
          setAllowedDomain(null);
          setError("Unable to verify admin permissions. Please try again later.");
        }
      } catch (e) {
        setAllowedEmails([]);
        setAllowedDomain(null);
        setError("Unable to verify admin permissions. Please try again later.");
      }
    }
    fetchAllowedEmails();
  }, []);

  if (!authChecked || allowedEmails === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin mb-4 h-8 w-8 text-purple-500" />
        <p className="text-gray-500 text-sm">Checking admin authentication…</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  // Helper to check domain match
  const isDomainAllowed = (email?: string | null) =>
    !!(allowedDomain && email && email.endsWith("@" + allowedDomain));

  // If the logged-in user's email is not allowed (by list or domain), redirect and optionally sign out
  if (
    authChecked &&
    user &&
    allowedEmails.length > 0 &&
    !allowedEmails.includes(user.email || "") &&
    !isDomainAllowed(user.email)
  ) {
    // Optionally sign out: getAuth(app).signOut();
    router.replace("/admin/login");
    return null;
  }

  // Only render children if user is authenticated and allowed (by email or domain)
  return (
    <>
      {user &&
        (allowedEmails.includes(user.email || "") || isDomainAllowed(user.email)) &&
        children}
    </>
  );
}
