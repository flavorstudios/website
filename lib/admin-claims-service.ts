import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

export const SUPPORTED_ROLES = ["admin", "editor", "support"] as const;

export type SupportedRole = (typeof SUPPORTED_ROLES)[number];

export interface AdminClaimsDependencies {
  auth: Pick<Auth, "getUserByEmail" | "setCustomUserClaims" | "listUsers">;
  firestore: Pick<Firestore, "collection">;
  now?: () => Date;
}

interface UserRecord {
  uid: string;
  email?: string;
  customClaims?: Record<string, unknown> | null;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildRolesClaim(
  existing: unknown,
  activeRole: SupportedRole
): Record<string, boolean> {
  const base = isPlainRecord(existing) ? { ...existing } : {};
  for (const role of SUPPORTED_ROLES) {
    base[role] = role === activeRole;
  }
  return base;
}

function currentTimestamp(now?: () => Date): string {
  return (now ? now() : new Date()).toISOString();
}

export interface GrantRoleResult {
  uid: string;
  email: string;
  role: SupportedRole;
  claims: Record<string, unknown>;
  updatedAt: string;
}

export async function grantRole(
  deps: AdminClaimsDependencies,
  email: string,
  role: SupportedRole
): Promise<GrantRoleResult> {
  const user = (await deps.auth.getUserByEmail(email)) as UserRecord;
  const claims = { ...(user.customClaims || {}) } as Record<string, unknown>;
  const rolesClaim = buildRolesClaim(claims.roles, role);
  const timestamp = currentTimestamp(deps.now);

  const nextClaims: Record<string, unknown> = {
    ...claims,
    admin: role === "admin",
    role,
    roles: { ...rolesClaim },
  };

  await deps.auth.setCustomUserClaims(user.uid, nextClaims);

  await deps.firestore
    .collection("admin_users")
    .doc(user.uid)
    .set(
      {
        email,
        role,
        updatedAt: timestamp,
      },
      { merge: true }
    );

  await deps.firestore
    .collection("roles")
    .doc(user.uid)
    .set({ role, updatedAt: timestamp }, { merge: true });

  return {
    uid: user.uid,
    email,
    role,
    claims: nextClaims,
    updatedAt: timestamp,
  };
}

export interface RevokeRoleResult {
  uid: string;
  email: string;
  claims: Record<string, unknown>;
  updatedAt: string;
}

export async function revokeRole(
  deps: AdminClaimsDependencies,
  email: string
): Promise<RevokeRoleResult> {
  const user = (await deps.auth.getUserByEmail(email)) as UserRecord;
  const claims = { ...(user.customClaims || {}) } as Record<string, unknown>;
  const rolesClaim = isPlainRecord(claims.roles) ? { ...claims.roles } : {};
  const timestamp = currentTimestamp(deps.now);

  delete claims.admin;
  claims.role = "support";
  rolesClaim.admin = false;
  rolesClaim.editor = false;
  rolesClaim.support = true;
  claims.roles = rolesClaim;

  await deps.auth.setCustomUserClaims(user.uid, claims);

  await deps.firestore.collection("admin_users").doc(user.uid).delete();

  await deps.firestore
    .collection("roles")
    .doc(user.uid)
    .set({ role: "support", updatedAt: timestamp }, { merge: true });

  return {
    uid: user.uid,
    email,
    claims,
    updatedAt: timestamp,
  };
}

export interface ListAdminsResult {
  directory: Array<Record<string, unknown>>;
  claimAdmins: Array<Pick<UserRecord, "uid" | "email"> & { role?: unknown; roles?: unknown }>;
}

export async function listAdmins(
  deps: AdminClaimsDependencies
): Promise<ListAdminsResult> {
  const [directorySnap, listedUsers] = await Promise.all([
    deps.firestore.collection("admin_users").get(),
    collectAllUsers(deps.auth),
  ]);

  const directory = directorySnap.docs.map((doc) => ({
    uid: doc.id,
    ...(doc.data() as Record<string, unknown>),
  }));

  return {
    directory,
    claimAdmins: listedUsers,
  };
}

async function collectAllUsers(
  auth: Pick<Auth, "listUsers">
): Promise<Array<Pick<UserRecord, "uid" | "email"> & { role?: unknown; roles?: unknown }>> {
  const all: Array<Pick<UserRecord, "uid" | "email"> & { role?: unknown; roles?: unknown }> = [];
  let pageToken: string | undefined;

  do {
    const batch = await auth.listUsers(1000, pageToken);
    for (const userRecord of batch.users as Array<UserRecord & { role?: unknown; roles?: unknown }>) {
      all.push({
        uid: userRecord.uid,
        email: userRecord.email,
        role: isPlainRecord(userRecord.customClaims) ? userRecord.customClaims.role : undefined,
        roles: isPlainRecord(userRecord.customClaims) ? userRecord.customClaims.roles : undefined,
      });
    }
    pageToken = batch.pageToken || undefined;
  } while (pageToken);

  return all;
}