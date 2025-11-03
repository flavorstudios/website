import type { PageProps as NextPageProps } from "next";

export type MaybePromise<T> = T | Promise<T>;
export type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;

export type DefaultSearchParams = {
  [key: string]: string | string[] | undefined;
};

export type Next15PageProps<
  Params = Record<string, never>,
  Search extends DefaultSearchParams | undefined = DefaultSearchParams,
> = NextPageProps<Params, Search>;

export type ResolvedProps<P extends Next15PageProps<any, any>> = {
  params: Awaited<P["params"]>;
  searchParams: P["searchParams"] extends undefined
    ? undefined
    : Awaited<NonNullable<P["searchParams"]>>;
};

export async function unwrapPageProps<P extends Next15PageProps<any, any>>(
  props: P,
): Promise<ResolvedProps<P>> {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  return { params, searchParams } as ResolvedProps<P>;
}

export async function unwrapParams<T>(value: MaybePromise<T>): Promise<T> {
  return await value;
}

export async function unwrapSearchParams<T>(
  value: MaybePromise<T> | undefined,
): Promise<T | undefined> {
  return value ? await value : undefined;
}

export function wrapPageProps<
  Params,
  Search extends DefaultSearchParams | undefined = DefaultSearchParams,
>(input: {
  params: Params;
  searchParams?: Search;
}): Next15PageProps<Params, Search> {
  const base = {
    params: Promise.resolve(input.params),
  } satisfies Partial<Next15PageProps<Params, Search>>;

  if (typeof input.searchParams !== "undefined") {
    return {
      ...base,
      searchParams: Promise.resolve(input.searchParams),
    } as Next15PageProps<Params, Search>;
  }

  return base as Next15PageProps<Params, Search>;
}