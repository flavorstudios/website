// jest.setup.ts
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import React from 'react';
import { webcrypto } from 'crypto';
import { TextDecoder, TextEncoder } from 'util';

// Mock next/navigation for App Router so components using useRouter() render in tests
jest.mock('next/navigation', () => {
  const params = new URLSearchParams();
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => params,
  };
});

// Optional: mock ResizeObserver if any charts/components rely on it
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: ResizeObserverMock,
  });
}

Object.defineProperty(globalThis, 'crypto', {
  configurable: true,
  writable: true,
  value: webcrypto,
});

if (typeof globalThis.TextEncoder === 'undefined') {
  Object.defineProperty(globalThis, 'TextEncoder', {
    configurable: true,
    value: TextEncoder,
  });
}

if (typeof globalThis.TextDecoder === 'undefined') {
  Object.defineProperty(globalThis, 'TextDecoder', {
    configurable: true,
    value: TextDecoder,
  });
}

process.env.TEST_MODE = 'true';
process.env['NEXT_PUBLIC_BASE_URL'] = 'http://localhost';
process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] = 'test';
process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] = 'test';
process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'test';
process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] = 'test-bucket';
process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] = 'test';
process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] = 'test';
process.env.BASE_URL = 'http://localhost';
process.env.NEXT_DISABLE_MINIFY = 'true';
process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? 'test-admin-secret';
process.env.CRON_SECRET = process.env.CRON_SECRET ?? 'test-cron-secret';
process.env.PREVIEW_SECRET = process.env.PREVIEW_SECRET ?? 'test-preview-secret';

// Silence optional client env var warnings
process.env.NEXT_PUBLIC_E2E = process.env.NEXT_PUBLIC_E2E ?? 'false';
process.env.NEXT_PUBLIC_GTM_CONTAINER_ID =
  process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? 'GTM-TEST';
process.env.NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER =
  process.env.NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER ?? 'false';
process.env.NEXT_PUBLIC_COOKIEYES_ID =
  process.env.NEXT_PUBLIC_COOKIEYES_ID ?? 'cookieyes-test';
process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? 'vapid-test';
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-TEST';
process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES =
  process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES ?? '/admin';
process.env.NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS =
  process.env.NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS ?? '{}';
process.env.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION =
  process.env.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION ?? 'false';
process.env.NEXT_PUBLIC_TEST_MODE =
  process.env.NEXT_PUBLIC_TEST_MODE ?? 'true';

jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect?: (date: Date) => void }) =>
    React.createElement('button', { onClick: () => onSelect?.(new Date()) }, 'calendar'),
}));
