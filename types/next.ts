import type { PageProps as NextPageProps } from "next";

export type PageProps<
  Params extends Record<string, string | string[] | undefined> = Record<string, never>,
  Search extends Record<string, unknown> = Record<string, string | string[] | undefined>,
> = NextPageProps<Params, Search>;

export type SearchParams<
  T extends Record<string, unknown> = Record<string, string | string[] | undefined>,
> = NextPageProps<Record<string, never>, T>["searchParams"];