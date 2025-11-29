// jest.config.ts
import type { Config } from 'jest';

const web: Config = {
  displayName: 'web',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  testMatch: [
    '<rootDir>/**/__tests__/**/*.test.(ts|tsx|js)',
    '<rootDir>/**/*.test.(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/tests/',
    '<rootDir>/styles/tests/',
    '<rootDir>/functions/',
  ],
  moduleNameMapper: {
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '^@/(.*)$': '<rootDir>/$1',
    '^@website/shared$': '<rootDir>/shared/src',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(svg|png|jpg|jpeg|gif|webp)$': '<rootDir>/test/__mocks__/fileMock.js',
    '^server-only$': '<rootDir>/test/__mocks__/server-only.js',
  },
  testTimeout: 30000,
};

const backend: Config = {
  displayName: 'backend',
  rootDir: '<rootDir>/backend',
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: {
    '^@website/shared$': '<rootDir>/shared/src',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
};

const functions: Config = {
  displayName: 'functions',
  rootDir: '<rootDir>/functions',
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { useESM: true }],
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|jwks-rsa|firebase-admin|firebase-functions)/)',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

const config: Config = {
  projects: [web, backend, functions],
};

export default config;