export const FLAGS = {
  /**
   * Explicit opt-in for admin test mode. Only the literal value `1`
   * enables the flag to avoid truthy coercion from CI defaults.
   */
  get TEST_MODE() {
    return process.env.NEXT_PUBLIC_TEST_MODE === '1';
  },
  /**
   * Surface the public E2E toggle for components that still need to
   * branch on synthetic environments.
   */
  get E2E() {
    return (
      process.env.NEXT_PUBLIC_E2E === '1' ||
      process.env.NEXT_PUBLIC_E2E === 'true'
    );
  },
  get NODE_ENV() {
    return process.env.NODE_ENV ?? 'production';
  },
} as const;

/**
 * Shared helper used by both client and server modules to determine
 * whether the admin "test mode" experience should be enabled. Test
 * mode only activates when explicitly opted-in (NEXT_PUBLIC_TEST_MODE=1)
 * and the bundle is not a production build.
 */
export function isTestMode(): boolean {
  const explicit = FLAGS.TEST_MODE;
  const isDevOrTest = FLAGS.NODE_ENV !== 'production';
  return explicit && isDevOrTest;
}