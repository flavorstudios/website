/* eslint-disable local/no-h1-outside-page */
import { BlogCardSkeleton } from "./_components/BlogCardSkeleton";

const SKELETON_COUNT = 3;

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
      data-testid="blog-loading"
    >
      <header className="space-y-2">
        <h1
          data-testid="page-title"
          className="text-3xl font-semibold tracking-tight text-foreground"
        >
          Blog
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your blog posts, drafts, and editorial calendar.
        </p>
      </header>

      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        data-testid="blog-card-list"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <BlogCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}