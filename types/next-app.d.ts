import "next";

type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

declare module "next" {
  export type PageProps<
    Params = Record<string, never>,
    SearchParams = {
      [key: string]: string | string[] | undefined;
    }
  > = {
    params: UnwrapPromise<Params>;
    searchParams?: UnwrapPromise<SearchParams>;
  };
}