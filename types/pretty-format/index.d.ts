declare module "pretty-format" {
  export type Plugin = Record<string, unknown>;
  export interface Options {
    plugins?: Plugin[];
  }
  export function format(value: unknown, options?: Options): string;
}