import type { PageProps as NextPageProps } from "next";

type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type DefaultSearchParams = {
  [key: string]: string | string[] | undefined;
};

export type PageProps<
  Params = Record<string, never>,
  Search extends DefaultSearchParams | undefined = DefaultSearchParams,
> = {
  params: UnwrapPromise<NextPageProps<Params, Search>["params"]>;
  searchParams?: UnwrapPromise<NextPageProps<Params, Search>["searchParams"]>;
};

export type SearchParams<
  T extends DefaultSearchParams = DefaultSearchParams,
> = PageProps<Record<string, never>, T>["searchParams"];