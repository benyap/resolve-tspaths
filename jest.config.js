module.exports = {
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  preset: "ts-jest",
  moduleFileExtensions: ["js", "ts"],
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
  },
  testEnvironment: "node",
  testRegex: "\\.(test|spec)\\.ts$",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/"],
};
