"use client";

import { useEffect, useMemo, useState, useId, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import { PageHeader } from "@/components/admin/page-header";
import AdminBreadcrumbs from "@/components/AdminBreadcrumbs";
import Spinner from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PostResult {
  id: string;
  title: string;
  slug: string;
}

interface VideoResult {
  id: string;
  title: string;
  slug: string;
}

interface UserResult {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

interface CategoryResult {
  id: string;
  title: string;
  slug: string;
  type?: string;
}

interface SearchResults {
  posts: PostResult[];
  videos: VideoResult[];
  users: UserResult[];
  categories: CategoryResult[];
  tags: string[];
}

const EMPTY_RESULTS: SearchResults = {
  posts: [],
  videos: [],
  users: [],
  categories: [],
  tags: [],
};

type FetchState = "idle" | "loading" | "success" | "error";

interface AdminSearchPageClientProps {
  initialQuery: string;
}

export default function AdminSearchPageClient({
  initialQuery,
}: AdminSearchPageClientProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string>("");

  const queryFromUrl = useMemo(() => {
    const urlQuery = searchParams?.get("q");
    if (typeof urlQuery === "string") return urlQuery;
    return initialQuery;
  }, [searchParams, initialQuery]);

  useEffect(() => {
    setQuery((current) => (current === queryFromUrl ? current : queryFromUrl));
  }, [queryFromUrl]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length === 0) {
      setState("idle");
      setResults(EMPTY_RESULTS);
      setError("");
      return;
    }

    if (trimmed.length < 2) {
      setState("idle");
      setResults(EMPTY_RESULTS);
      setError("");
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      setState("loading");
      setError("");
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message = typeof data.error === "string" ? data.error : "Failed to load search results.";
          throw new Error(message);
        }

        const data = (await res.json()) as SearchResults;
        setResults({
          posts: data.posts ?? [],
          videos: data.videos ?? [],
          users: data.users ?? [],
          categories: data.categories ?? [],
          tags: data.tags ?? [],
        });
        setState("success");
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Failed to load search results.";
        setError(message);
        setState("error");
      }
    };

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [query]);

  const headingId = useId();
  const hasQuery = query.trim().length > 0;
  const readyForResults = query.trim().length >= 2;
  const hasResults =
    results.posts.length > 0 ||
    results.videos.length > 0 ||
    results.users.length > 0 ||
    results.categories.length > 0 ||
    results.tags.length > 0;

  return (
    <AdminAuthGuard>
      <div className="p-4 md:p-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <AdminBreadcrumbs
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Search" },
            ]}
          />

          <section aria-labelledby={headingId} className="flex flex-col gap-6">
            <PageHeader
              headingId={headingId}
              title="Admin Search"
              description={
                hasQuery
                  ? `Results for “${query.trim()}”`
                  : "Search across posts, videos, users, categories, and tags."
              }
            />

            {!hasQuery && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Start by searching</CardTitle>
                  <CardDescription>
                    Use the search bar at the top of the dashboard or press “/” to quickly focus it, then enter at least two
                    characters.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {hasQuery && !readyForResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Keep typing…</CardTitle>
                  <CardDescription>Enter at least two characters to see matching admin content.</CardDescription>
                </CardHeader>
              </Card>
            )}

            {state === "loading" && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 p-8">
                <Spinner />
                <p className="text-sm text-muted-foreground">Searching the admin content…</p>
              </div>
            )}

            {state === "error" && error && (
              <Alert variant="destructive" className="max-w-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {state === "success" && readyForResults && !hasResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">No results found</CardTitle>
                  <CardDescription>
                    We couldn’t find any posts, videos, users, categories, or tags matching “{query.trim()}”.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {state === "success" && hasResults && (
              <div className="space-y-6">
              <SearchResultsSection
                title="Blog posts"
                description="Top matches from your published and draft posts."
                emptyLabel="No matching posts."
              >
                {results.posts.length > 0 ? (
                  <ul className="space-y-3">
                    {results.posts.map((post) => (
                      <li key={post.id} className="rounded-lg border border-border bg-background p-3 transition hover:border-primary/40">
                        <Link href={`/admin/blog/edit?id=${post.id}`} className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{post.title}</span>
                          <span className="text-xs text-muted-foreground">/{post.slug}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </SearchResultsSection>

              <SearchResultsSection
                title="Videos"
                description="Episodes and uploads from the video library."
                emptyLabel="No matching videos."
              >
                {results.videos.length > 0 ? (
                  <ul className="space-y-3">
                    {results.videos.map((video) => (
                      <li key={video.id} className="rounded-lg border border-border bg-background p-3 transition hover:border-primary/40">
                        <Link href={`/admin/video/edit?id=${video.id}`} className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{video.title}</span>
                          <span className="text-xs text-muted-foreground">/{video.slug}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </SearchResultsSection>

              <SearchResultsSection
                title="Users"
                description="Administrators and members from Firebase auth."
                emptyLabel="No matching users."
              >
                {results.users.length > 0 ? (
                  <ul className="space-y-3">
                    {results.users.map((user) => (
                      <li key={user.uid} className="rounded-lg border border-border bg-background p-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{user.displayName || user.email || "User"}</span>
                          {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                          {!user.email && user.displayName && (
                            <span className="text-xs text-muted-foreground">UID: {user.uid}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </SearchResultsSection>

              <SearchResultsSection
                title="Categories"
                description="Content groupings used across the site."
                emptyLabel="No matching categories."
              >
                {results.categories.length > 0 ? (
                  <ul className="space-y-3">
                    {results.categories.map((category) => (
                      <li key={category.id} className="rounded-lg border border-border bg-background p-3 transition hover:border-primary/40">
                        <Link href="/admin/dashboard/categories" className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{category.title}</span>
                          <span className="text-xs text-muted-foreground">/{category.slug}</span>
                          {category.type && (
                            <span className="text-xs text-muted-foreground">Type: {category.type}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </SearchResultsSection>

              <SearchResultsSection
                title="Tags"
                description="Popular taxonomy from your blog posts."
                emptyLabel="No matching tags."
              >
                {results.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {results.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </SearchResultsSection>
            </div>
          )}
          </section>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

interface SearchResultsSectionProps {
  title: string;
  description?: string;
  emptyLabel: string;
  children?: ReactNode;
}

function SearchResultsSection({
  title,
  description,
  emptyLabel,
  children,
}: SearchResultsSectionProps) {
  const hasContent = !(
    children === null ||
    children === undefined ||
    children === false
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {hasContent ? (
          children
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}