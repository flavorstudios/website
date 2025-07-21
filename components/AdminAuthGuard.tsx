"use client";
import { Loader2 } from "lucide-react";

// Optionally: you can add a loading state if your page needs it.
// For most cases, you can just render children immediately, since authentication is handled by middleware.

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  // If you want to show a brief loading spinner (e.g., for suspense fallback), you can uncomment/use useState/useEffect:
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   setTimeout(() => setLoading(false), 300); // Simulate loading
  // }, []);
  // if (loading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[60vh]">
  //       <Loader2 className="animate-spin mb-4 h-8 w-8 text-purple-500" />
  //       <p className="text-gray-500 text-sm">Loading…</p>
  //     </div>
  //   );
  // }
  // For now, simply render children:
  return <>{children}</>;
}
