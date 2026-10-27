/** Unit tests (ADR-029). E2E lives in e2e/ and runs with Playwright. */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: { '^yaml$': '<rootDir>/node_modules/yaml/dist/index.js' },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
};
