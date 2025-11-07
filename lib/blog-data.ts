const E2E_ENABLED =
  process.env.NEXT_PUBLIC_E2E === "1" ||
  process.env.NEXT_PUBLIC_E2E === "true" ||
  process.env.E2E === "1" ||
  process.env.E2E === "true";

export async function getBlogOverview() {
  if (E2E_ENABLED) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return [];
  }

  return [];
}