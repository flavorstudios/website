import '@testing-library/jest-dom';
import React from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
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
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test'
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test'
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket'
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test'
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test'

jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect?: (date: Date) => void }) =>
    React.createElement('button', { onClick: () => onSelect?.(new Date()) }, 'calendar'),
}))
