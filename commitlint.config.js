module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "wip",
        "deps",
        "test",
        "docs",
        "tooling",
        "revert",
      ],
    ],
  },
};
