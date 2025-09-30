const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/tests/jest.setup.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // 🟩 Codex update: Ignore serverless/functions code during tests!
  // Allow a single Jest spec in the Playwright tests directory
  testPathIgnorePatterns: [
    '<rootDir>/functions/',
    '<rootDir>/tests/(?!validate-session\\.spec\\.ts$|firebase-admin\\.test\\.ts$|storage\\.rules\\.test\\.ts$|cron\\.spec\\.ts$|media-lib\\.test\\.ts$|admin-dashboard-prefetch\\.spec\\.tsx$).*',
    '<rootDir>/styles/tests/',
    '<rootDir>/e2e/',
  ],
}

module.exports = createJestConfig(customJestConfig)
