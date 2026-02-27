/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/lib"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
  clearMocks: true,
  restoreMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/lib/theme.ts",
    "src/lib/services.ts",
    "src/lib/insights.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
