// Minimal xml2js declarations to provide typing without pulling external packages.
// When registry access is available, prefer replacing this file with @types/xml2js.

declare module "xml2js" {
  export type ConvertableToString = string | Buffer | number;

  export interface ParserOptions {
    attrkey?: string;
    charkey?: string;
    explicitArray?: boolean;
    explicitCharkey?: boolean;
    trim?: boolean;
    normalize?: boolean;
    normalizeTags?: boolean;
    attrNameProcessors?: Array<(name: string) => string>;
    tagNameProcessors?: Array<(name: string) => string>;
  }

  export class Parser {
    constructor(options?: ParserOptions);
    parseString(str: ConvertableToString, cb: (err: Error | null, result: unknown) => void): void;
    parseStringPromise<T = unknown>(str: ConvertableToString): Promise<T>;
  }

  export function parseStringPromise<T = unknown>(
    str: ConvertableToString,
    options?: ParserOptions,
  ): Promise<T>;

  const xml2js: {
    Parser: typeof Parser;
    parseStringPromise: typeof parseStringPromise;
  };

  export default xml2js;
}