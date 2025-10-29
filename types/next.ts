export type SearchParams<
  T extends Record<string, unknown> = Record<string, string | string[] | undefined>,
> = Promise<T>