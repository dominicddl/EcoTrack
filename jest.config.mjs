/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      babelConfig: true
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
}; 