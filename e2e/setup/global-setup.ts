import { ensureAdminAuthState } from "../utils/create-auth-state";

export default async function globalSetup() {
  await ensureAdminAuthState();
}