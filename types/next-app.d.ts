import "next";

type AwaitedProps<T> = T extends Promise<infer U> ? AwaitedProps<U> : T;

declare module "next" {
  export type PageProps<
    Params = Record<string, never>,
    SearchParams = Record<string, string | string[] | undefined> | undefined,
  > = {
    params: AwaitedProps<Params>;
    searchParams?: SearchParams extends undefined
      ? undefined
      : AwaitedProps<SearchParams>;
  };
}