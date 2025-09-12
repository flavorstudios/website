import 'server-only';
import { z } from 'zod';

const schema = z.object({
  CRON_SECRET: z.string().min(1),
  BASE_URL: z.string().url('BASE_URL must be a valid URL'),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CRON_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  CRON_MAX_ATTEMPTS: z.coerce.number().int().positive().optional(),
  CRON_LOG_RETENTION_DAYS: z.coerce.number().int().positive().optional(),
});

const _env = schema.safeParse(process.env);

if (!_env.success) {
  const { fieldErrors } = _env.error.flatten();
  const message = Object.entries(fieldErrors)
    .map(([key, value]) => `${key}: ${value?.join(', ')}`)
    .join('\n');
  if (process.env.NODE_ENV === 'production') {
    console.error('Invalid environment variables\n' + message);
    process.exit(1);
  }
  throw new Error('Invalid environment variables\n' + message);
}

export const env = _env.data;
export const {
  CRON_SECRET,
  BASE_URL,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  CRON_TIMEOUT_MS,
  CRON_MAX_ATTEMPTS,
  CRON_LOG_RETENTION_DAYS,
} = env;
