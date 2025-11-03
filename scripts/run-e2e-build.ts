import { spawnSync } from 'node:child_process';
import process from 'node:process';

const env = {
  ...process.env,
  SKIP_STRICT_ENV: process.env.SKIP_STRICT_ENV ?? '1',
  USE_DEFAULT_ENV: process.env.USE_DEFAULT_ENV ?? '1',
  NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? '1',
  NEXT_DISABLE_FONT_OPTIMIZATION: process.env.NEXT_DISABLE_FONT_OPTIMIZATION ?? '1',
};

const result = spawnSync('pnpm', ['-s', 'build'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

if (result.error) {
  throw result.error;
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);