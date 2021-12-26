module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "chore", "wip", "test", "docs", "tooling", "revert"],
    ],
  },
};
