import '@testing-library/jest-dom';
import React from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({ json: () => Promise.resolve({ categories: [] }) })
) as jest.Mock

process.env.TEST_MODE = 'true'

jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect?: (date: Date) => void }) =>
    React.createElement('button', { onClick: () => onSelect?.(new Date()) }, 'calendar'),
}))
