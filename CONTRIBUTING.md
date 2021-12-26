# Contributing guide

Contributions are welcome. Please have a look at the first contributions
[help guide](https://github.com/firstcontributions/first-contributions) if you
are new to contributing.

## <a name="branching-strategy"> Branching strategy

This project uses [trunk based development](https://trunkbaseddevelopment.com/).
Features should be merged via pull requests to the `main` branch.

## <a name="commit-message-format"></a> Commit Message Format

> Inspired by the
> [AngularJS contributing guide](https://github.com/angular/angular/blob/master/CONTRIBUTING.md).

IMPORTANT: As the changelog is generated from commits, please ensure that
contributions follow these conventions, or your contribution may not be accepted
until it is corrected.

Commits are linted using
[commintlint](https://github.com/conventional-changelog/commitlint). Each commit
message consists of a header, a body, and a footer.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `header` is mandatory and must conform to the
[Commit Message Header](#commit-header) format.

The `body` is mandatory for all commits except for those of type "docs". When
the body is present it must be at least 20 characters long and must conform to
the [Commit Message Body](#commit-body) format.

The `footer` is optional. The [Commit Message Footer](#commit-footer) format
describes what the footer is used for and the structure it must have.

Any line of the commit message cannot be longer than 100 characters.

### <a name="commit-header"></a> Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Optional Commit Scope: <package_name>
  │
  └─⫸ Commit Type: feat|fix|chore|test|docs|tooling|revert
```

The `<type>` and `<summary>` fields are mandatory, the (`<scope>`) field is
optional.

#### Type

Must be one of the following:

- **feat**: A new feature
- **feat!**: A new feature with a breaking change
- **fix**: A bug fix
- **chore**: Code maintenance changes that do not change functionality
- **wip**: Work in progress commit
- **test**: Add missing tests or changing existing tests
- **docs**: Documentation only changes
- **tooling**: Changes that affect the development tooling, build scripts or
  configuration
- **revert**: Reverts a previous commit

#### Scope

The scope should be the name of the package affected (as perceived by the person
reading the changelog generated from commit messages). A package is the name of
any top-level folder in the `packages` directory.

The only exception to the rule of using the package name as the scope is when
there are tooling changes made that are either not related to a specific package
(e.g. changes to `scripts`, `README.md` etc.), or tooling changes that are done
across all packages. For these instances, the scope may be empty.

#### Summary

Use the summary field to provide a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

### <a name="commit-footer"></a>Commit Message Footer

The footer can contain information about breaking changes and is also the place
to reference GitHub issues, Jira tickets, and other PRs that this commit closes
or is related to.

### <a name='revert-commits'></a> Revert commits

If the commit reverts a previous commit, it should begin with `revert: `,
followed by the header of the reverted commit.

The content of the commit message body should contain:

- information about the SHA of the commit being reverted in the following
  format: `This reverts commit <SHA>`,
- a clear description of the reason for reverting the commit.

## <a name="typescript-style-guide"> TypeScript Style guide

All TypeScript code is linted with [Prettier](https://prettier.io/). Most
configuration settings are set to [the recommended
defaults](https://prettier.io/docs/en/options.html). Please see
`.prettierrc.yaml` for any customised configuration.
