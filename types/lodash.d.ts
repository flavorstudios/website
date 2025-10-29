declare module "lodash" {
  export type DebouncedFunc<T extends (...args: any[]) => any = (...args: any[]) => any> = (
    ...args: Parameters<T>
  ) => ReturnType<T>;
  const content: any;
  export = content;
}