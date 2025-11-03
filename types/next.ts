import type { Next15PageProps, DefaultSearchParams } from "./next-unwrapped";
export type { MaybePromise, Unwrap } from "./next-unwrapped";
export {
  unwrapPageProps,
  unwrapParams,
  unwrapSearchParams,
  wrapPageProps,
} from "./next-unwrapped";

export type PageProps<
  Params = Record<string, never>,
  Search extends DefaultSearchParams | undefined = DefaultSearchParams,
> = Next15PageProps<Params, Search>;

export type SearchParams<
  T extends DefaultSearchParams = DefaultSearchParams,
> = Awaited<PageProps<Record<string, never>, T>["searchParams"]>;