module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/unit'],
  moduleFileExtensions: ['ts', 'js', 'json', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^lern-ui-kit$': '<rootDir>/tests/unit/mocks/ui-kit-mock.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: {
          target: 'ES2020',
          module: 'commonjs',
          strict: false,
          esModuleInterop: true,
          jsx: 'preserve',
          types: ['jest', 'node'],
        },
      },
    ],
  },
}
