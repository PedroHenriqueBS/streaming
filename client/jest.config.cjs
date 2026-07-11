/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  // limita paralelismo — evita picos de memória em máquinas modestas
  maxWorkers: 2,
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  transform: {
    '^.+\\.vue$': '<rootDir>/test/vue-jest-transformer.cjs',
    // type-checking completo fica a cargo do vue-tsc (npm run build)
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json', diagnostics: false }],
  },
  moduleNameMapper: {
    // import.meta is Vite-only syntax; tests always use the mocked config
    '^@/api/config$': '<rootDir>/src/api/__mocks__/config.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}
