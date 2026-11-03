module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  setupFiles: ['<rootDir>/tests/unit/helpers/setup-env.ts'],
  // tsconfig ограничивает rootDir папкой src, для тестов он не нужен
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs', target: 'es2020', esModuleInterop: true, strict: true, skipLibCheck: true } }],
  },
  clearMocks: true,
}
