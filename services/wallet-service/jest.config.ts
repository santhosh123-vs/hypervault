import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/env.ts'],
  moduleNameMapper: {
    '^@hypervault/shared$': '<rootDir>/../../packages/shared/dist',
  },
  testTimeout: 30000,
};

export default config;
