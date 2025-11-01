# Next.js 15.4.6 Type Validation Audit

## Section 1 — Summary
- Vercel successfully compiles the app, but the build fails during TypeScript validation.
- The failing server component is the dynamic marketing page at `app/(marketing)/blog/[slug]/page.tsx`, which receives slug params from the App Router.
- The project-level `PageProps` helper expects object-based params, while the Next 15.4.6 generated declarations currently require `Promise`-wrapped params/searchParams, creating a constraint mismatch.
- Dynamic API routes that still destructure object-based contexts will trigger the same promise constraint error under the new validator.
- Environment variable warnings observed in the build log are unrelated to the failure.

## Section 2 — Root cause (pages)
The local helper forwards Next's generated `PageProps`, which in this release advertises `Promise`-wrapped values. The project code, however, uses the object shape that Next passes at runtime:

```ts
// app/(marketing)/blog/[slug]/page.tsx
import type { PageProps } from "@/types/next";

type BlogPostPageProps = PageProps<{ slug: string }>;
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params; // <- runtime object, but type expects Promise
  ...
}
```

```ts
// types/next.ts
export type PageProps<
  Params extends Record<string, string | string[] | undefined> = Record<string, never>,
  Search extends
    | Record<string, string | string[] | undefined>
    | undefined = Record<string, string | string[] | undefined>,
> = NextPageProps<Params, Search>;
```

Although the repo augments `next` in `types/next-app.d.ts`, the generated `.d.ts` still constrains `PageProps` to the promise-based signature, so any page using the object form fails the constraint check.

## Section 3 — Fix 1 (local, failing page)
### Option A — conform to generated types (quick unblock)
```ts
import { notFound } from "next/navigation";
import type { PageProps } from "@/types/next";

type BlogPostPageProps = PageProps<Promise<{ slug: string }>>;

type BlogPostGenerateMetadataProps = PageProps<Promise<{ slug: string }>>;

export async function generateMetadata({ params }: BlogPostGenerateMetadataProps) {
  const { slug } = await params;
  ...
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  ...
}
```

### Option B — keep runtime-accurate params (recommended with global fix)
```ts
import { notFound } from "next/navigation";

type BlogPostPageProps = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = params;
  ...
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  ...
}
```
Option B matches the values Next provides at runtime and becomes valid once the shared type (Section 4) unwraps promises.

## Section 4 — Fix 2 (global, pages)
Normalize the shared helper so it unwraps whatever Next declares:

```ts
// types/next.ts
import type { PageProps as NextPageProps } from "next";

type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type DefaultSearch = {
  [key: string]: string | string[] | undefined;
};

export type PageProps<
  Params = Record<string, never>,
  Search extends DefaultSearch | undefined = DefaultSearch,
> = {
  params: UnwrapPromise<NextPageProps<Params, Search>["params"]>;
  searchParams?: UnwrapPromise<NextPageProps<Params, Search>["searchParams"]>;
};

export type SearchParams<T extends DefaultSearch = DefaultSearch> =
  PageProps<Record<string, never>, T>["searchParams"];
```

This keeps app code object-first while remaining compatible with promise-heavy generated definitions.

## Section 5 — Root cause (API routes)
Earlier builds showed the same mismatch for dynamic API routes that destructure `{ params }` as an object:

```ts
export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  const { uid } = params; // <- promise expected in Next 15.4.6
  ...
}
```

## Section 6 — Fix 3 (local, API route)
```ts
// app/api/admin/audit-logs/[uid]/route.ts
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  ...
}
```

## Section 7 — Fix 4 (global, API routes)
Provide a helper that encodes the awaited contract once and reuse it everywhere:

```ts
// types/route.ts
export type RouteContext<
  Params extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> = {
  params: Promise<Params>;
};
```

Then consume it in dynamic handlers:

```ts
import type { RouteContext } from "@/types/route";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<{ uid: string }>
) {
  const { uid } = await params;
  ...
}
```

## Section 8 — Files to review next
Search for these patterns and update the signatures accordingly:
- `app/(marketing)/` + `[` (dynamic segments in marketing routes)
- `app/**/[slug]/page.tsx`
- `app/**/[id]/page.tsx`
- `app/**/[...slug]/page.tsx`
- `app/api/**/[`
- `params:`
- `searchParams?: unknown`
- `export async function GET(`

## Section 9 — Notes for Vercel CI
- The build output already shows `✓ Compiled successfully`; only type validation fails.
- Missing optional environment variables are informational and unrelated.
- Once page props unwrap promises (Section 4) and dynamic route handlers await `params` (Sections 6–7), Vercel’s type check will accept the project.