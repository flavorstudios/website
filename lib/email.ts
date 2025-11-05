import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value: string) => value.toLowerCase());

export type NormalizedEmail = z.infer<typeof emailSchema>;

const emailListSchema = z
  .string()
  .trim()
  .transform((value: string) => (value.length === 0 ? [] : value.split(",")))
  .pipe(z.array(z.string()))
  .transform((values: string[]) =>
    values
      .map((value: string) => emailSchema.parse(value))
      .filter((value: string) => value.length > 0),
  );

export const normalizeEmail = (value: string): NormalizedEmail =>
  emailSchema.parse(value);

export const splitEmailList = (
  list: string | undefined,
): NormalizedEmail[] => {
  if (!list) {
    return [];
  }

  try {
    return emailListSchema.parse(list);
  } catch {
    return [];
  }
};

export const buildEmailSet = (
  ...sources: Array<readonly NormalizedEmail[]>
): ReadonlySet<NormalizedEmail> => {
  const merged: NormalizedEmail[] = sources.flat();
  return new Set(merged);
};

export const getEmailPrefixToken = (email: string): string => {
  const normalized = normalizeEmail(email);
  const prefix = normalized.split("@")[0] ?? "";
  return prefix.replace(/[^a-z0-9]/gi, "_").toUpperCase();
};