import type { PageProps as NextPageProps } from "next";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type NextProps<
  Params extends Record<string, string | string[] | undefined>,
  Search extends Record<string, string | string[] | undefined> | undefined,
> = NextPageProps<Params, Search>;

type ExtractSearchField<
  Params extends Record<string, string | string[] | undefined>,
  Search extends Record<string, string | string[] | undefined> | undefined,
> = NextProps<Params, Search> extends { searchParams?: infer OptionalSearch }
  ? { searchParams?: UnwrapPromise<OptionalSearch> }
  : NextProps<Params, Search> extends { searchParams: infer RequiredSearch }
    ? { searchParams: UnwrapPromise<RequiredSearch> }
    : { searchParams?: Record<string, string | string[] | undefined> };

export type PageProps<
  Params extends Record<string, string | string[] | undefined> = Record<string, never>,
  Search extends Record<string, string | string[] | undefined> | undefined = Record<
    string,
    string | string[] | undefined
  >,
> = {
  params: UnwrapPromise<NextProps<Params, Search>["params"]>;
} & ExtractSearchField<Params, Search>;

export type SearchParams<
  T extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>,
> = PageProps<Record<string, never>, T>["searchParams"];