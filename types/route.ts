export type RouteContext<
  Params extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> = {
  params: Promise<Params>;
};