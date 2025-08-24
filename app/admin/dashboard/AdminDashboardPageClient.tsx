// app/admin/dashboard/AdminDashboardPageClient.tsx
"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth, firebaseInitError } from "@/lib/firebase";
import { fetchJson } from "@/lib/http";
import useHotkeys from "./hooks/use-hotkeys";

import { AdminSidebar } from "./components/admin-sidebar";
import { AdminHeader } from "./components/admin-header";
import { RoleProvider } from "./contexts/role-context";
import { ToastProvider } from "./components/ui/toast-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Spinner from "@/components/ui/spinner";
import MobileNav from "./components/mobile-nav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy sections via central registry
const DashboardOverview = dynamic(
  () => import("./components").then((m) => m.DashboardOverview),
  { ssr: false, loading: () => <Spinner /> }
);
const BlogManager = dynamic(
  () => import("./components").then((m) => m.BlogManager),
  { ssr: false, loading: () => <Spinner /> }
);
const VideoManager = dynamic(
  () => import("./components").then((m) => m.VideoManager),
  { ssr: false, loading: () => <Spinner /> }
);
const CommentManager = dynamic(
  () => import("./components").then((m) => m.CommentManager),
  { ssr: false, loading: () => <Spinner /> }
);
const SystemTools = dynamic(
  () => import("./components").then((m) => m.SystemTools),
  { ssr: false, loading: () => <Spinner /> }
);
const UserManagement = dynamic(
  () => import("./components").then((m) => m.UserManagement),
  { ssr: false, loading: () => <Spinner /> }
);
const CategoryManager = dynamic(
  () => import("./components").then((m) => m.CategoryManager),
  { ssr: false, loading: () => <Spinner /> }
);
const EmailInbox = dynamic(
  () => import("./components").then((m) => m.EmailInbox),
  { ssr: false, loading: () => <Spinner /> }
);
const MediaLibrary = dynamic(
  () => import("./components").then((m) => m.MediaLibrary),
  { ssr: false, loading: () => <Spinner /> }
);
const CareerApplications = dynamic(
  () => import("./components").then((m) => m.CareerApplications),
  { ssr: false, loading: () => <Spinner /> }
);
// ✨ Settings (lazy-loaded)
const SystemSettings = dynamic(
  () => import("./components").then((m) => m.SystemSettings),
  { ssr: false, loading: () => <Spinner /> }
);

// ---- Route map (reused) ----------------------------------------------------
const NAV = [
  { id: "overview", href: "/admin/dashboard", title: "Overview" },
  { id: "blogs", href: "/admin/dashboard/blog-posts", title: "Blog Posts" },
  { id: "videos", href: "/admin/dashboard/videos", title: "Videos" },
  { id: "media", href: "/admin/dashboard/media", title: "Media" },
  { id: "categories", href: "/admin/dashboard/categories", title: "Categories" },
  { id: "comments", href: "/admin/dashboard/comments", title: "Comments" },
  { id: "applications", href: "/admin/dashboard/applications", title: "Applications" },
  { id: "inbox", href: "/admin/dashboard/inbox", title: "Inbox" },
  { id: "users", href: "/admin/dashboard/users", title: "Users" },
  { id: "settings", href: "/admin/dashboard/settings", title: "Settings" },
  { id: "system", href: "/admin/dashboard/system", title: "System Tools" },
] as const;
type SectionId = (typeof NAV)[number]["id"];
const validSection = (s: string | null): s is SectionId =>
  !!s && NAV.some((n) => n.id === s);

// Normalize helper (keeps your URLs consistent for matching)
function normalizePath(pathname: string | null | undefined) {
  if (!pathname) return "/";
  const p = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return p;
}

// Longest route wins (fixes the "always overview" bug on nested paths)
function resolveSectionFromPath(pathname: string | null | undefined): SectionId {
  const normalized = normalizePath(pathname);
  // Sort by href length descending so /admin/dashboard/blog-posts beats /admin/dashboard
  const sorted = [...NAV].sort((a, b) => b.href.length - a.href.length);
  const match = sorted.find(
    (m) => normalized === m.href || normalized.startsWith(`${m.href}/`)
  );
  return (match?.id as SectionId) ?? "overview";
}

// ----------------------------------------------------------------------------

interface AdminDashboardPageClientProps {
  initialSection?: string;
}

export default function AdminDashboardPageClient({
  initialSection = "overview",
}: AdminDashboardPageClientProps) {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Read section from query if present, else fallback to prop
  const initialFromQuery = search?.get("section");
  const initialResolved: SectionId = validSection(initialFromQuery)
    ? (initialFromQuery as SectionId)
    : (initialSection as SectionId);

  const [activeSection, setActiveSection] = useState<SectionId>(initialResolved);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // --- Hotkeys --------------------------------------------------------------
  useHotkeys("n", () => router.push("/admin/blog/create"), undefined, [router]);
  useHotkeys("shift+u", () =>
    window.dispatchEvent(new Event("admin-open-media-upload"))
  );
  // Note: search shortcuts are handled inside AdminHeader now.

  // Keep the help dialog hotkey
  useHotkeys("?", (e) => {
    e.preventDefault();
    setShortcutsOpen(true);
  });

  // --- One-time init + route prefetch --------------------------------------
  useEffect(() => {
    setMounted(true);

    // init ping (with credentials)
    fetchJson("/api/admin/init", { method: "POST", credentials: "include" }).catch((err) => {
      if (process.env.NODE_ENV !== "production")
        console.error("Admin init failed:", err);
    });

    // Prefetch main routes for snappier nav
    try {
      NAV.forEach((n) => router.prefetch?.(n.href));
    } catch {
      /* prefetch optional */
    }
  }, [router]);

  // --- Deep-link from pathname (authoritative for section) ------------------
  // FIX: resolve using longest-match to avoid always matching "overview"
  useEffect(() => {
    const next = resolveSectionFromPath(pathname);
    if (next !== activeSection) {
      setActiveSection(next);
    }
  }, [pathname, activeSection]);

  // --- Optional: respect ?section= if user directly visits with query -------
  useEffect(() => {
    const qs = search?.get("section");
    if (validSection(qs) && qs !== activeSection) {
      setActiveSection(qs);
    }
  }, [search, activeSection]);

  // --- Responsive + keyboard detection -------------------------------------
  useEffect(() => {
    // Restore sidebar preference (non-breaking: we still auto-toggle on resize below)
    try {
      const saved = localStorage.getItem("admin.sidebarOpen");
      if (saved !== null) setSidebarOpen(saved === "true");
    } catch {
      /* ignore */
    }

    const handleResize = () => {
      // keep your original behavior
      setSidebarOpen(window.innerWidth >= 1024);
      setIsMobile(window.innerWidth < 768);
      // visualViewport covers mobile keyboards more reliably
      const vv = window.visualViewport;
      if (vv) {
        setKeyboardOpen(vv.height < window.innerHeight - 150);
      } else {
        setKeyboardOpen(window.innerHeight < window.outerHeight - 150);
      }
    };

    // initial
    handleResize();

    // events
    window.addEventListener("resize", handleResize);

    const vv = window.visualViewport;
    const onVV = () => handleResize();
    vv?.addEventListener?.("resize", onVV);
    vv?.addEventListener?.("scroll", onVV);

    return () => {
      window.removeEventListener("resize", handleResize);
      vv?.removeEventListener?.("resize", onVV);
      vv?.removeEventListener?.("scroll", onVV);
    };
  }, []);

  // Persist sidebar preference (best-effort, won’t override your logic)
  useEffect(() => {
    try {
      localStorage.setItem("admin.sidebarOpen", String(sidebarOpen));
    } catch {
      /* ignore */
    }
  }, [sidebarOpen]);

  // --- Online/Offline banner ------------------------------------------------
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // --- External navigation event (non-breaking enhancement) -----------------
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent).detail as { section?: string } | undefined;
      if (detail?.section && validSection(detail.section)) {
        setActiveSection(detail.section);
      }
    };
    window.addEventListener("admin:navigate", onNavigate as EventListener);
    return () =>
      window.removeEventListener("admin:navigate", onNavigate as EventListener);
  }, []);

  // --- Sync sidebar width globally for responsive layout -------------------
  useEffect(() => {
    const root = document.documentElement;
    const width = isMobile ? "0px" : sidebarOpen ? "16rem" : "5rem";
    root.style.setProperty("--sidebar-w", width);
    return () => {
      root.style.removeProperty("--sidebar-w");
    };
  }, [sidebarOpen, isMobile]);

  // --- Lock root scroll when mobile sidebar is open ------------------------
  useEffect(() => {
    const root = document.documentElement;
    if (isMobile && sidebarOpen) {
      root.classList.add("overflow-hidden");
    } else {
      root.classList.remove("overflow-hidden");
    }
    return () => root.classList.remove("overflow-hidden");
  }, [isMobile, sidebarOpen]);

  const handleLogout = useCallback(async () => {
    try {
      const firebaseErrorMessage =
        (firebaseInitError as Error | null)?.message ??
        "Firebase not initialized. Cannot log out safely.";
      if (firebaseInitError) {
        setError(firebaseErrorMessage);
        return;
      }
      let auth;
      try {
        auth = getFirebaseAuth();
      } catch {
        setError(firebaseErrorMessage);
        return;
      }
      await signOut(auth);
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch (error) {
      setError("Logout failed. Please try again.");
      if (process.env.NODE_ENV !== "production")
        console.error("Logout failed:", error);
    }
  }, []);
  const currentTitle = useMemo(
    () => NAV.find((n) => n.id === activeSection)?.title ?? "Dashboard",
    [activeSection]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          <span className="text-lg font-medium text-gray-700">
            Loading Admin Dashboard...
          </span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview key="overview" />;
      case "blogs":
        return <BlogManager key="blogs" />;
      case "videos":
        return <VideoManager key="videos" />;
      case "media":
        return <MediaLibrary key="media" />;
      case "categories":
        return <CategoryManager key="categories" />;
      case "comments":
        return <CommentManager key="comments" />;
      case "applications":
        return <CareerApplications key="applications" />;
      case "inbox":
        return <EmailInbox key="inbox" />;
      case "system":
        return <SystemTools key="system" />;
      case "users":
        return <UserManagement key="users" />;
      case "settings":
        return <SystemSettings key="settings" />;
      default:
        return <DashboardOverview key="overview-fallback" />;
    }
  };

  return (
    <ToastProvider>
      <RoleProvider>
          {/* Accessible skip link */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
          >
            Skip to main content
          </a>

          {/* Shell: stack on mobile; sidebar column only from lg+ */}
          <div
            className="admin-shell grid min-h-screen supports-[height:100dvh]:min-h-[100dvh]
                       grid-cols-1 lg:grid-cols-[var(--sidebar-w,16rem)_1fr]
                       transition-[grid-template-columns] duration-200 ease-out overflow-x-hidden"
            data-sidebar-open={isMobile && sidebarOpen ? "true" : "false"}
          >
            <AdminSidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />

            <div id="admin-main" className="flex min-w-0 flex-col bg-background">
              <AdminHeader
                onLogout={handleLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              />

              <main
                id="main"
                className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-4 pt-4
                           pb-[calc(var(--mobile-nav-h,64px)+env(safe-area-inset-bottom,0px))] lg:pb-6"
                role="main"
                aria-label={currentTitle}
                aria-hidden={isMobile && sidebarOpen ? true : undefined}
              >
                <div className="max-w-7xl mx-auto">
                  {/* Online/Offline indicator */}
                  {!isOnline && (
                    <Alert className="mb-4 border-amber-200 bg-amber-50">
                      <AlertDescription className="text-amber-800 text-sm">
                        You’re offline. Changes will sync when you’re back online.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700 text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <ErrorBoundary>
                    <Suspense fallback={<Spinner />}>{renderContent()}</Suspense>
                  </ErrorBoundary>

                  {/* ARIA live region for section changes */}
                  <div className="sr-only" aria-live="polite">
                    Section: {currentTitle}
                  </div>
                </div>
              </main>

              {isMobile && !keyboardOpen && (
                <MobileNav
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                />
              )}
            </div>
          </div>

          {/* Backdrop overlay to close sidebar on mobile */}
          {isMobile && sidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Keyboard Shortcuts</DialogTitle>
                <DialogDescription>Navigate the admin dashboard faster</DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>New blog post</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">n</kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Upload media</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">shift + u</kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Search</span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">/</kbd>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">cmd/ctrl + k</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Show this help</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </RoleProvider>
      </ToastProvider>
  );
}
