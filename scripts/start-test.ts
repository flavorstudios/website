import { spawn } from 'node:child_process';

const port = process.env.PORT ?? '3000';

const nextCommand = process.env.NEXT_E2E_COMMAND ?? 'dev';

const child = spawn('pnpm', ['next', nextCommand, '-p', port], {
  stdio: 'inherit',
  env: {
    ...process.env,
    E2E: process.env.E2E ?? 'true',
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? '1',
    NODE_ENV: 'test',
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error('Failed to launch Next.js for E2E tests', error);
  process.exit(1);
});