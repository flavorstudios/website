const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // 🟩 Codex update: Ignore serverless/functions code during tests!
  // Allow a single Jest spec in the Playwright tests directory
  testPathIgnorePatterns: [
    '<rootDir>/functions/',
    '<rootDir>/tests/(?!validate-session\\.spec\\.ts$).*',
    '<rootDir>/styles/tests/',
  ],
}

module.exports = createJestConfig(customJestConfig)
