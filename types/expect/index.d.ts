declare module "expect" {
  export type MatcherState = Record<string, unknown>;
  export type MatcherUtils = Record<string, unknown>;
  export interface ExpectationResult {
    pass: boolean;
    message(): string;
  }
  export type SyncExpectationResult = ExpectationResult | Promise<ExpectationResult>;
  export type Plugin = Record<string, unknown>;
}