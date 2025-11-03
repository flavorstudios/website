import { z } from "zod";

export type EnvStage = "development" | "preview" | "production" | "test";

export interface EnvVarDefinition {
  readonly name: string;
  readonly description: string;
  readonly targets: {
    readonly server: boolean;
    readonly client: boolean;
  };
  readonly requiredIn: readonly EnvStage[];
  readonly group?: string;
  readonly example?: string;
  readonly sensitive?: boolean;
}

const optionalString = z
  .string()
  .optional()
  .transform(value => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

export const envVarDefinitions: readonly EnvVarDefinition[] = [
  {
    name: "BASE_URL",
    description: "Canonical site URL used for absolute links and redirects.",
    targets: { server: true, client: false },
    requiredIn: ["development", "preview", "production"],
    example: "https://example.com",
    sensitive: false,
  },
  {
    name: "CRON_SECRET",
    description: "Shared secret that protects scheduled job endpoints.",
    targets: { server: true, client: false },
    requiredIn: ["development", "preview", "production"],
    sensitive: true,
  },
  {
    name: "PREVIEW_SECRET",
    description: "Token used to enable Next.js Draft Mode for CMS previews.",
    targets: { server: true, client: false },
    requiredIn: ["development", "preview", "production"],
    sensitive: true,
  },
  {
    name: "ADMIN_JWT_SECRET",
    description: "Secret for signing and verifying admin authentication tokens.",
    targets: { server: true, client: false },
    requiredIn: ["development", "preview", "production"],
    sensitive: true,
  },
  {
    name: "FIREBASE_SERVICE_ACCOUNT_JSON",
    description:
      "Raw service account JSON used for Firebase Admin access (alternative to FIREBASE_SERVICE_ACCOUNT_KEY).",
    targets: { server: true, client: false },
    requiredIn: ["preview", "production"],
    group: "firebaseServiceAccount",
    sensitive: true,
  },
  {
    name: "FIREBASE_SERVICE_ACCOUNT_KEY",
    description:
      "Base64 encoded service account JSON used for Firebase Admin access (alternative to FIREBASE_SERVICE_ACCOUNT_JSON).",
    targets: { server: true, client: false },
    requiredIn: ["preview", "production"],
    group: "firebaseServiceAccount",
    sensitive: true,
  },
  {
    name: "FIREBASE_STORAGE_BUCKET",
    description: "Server-side Firebase storage bucket identifier.",
    targets: { server: true, client: false },
    requiredIn: ["preview", "production"],
    example: "project-id.appspot.com",
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    description: "Public Firebase storage bucket used by the client app.",
    targets: { server: true, client: true },
    requiredIn: ["preview", "production"],
    example: "project-id.appspot.com",
  },
  {
    name: "NEXT_PUBLIC_BASE_URL",
    description: "Public site origin exposed to the browser (mirrors BASE_URL).",
    targets: { server: true, client: true },
    requiredIn: ["preview", "production"],
    example: "https://example.com",
  },
  {
    name: "ADMIN_EMAILS",
    description: "Comma separated list of email addresses with super-admin access.",
    targets: { server: true, client: false },
    requiredIn: [],
    example: "owner@example.com,admin@example.com",
  },
  {
    name: "ADMIN_EMAIL",
    description: "Primary admin email used for bootstrap flows.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "ADMIN_REQUIRE_EMAIL_VERIFICATION",
    description: "When 'true', require verified email before admin login.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "ADMIN_DISPOSABLE_DOMAINS",
    description: "Comma separated list of blocked disposable email domains.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "ADMIN_API_KEY",
    description: "API key for privileged admin routes (legacy support).",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "ADMIN_AUTH_DISABLED",
    description: "When 'true', bypasses admin auth (only safe in local dev).",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "ADMIN_BYPASS",
    description: "When 'true', relaxes client-side admin validation.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "ADMIN_COOKIE_DOMAIN",
    description: "Overrides the cookie domain used for admin sessions.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "ADMIN_DOMAIN",
    description: "Hostname that hosts the admin dashboard (defaults to BASE_URL).",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "ADMIN_PASSWORD_HASH",
    description: "Bcrypt hash for the emergency admin login fallback.",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "ADMIN_SESSION_EXPIRY_DAYS",
    description: "Number of days before admin sessions expire.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "ADMIN_TOTP_SECRET",
    description: "TOTP secret used for admin MFA bootstrap flows.",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES",
    description: "CSV list of admin routes enabled in the SPA shell.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_COOKIEYES_ID",
    description: "CookieYes banner identifier for consent management.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_API_KEY",
    description: "Firebase web API key.",
    targets: { server: true, client: true },
    requiredIn: ["preview", "production"],
    sensitive: true,
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    description: "Firebase auth domain for the web app.",
    targets: { server: true, client: true },
    requiredIn: ["preview", "production"],
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    description: "Firebase project identifier used by the client app.",
    targets: { server: true, client: true },
    requiredIn: ["preview", "production"],
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    description: "Firebase messaging sender ID.",
    targets: { server: true, client: true },
    requiredIn: ["preview", "production"],
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_APP_ID",
    description: "Firebase web app ID.",
    targets: { server: true, client: true },
    requiredIn: ["preview", "production"],
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    description: "Firebase analytics measurement ID.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    description: "Firebase storage bucket ID exposed to the client.",
    targets: { server: true, client: true },
    requiredIn: ["preview", "production"],
  },
  {
    name: "NEXT_PUBLIC_GTM_CONTAINER_ID",
    description: "Google Tag Manager container ID for analytics.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER",
    description: "Toggle to gate GTM behind a consent banner.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_ENABLE_LEGACY_ADMIN_LOGIN",
    description: "Keep the legacy admin email/password form active.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION",
    description: "When 'true', require email verification before admin login.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS",
    description: "JSON configuration for custom admin roles.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_E2E",
    description: "Set to 'true' to enable deterministic E2E test behaviours.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NEXT_PUBLIC_TEST_MODE",
    description: "Explicit opt-in for client-side test mode fallbacks.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "TEST_MODE",
    description: "Server-side flag to force test mode fallbacks.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NODE_ENV",
    description: "Runtime environment hint propagated to the client bundle.",
    targets: { server: true, client: true },
    requiredIn: [],
  },
  {
    name: "NOTIFY_NEW_SUBMISSION",
    description: "Comma separated list of emails to notify on new submissions.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "CONTACT_REPLY_EMAILS",
    description: "Reply-to addresses used for contact form responses.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "PERSPECTIVE_API_KEY",
    description: "Perspective API key for content moderation.",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "BING_API_KEY",
    description: "Bing Webmaster Tools API key used for IndexNow submissions.",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "INDEXNOW_KEY",
    description: "IndexNow key for search engine notification pings.",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "RSS_ADMIN_CONTACT",
    description: "RSS feed admin contact email (optional metadata).",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "RSS_MANAGING_EDITOR",
    description: "RSS feed managing editor email (optional metadata).",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "SMTP_HOST",
    description: "SMTP host for transactional email delivery.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "SMTP_PORT",
    description: "SMTP port for transactional email delivery.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "SMTP_SECURE",
    description: "Set to 'true' when the SMTP transport uses TLS/SSL.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "SMTP_USER",
    description: "SMTP username used for authentication.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "SMTP_PASS",
    description: "SMTP password used for authentication.",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "VAPID_PUBLIC_KEY",
    description: "Web push public VAPID key for the server worker.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "VAPID_PRIVATE_KEY",
    description: "Web push private VAPID key for the server worker.",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "UPSTASH_REDIS_REST_URL",
    description: "Upstash REST endpoint used for rate limiting and jobs.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "UPSTASH_REDIS_REST_TOKEN",
    description: "Upstash REST token used for rate limiting and jobs.",
    targets: { server: true, client: false },
    requiredIn: [],
    sensitive: true,
  },
  {
    name: "FUNCTIONS_EMULATOR",
    description: "Set to 'true' to route Firebase Admin to the local emulator.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "DEBUG_ADMIN",
    description: "Enable verbose admin logging in development.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
  {
    name: "E2E",
    description: "Set to 'true' when running Playwright end-to-end flows.",
    targets: { server: true, client: false },
    requiredIn: [],
  },
];

export const buildEnvSchema = (target: "server" | "client") => {
  const entries: Array<[string, z.ZodTypeAny]> = [];

  for (const definition of envVarDefinitions) {
    if (!definition.targets[target]) {
      continue;
    }

    entries.push([definition.name, optionalString]);
  }

  return z.object(Object.fromEntries(entries));
};

export const serverEnvSchema = buildEnvSchema("server");
export const clientEnvSchema = buildEnvSchema("client");

export type ServerEnvSchema = typeof serverEnvSchema;
export type ClientEnvSchema = typeof clientEnvSchema;

export const truthyFlags = new Set(["1", "true", "TRUE", "True"]);

export const isValueMissing = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim().length === 0);

export const determineStage = (env: NodeJS.ProcessEnv): EnvStage => {
  if (env.NODE_ENV === "test") {
    return "test";
  }

  const vercelEnv = env.VERCEL_ENV;
  if (vercelEnv === "preview") {
    return "preview";
  }
  if (vercelEnv === "production") {
    return "production";
  }

  if (env.NODE_ENV === "production") {
    return "production";
  }

  return "development";
};

export const isRequiredInStage = (definition: EnvVarDefinition, stage: EnvStage): boolean => {
  if (definition.requiredIn.length === 0) {
    return false;
  }

  if (stage === "test") {
    return false;
  }

  return definition.requiredIn.includes(stage);
};

export interface EnvMissingSummary {
  readonly missingRequired: string[];
  readonly missingOptional: string[];
}

export const collectMissingForTarget = (
  target: "server" | "client",
  stage: EnvStage,
  env: NodeJS.ProcessEnv,
): EnvMissingSummary => {
  const required: string[] = [];
  const optional: string[] = [];
  const groupStatus = new Map<
    string,
    {
      definitions: EnvVarDefinition[];
      missingMembers: string[];
      requiredInStage: boolean;
    }
  >();

  for (const definition of envVarDefinitions) {
    if (!definition.targets[target]) {
      continue;
    }

    const value = env[definition.name];
    const missing = isValueMissing(value);
    const requiredInStage = isRequiredInStage(definition, stage);

    if (definition.group) {
      const status = groupStatus.get(definition.group) ?? {
        definitions: [],
        missingMembers: [],
        requiredInStage: false,
      };

      status.definitions.push(definition);
      if (missing) {
        status.missingMembers.push(definition.name);
      }

      status.requiredInStage = status.requiredInStage || requiredInStage;
      groupStatus.set(definition.group, status);
    }

    if (requiredInStage) {
      if (missing) {
        required.push(definition.name);
      }
    } else if (missing) {
      optional.push(definition.name);
    }
  }

  for (const status of groupStatus.values()) {
    if (!status.requiredInStage) {
      continue;
    }

    const allMissing = status.missingMembers.length === status.definitions.length;
    if (allMissing) {
      continue;
    }

    const definitionNames = new Set(status.definitions.map(definition => definition.name));
    for (let index = required.length - 1; index >= 0; index -= 1) {
      if (definitionNames.has(required[index]!)) {
        required.splice(index, 1);
      }
    }
  }

  return {
    missingRequired: required,
    missingOptional: optional,
  };
};

export const firebaseServiceAccountDefinitions = envVarDefinitions.filter(
  definition => definition.group === "firebaseServiceAccount",
);