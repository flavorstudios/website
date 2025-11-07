/* eslint-disable local/no-h1-outside-page */
import { BlogCardSkeleton } from "@/components/BlogCardSkeleton";

export default function Loading() {
  return (
    <section aria-busy="true" aria-live="polite" className="space-y-6">
      <h1 data-testid="page-title" className="text-3xl font-semibold tracking-tight text-foreground">
        Blog
      </h1>
      <p className="sr-only">Loading blog overview…</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="blog-card-list">
        <BlogCardSkeleton data-testid="blog-card" />
        <BlogCardSkeleton data-testid="blog-card" />
        <BlogCardSkeleton data-testid="blog-card" />
      </div>
    </section>
  );
}