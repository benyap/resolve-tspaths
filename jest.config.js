module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ["js", "ts"],
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
  },
  testEnvironment: "node",
  testRegex: "\\.(test|spec)\\.ts$",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  transformIgnorePatterns: ["/node_modules/"],
};
