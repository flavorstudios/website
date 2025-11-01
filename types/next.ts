export type SearchParams<
  T extends Record<string, unknown> = Record<string, string | string[] | undefined>,
> = T;

export type PageProps<
  Params extends Record<string, string | string[] | undefined> = Record<string, never>,
  Search extends Record<string, unknown> = Record<string, string | string[] | undefined>,
> = {
  params: Params;
  searchParams?: SearchParams<Search>;
};