"use client";

// This component is intentionally minimal, since authentication is enforced by middleware/server.
// If you wish to use suspense/lazy loading, simply add a loading spinner as fallback in your layout or page.

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  // Uncomment and use the code below if you need a UI loading spinner for lazy/suspense transitions.
  /*
  import { Loader2 } from "lucide-react";
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300); // Simulate brief loading
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin mb-4 h-8 w-8 text-purple-500" />
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }
  */

  // By default, just render children (middleware guarantees auth)
  return <>{children}</>;
}
