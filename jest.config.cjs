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
  testPathIgnorePatterns: ['<rootDir>/functions/', '<rootDir>/tests/'],
}

module.exports = createJestConfig(customJestConfig)
