#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const pkgJson = JSON.parse(
  await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
);

const packageManager = pkgJson.packageManager ?? '';
const wanted = packageManager.startsWith('pnpm@')
  ? packageManager.split('@')[1]
  : null;

if (!wanted) {
  console.log('No pnpm version pinned in package.json. Skipping check.');
  process.exit(0);
}

const installed = execSync('pnpm -v', { encoding: 'utf8' }).trim();

if (installed !== wanted) {
  console.error(`PNPM version mismatch. want=${wanted} got=${installed}`);
  process.exit(1);
}

console.log(`PNPM version ${installed} matches package.json`);
