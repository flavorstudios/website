import "next";

declare module "next" {
  export type PageProps<
    Params = Record<string, never>,
    SearchParams = {
      [key: string]: string | string[] | undefined;
    },
  > = {
    params: Promise<Params>;
    searchParams?: Promise<SearchParams>;
  };
}