import 'whatwg-fetch';
import '@testing-library/jest-dom';
import React from 'react';
import './test-utils/dom-mocks';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}))

const originalFetch = global.fetch

if (typeof window !== 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ categories: [] }) })
  ) as jest.Mock
}

afterAll(() => {
  global.fetch = originalFetch
})

process.env.TEST_MODE = 'true'
process.env["NEXT_PUBLIC_BASE_URL"] = 'http://localhost'
process.env["NEXT_PUBLIC_FIREBASE_API_KEY"] = 'test'
process.env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"] = 'test'
process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"] = 'test'
process.env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"] = 'test-bucket'
process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] = 'test'
process.env["NEXT_PUBLIC_FIREBASE_APP_ID"] = 'test'
process.env.BASE_URL = 'http://localhost'
process.env.NEXT_DISABLE_MINIFY = 'true'

// Silence optional client env var warnings
process.env.NEXT_PUBLIC_E2E = process.env.NEXT_PUBLIC_E2E ?? "false";
process.env.NEXT_PUBLIC_GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? "GTM-TEST";
process.env.NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER = process.env.NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER ?? "false";
process.env.NEXT_PUBLIC_COOKIEYES_ID = process.env.NEXT_PUBLIC_COOKIEYES_ID ?? "cookieyes-test";
process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "vapid-test";
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-TEST";
process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES = process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES ?? "/admin";
process.env.NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS = process.env.NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS ?? "{}";
process.env.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION = process.env.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION ?? "false";
process.env.NEXT_PUBLIC_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE ?? "true";

jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect?: (date: Date) => void }) =>
    React.createElement('button', { onClick: () => onSelect?.(new Date()) }, 'calendar'),
}))
