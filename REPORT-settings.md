# Settings Module Boundary Audit

## A.1 – Importers of `@/lib/settings`
| Importer | Kind | Exports Used |
| --- | --- | --- |
| `app/admin/dashboard/settings/page.tsx` | App router server component | `getCurrentAdminUid` |
| `app/admin/dashboard/settings/actions.ts` | Server action (`"use server"`) | `DEFAULT_APPEARANCE`, `getContrastRatio`, `getCurrentAdminUid`, `readUserSettings`, `writeUserSettings` |
| `components/admin/settings/AvatarUploader.tsx` | Client component (`"use client"`) | `initialsFromName`, `hashAvatar` |
| `components/admin/settings/AppearanceForm.tsx` | Client component (`"use client"`) | `getContrastRatio` |
| `lib/__tests__/settings.test.ts` | Jest (jsdom) unit tests | `DEFAULT_NOTIFICATIONS`, `getContrastRatio`, `mergeSettings` |

## A.2 – Export classification from legacy `lib/settings.ts`
| Export | Classification | Notes |
| --- | --- | --- |
| `DEFAULT_APPEARANCE` | Universal | Pure data |
| `DEFAULT_NOTIFICATIONS` | Universal | Pure data |
| `DEFAULT_PROFILE` | Universal | Pure data |
| `DEFAULT_USER_SETTINGS` | Universal | Pure data (timestamp captured at module eval) |
| `ContrastResult` | Universal | Type alias |
| `getContrastRatio` | Universal | Pure math |
| `ensureAccessibleAccent` | Universal | Validates ratio |
| `initialsFromName` | Universal | Pure string helper |
| `sanitizeProfileInput` | Universal | Zod validation + trimming |
| `sanitizeNotificationsInput` | Universal | Zod validation |
| `sanitizeAppearanceInput` | Universal | Zod validation + contrast check |
| `mergeSettings` | Universal | Object merge |
| `getSettingsDocRef` | Server-only | Requires Firestore + React `cache` |
| `getCurrentAdminUid` | Server-only | Reads `next/headers` cookies + admin auth |
| `readUserSettings` | Server-only | Firestore reads |
| `writeUserSettings` | Server-only | Firestore transactions |
| `hashAvatar` | Ambiguous | Used by clients but depends on Node `crypto` |

## A.3 – Client/server boundary violations before fix
| File | Issue |
| --- | --- |
| `components/admin/settings/AvatarUploader.tsx` | Client component pulled `hashAvatar` from `@/lib/settings`, bundling Node `crypto`. |
| `components/admin/settings/AppearanceForm.tsx` | Client component imported `getContrastRatio` via the mixed barrel, pulling `server-only` sentinels into the client graph. |

_No direct client imports of `next/headers`, `next/cookies`, or Firebase Admin were found outside of the settings barrel usage._

## A.4 – Pages directory status
The repository is App Router–only; no `pages/` directory exists. All admin settings routes live under `app/admin/**`.