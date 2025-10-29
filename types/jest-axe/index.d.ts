export interface AxeViolations {
  violations: unknown[];
}

export type AxeOptions = Record<string, unknown>;

export function axe(node: unknown, options?: AxeOptions): Promise<AxeViolations>;
export const toHaveNoViolations: jest.ExpectExtendMap;

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}